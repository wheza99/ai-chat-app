import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/groq';
import { generateImage } from '@/lib/replicate';
import { scrapeInstagramPopular } from '@/lib/apify';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Save user message to database
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === 'user') {
      await supabase.from('messages').insert({
        id: uuidv4(),
        chat_id: chatId,
        role: 'user',
        content: lastUserMessage.content,
        created_at: new Date().toISOString(),
      });
    }

    // Call Groq with tool support
    const response = await createChatCompletion(messages, true);
    const assistantMessage = response.choices[0].message;

    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: any[] = [];

      // Process each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        // Type guard for function tool call
        if (toolCall.type !== 'function') continue;
        
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        let result: any;

        switch (functionName) {
          case 'generate_image': {
            result = await generateImage(args.prompt);
            break;
          }
          case 'scrape_instagram_popular': {
            result = await scrapeInstagramPopular(args.query, args.limit || 10);
            break;
          }
          case 'replicate_instagram_image': {
            // First generate the image based on the post caption
            const enhancedPrompt = `${args.post_caption}. ${args.style || 'Create a creative variation.'}`;
            result = await generateImage(enhancedPrompt);
            break;
          }
          default:
            result = { error: `Unknown function: ${functionName}` };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });

        // Save tool call result to database
        await supabase.from('messages').insert({
          id: uuidv4(),
          chat_id: chatId,
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
          created_at: new Date().toISOString(),
        });
      }

      // Send tool results back to Groq for final response
      const messagesWithToolResults = [
        ...messages,
        {
          role: 'assistant',
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResults.map((tr) => ({
          role: 'tool',
          tool_call_id: tr.tool_call_id,
          content: tr.content,
        })),
      ];

      const finalResponse = await createChatCompletion(messagesWithToolResults as any, false);
      const finalMessage = finalResponse.choices[0].message;

      // Save assistant response to database
      await supabase.from('messages').insert({
        id: uuidv4(),
        chat_id: chatId,
        role: 'assistant',
        content: finalMessage.content || '',
        tool_calls: assistantMessage.tool_calls,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        message: finalMessage.content,
        toolCalls: assistantMessage.tool_calls,
        toolResults,
      });
    }

    // No tool calls - save and return direct response
    await supabase.from('messages').insert({
      id: uuidv4(),
      chat_id: chatId,
      role: 'assistant',
      content: assistantMessage.content || '',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: assistantMessage.content,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}
