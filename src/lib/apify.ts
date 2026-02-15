import { ApifyClient } from 'apify-client';
import type { InstagramPost, InstagramScraperResult } from '@/types';

// Lazy initialization to avoid build-time errors
let apifyClientInstance: ApifyClient | null = null;

function getApifyClient(): ApifyClient {
  if (!apifyClientInstance) {
    apifyClientInstance = new ApifyClient({
      token: process.env.APIFY_API_TOKEN || 'placeholder-token',
    });
  }
  return apifyClientInstance;
}

// Instagram Scraper Actor ID
const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';

export async function scrapeInstagramPopular(
  query: string,
  limit: number = 10
): Promise<InstagramScraperResult> {
  try {
    console.log('Scraping Instagram for:', query);
    
    const client = getApifyClient();
    
    // Determine if it's a hashtag or username
    const isHashtag = query.startsWith('#');
    const cleanQuery = isHashtag ? query.slice(1) : query;

    const input: any = {
      resultsLimit: limit,
      addParentData: false,
    };

    if (isHashtag) {
      input.search = cleanQuery;
      input.searchLimit = limit;
      input.searchType = 'hashtag';
    } else {
      input.usernames = [cleanQuery];
    }

    // Run the Actor and wait for it to finish
    const run = await client.actor(INSTAGRAM_SCRAPER_ACTOR).call(input);

    // Fetch results from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    const posts: InstagramPost[] = items.slice(0, limit).map((item: any) => ({
      id: item.id || '',
      caption: item.caption || '',
      likes_count: item.likesCount || item.likes_count || 0,
      comments_count: item.commentsCount || item.comments_count || 0,
      display_url: item.displayUrl || item.display_url || item.imageUrl || '',
      owner_username: item.ownerUsername || item.owner?.username || '',
      timestamp: item.timestamp || new Date().toISOString(),
    }));

    return {
      posts,
      status: 'success',
    };
  } catch (error: any) {
    console.error('Error scraping Instagram:', error);
    return {
      posts: [],
      status: 'error',
    };
  }
}

export default getApifyClient();
