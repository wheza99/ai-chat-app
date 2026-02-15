import OpenAI from 'openai';

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const MODEL = 'llama-3.3-70b-versatile';

// Tool definitions for Groq
export const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'generate_image',
      description: 'Generate an image using AI based on a text prompt. Use this when the user wants to create or generate an image.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The text description of the image to generate',
          },
        },
        required: ['prompt'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'scrape_instagram_popular',
      description: 'Search for popular Instagram posts based on a hashtag or username. Use this when the user wants to find trending content on Instagram.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The hashtag (with #) or username to search for',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of posts to retrieve (default: 10)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'replicate_instagram_image',
      description: 'Generate a new image based on an Instagram post. Use this to create AI-generated variations of popular Instagram content.',
      parameters: {
        type: 'object',
        properties: {
          post_caption: {
            type: 'string',
            description: 'The caption from the Instagram post to use as inspiration',
          },
          style: {
            type: 'string',
            description: 'Additional style instructions for the generated image (optional)',
          },
        },
        required: ['post_caption'],
      },
    },
  },
];

export async function createChatCompletion(
  messages: Array<{ role: string; content: string; tool_calls?: any[]; tool_call_id?: string }>,
  useTools: boolean = true
) {
  const response = await groqClient.chat.completions.create({
    model: MODEL,
    messages: messages as any,
    tools: useTools ? tools : undefined,
    tool_choice: useTools ? 'auto' : undefined,
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response;
}

export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
) {
  const stream = await groqClient.chat.completions.create({
    model: MODEL,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      onChunk(content);
    }
  }
}

export default groqClient;
