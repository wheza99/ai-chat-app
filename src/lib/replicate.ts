import Replicate from 'replicate';

// Lazy initialization to avoid build-time errors
let replicateInstance: Replicate | null = null;

function getReplicate(): Replicate {
  if (!replicateInstance) {
    replicateInstance = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || 'placeholder-token',
    });
  }
  return replicateInstance;
}

// PrunaAI p-image model for image generation
const IMAGE_MODEL = 'prunaai/p-image';

export async function generateImage(prompt: string): Promise<{ image_url: string; status: 'success' | 'error'; error?: string }> {
  try {
    console.log('Generating image with prompt:', prompt);
    
    const output = await getReplicate().run(
      IMAGE_MODEL,
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'webp',
          output_quality: 90,
        },
      }
    ) as string[];

    if (output && output.length > 0) {
      return {
        image_url: output[0],
        status: 'success',
      };
    }

    return {
      image_url: '',
      status: 'error',
      error: 'No image generated',
    };
  } catch (error: any) {
    console.error('Error generating image:', error);
    return {
      image_url: '',
      status: 'error',
      error: error.message || 'Failed to generate image',
    };
  }
}

export default getReplicate();
