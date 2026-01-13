import { NextRequest, NextResponse } from 'next/server';
import type { ChatMessage, TokenUsage } from '@/types/chat';
import { logToBlob, createLogEntry, estimateCost } from '@/lib/logger';

const DEFAULT_API_GATEWAY_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiGatewayKey = process.env.API_GATEWAY_KEY;
    
    // If no API key, return a helpful message
    if (!apiGatewayKey) {
      const responseMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Chat console is in demo mode. Configure API_GATEWAY_KEY to enable AI chat. Currently showing system logs and scan information.',
        timestamp: new Date().toISOString(),
      };
      
      return NextResponse.json({ 
        success: true,
        message: responseMessage
      });
    }

    // Build conversation context with system prompt
    const systemPrompt = `You are a helpful assistant for the MVP Launcher system. You help debug scanning operations, explain costs, and provide insights about Reddit trend scanning.

Current system status:
- Environment: ${process.env.NODE_ENV || 'development'}
- API Gateway: ${apiGatewayKey ? 'Configured' : 'Not configured'}
- Blob Storage: ${process.env.BLOB_READ_WRITE_TOKEN ? 'Configured' : 'Not configured'}
- Slack Webhook: ${process.env.SLACK_WEBHOOK ? 'Configured' : 'Not configured'}`;

    const messages = [
      {
        role: 'user' as const,
        content: systemPrompt + '\n\nUser question: ' + message
      }
    ];

    // Call API Gateway (Claude/Haiku)
    const response = await fetch(
      process.env.API_GATEWAY_URL || DEFAULT_API_GATEWAY_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiGatewayKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages,
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Gateway error:', errorText);
      
      // Log error
      await logToBlob(createLogEntry(
        'error',
        'Failed to get AI response in chat',
        { error: errorText }
      ));
      
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Extract the generated content and usage with validation
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('Invalid response format from API Gateway:', data);
      await logToBlob(createLogEntry(
        'error',
        'Invalid response format from AI service',
        { response: data }
      ));
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    const content = data.content[0]?.text || '';
    const usage: TokenUsage = {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
    
    const cost = estimateCost('claude-3-haiku-20240307', usage);

    const responseMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        tokenUsage: usage,
        cost,
        model: 'claude-3-haiku-20240307',
      },
    };

    // Log the AI call
    await logToBlob(createLogEntry(
      'ai_call',
      'Agent chat interaction',
      { 
        userMessage: message,
        responseLength: content.length,
        model: 'claude-3-haiku-20240307'
      },
      cost,
      usage
    ));

    return NextResponse.json({ 
      success: true,
      message: responseMessage
    });

  } catch (error) {
    console.error('Error in agent chat:', error);
    
    // Log error
    await logToBlob(createLogEntry(
      'error',
      'Agent chat error',
      { error: error instanceof Error ? error.message : String(error) }
    ));
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
