import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { createConversation, streamConversation } from '@/lib/agent';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationHistory, stream = false } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Convert conversation history to LangChain messages
    const messages: (HumanMessage | AIMessage)[] = [];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.type === 'human') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.type === 'ai') {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    // Add user context to the system message
    const userContext = `Current user information:
- User ID: ${session.user.id}
- User Email: ${session.user.email}
- User Name: ${session.user.name}

When accessing the user's watchlist, use the get_user_watchlist tool with userId: "${session.user.id}"`;

    // Add system message with user context if not already present
    const hasSystemMessage = messages.some(msg => msg instanceof SystemMessage);
    if (!hasSystemMessage) {
      messages.unshift(new SystemMessage(userContext));
    }

    // Add the current user message
    messages.push(new HumanMessage(message));

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const conversationStream = await streamConversation(messages);
            
            for await (const chunk of conversationStream) {
              const lastMessage = chunk.messages[chunk.messages.length - 1];
              if (lastMessage instanceof AIMessage) {
                const data = JSON.stringify({
                  type: 'chunk',
                  content: lastMessage.content,
                  toolCalls: lastMessage.tool_calls || []
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            
            controller.enqueue(encoder.encode(`data: {"type": "done"}\n\n`));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Handle regular response
      const result = await createConversation(messages);
      const lastMessage = result[result.length - 1];
      
      if (lastMessage instanceof AIMessage) {
        return NextResponse.json({
          response: lastMessage.content,
          toolCalls: lastMessage.tool_calls || [],
          success: true
        });
      } else {
        return NextResponse.json({
          error: 'Unexpected response type',
          success: false
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false
    }, { status: 500 });
  }
}