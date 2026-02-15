# Deployment Instructions

## Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `wheza99/ai-chat-app`
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `GROQ_API_KEY` - Your Groq API key
   - `REPLICATE_API_TOKEN` - Your Replicate API token
   - `APIFY_API_TOKEN` - Your Apify API token
5. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Setup Required Services

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Get your credentials from Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Groq Setup

1. Go to [console.groq.com](https://console.groq.com)
2. Create an API key
3. Set `GROQ_API_KEY`

### 3. Replicate Setup

1. Go to [replicate.com](https://replicate.com)
2. Create an API token at Account Settings
3. Set `REPLICATE_API_TOKEN`

### 4. Apify Setup

1. Go to [console.apify.com](https://console.apify.com)
2. Create an API token at Integrations
3. Set `APIFY_API_TOKEN`

## GitHub Repository

- Repository: https://github.com/wheza99/ai-chat-app
