import { NextRequest, NextResponse } from 'next/server';
import type { GeneratedCopy } from '@/types/trend';

const DEFAULT_API_GATEWAY_URL = 'https://api.anthropic.com/v1/messages';

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
    
    // If no API key, use fallback mock generation for demo purposes
    if (!apiGatewayKey) {
      const fallbackCopy = {
        headline: `${idea}: Transform Your Workflow Today`,
        description: `${summary}. Join hundreds of satisfied users who have already streamlined their processes and boosted productivity.`,
        cta: 'Start Free Trial'
      };
      
      return NextResponse.json({ 
        success: true,
        data: fallbackCopy 
      });
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
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      }
    );

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
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate structure
        if (parsed.headline && parsed.description && parsed.cta) {
          generatedCopy = parsed;
        } else {
          throw new Error('Invalid JSON structure');
        }
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
