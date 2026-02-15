# AI Chat App

A modern AI chat application built with Next.js, featuring:

- 🤖 **AI Chat** powered by Groq (Llama 3.3 70B)
- 🎨 **Image Generation** using Replicate (PrunaAI p-image)
- 📸 **Instagram Integration** via Apify Instagram Scraper
- 🔐 **Authentication** with Supabase Auth
- 💾 **Persistent Chat History** stored in Supabase PostgreSQL
- 🎯 **Tool Calling** - AI can use tools to generate images, scrape Instagram, and more

## Features

### AI Chat with Tools
The AI assistant can:
- **Generate images** - "Generate an image of a sunset over mountains"
- **Search Instagram** - "Search Instagram for #nature photography"
- **Replicate Instagram content** - "Find popular posts about food and create AI variations"

### Authentication
- Email/Password signup and signin
- Secure session management with Supabase

### Chat Management
- Create multiple chat sessions
- Chat history persistence
- Delete chats

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B)
- **Image Generation**: Replicate (PrunaAI p-image)
- **Web Scraping**: Apify (Instagram Scraper)
- **Backend**: Supabase (Auth, Database)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 3. Get API Keys

- **Groq**: [console.groq.com](https://console.groq.com)
- **Replicate**: [replicate.com](https://replicate.com/account/api-tokens)
- **Apify**: [console.apify.com](https://console.apify.com/account#/integrations)

### 4. Environment Variables

Copy `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
REPLICATE_API_TOKEN=your_replicate_api_token
APIFY_API_TOKEN=your_apify_api_token
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Examples

### Generate an Image
```
User: Generate an image of a cyberpunk city at night
AI: [Uses generate_image tool] Here's your cyberpunk city!
```

### Search Instagram
```
User: Search Instagram for #sunset posts
AI: [Uses scrape_instagram_popular tool] I found these popular sunset posts...
```

### Replicate Instagram Content
```
User: Find popular food posts and create an AI version
AI: [Uses both tools] Here's an AI-generated version inspired by the popular food post!
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts      # Auth endpoints
│   │   ├── chat/route.ts      # Chat endpoints
│   │   └── chats/route.ts     # Chat management
│   ├── layout.tsx
│   └── page.tsx               # Main page
├── components/
│   ├── auth/                  # Auth components
│   ├── chat/                  # Chat UI components
│   └── tools/                 # Tool result components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── apify.ts              # Apify Instagram scraper
│   ├── groq.ts               # Groq AI client
│   ├── replicate.ts          # Replicate image generation
│   └── supabase.ts           # Supabase client
└── types/
    └── index.ts              # TypeScript types
```

## Deployment

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Make sure to set all environment variables in Vercel dashboard.

## License

MIT
