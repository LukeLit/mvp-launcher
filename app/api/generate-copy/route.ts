import { NextRequest, NextResponse } from 'next/server';
import type { GeneratedCopy } from '@/types/trend';

export async function POST(request: NextRequest) {
  try {
    const { idea, summary } = await request.json();

    if (!idea || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: idea and summary' },
        { status: 400 }
      );
    }

    const apiGatewayKey = process.env.API_GATEWAY_KEY;
    
    if (!apiGatewayKey) {
      return NextResponse.json(
        { error: 'API_GATEWAY_KEY not configured' },
        { status: 500 }
      );
    }

    // Prepare the prompt for Claude/Haiku
    const prompt = `You are a copywriter creating compelling marketing copy for a micro-SaaS product.

Product Idea: ${idea}
Product Summary: ${summary}

Generate marketing copy with the following structure (respond with valid JSON only):
{
  "headline": "A catchy, benefit-focused headline (max 60 characters)",
  "description": "A compelling 2-3 sentence description highlighting the main value proposition",
  "cta": "A strong call-to-action button text (max 20 characters)"
}

Focus on pain points solved, benefits delivered, and urgency. Make it conversion-optimized.`;

    // Call API Gateway (Claude/Haiku)
    const response = await fetch(process.env.API_GATEWAY_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiGatewayKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Gateway error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate copy from AI service' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Extract the generated content
    let generatedCopy: GeneratedCopy;
    try {
      const content = data.content[0].text;
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedCopy = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to default copy
      generatedCopy = {
        headline: `${idea} - Automate Your Workflow`,
        description: `${summary}. Get started today and boost your productivity.`,
        cta: 'Get Started Now'
      };
    }

    return NextResponse.json({ 
      success: true,
      data: generatedCopy 
    });

  } catch (error) {
    console.error('Error generating copy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
