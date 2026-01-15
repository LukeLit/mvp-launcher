import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

// Reddit Trend Scanner API Route
// This endpoint scans Reddit for trending micro-SaaS ideas
export async function GET() {
  try {
    // Check if scanning is enabled in admin settings
    const settings = await getSettings();
    if (!settings.scanEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Scanning is currently disabled. Enable it in admin settings.',
        data: []
      }, { status: 403 });
    }
    // Mock implementation for now - returns sample trends
    // In production, this would:
    // 1. Authenticate with Reddit API using REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET
    // 2. Scan target subreddits (r/SaaS, r/indiehackers, r/SideProject)
    // 3. Filter posts with AI (Haiku via API_GATEWAY_KEY) for micro-SaaS ideas
    // 4. Rank and return top 3-5 ideas

    const mockTrends = [
      {
        id: '1',
        idea: 'AI Podcast Clipper',
        summary: 'Tool to auto-clip and summarize podcast highlights for social media sharing',
        url: 'https://reddit.com/r/SaaS/example1',
        score: 85,
        suggested_pricing: '$9/mo'
      },
      {
        id: '2',
        idea: 'Email Priority Sorter',
        summary: 'AI-powered email categorization that highlights urgent messages and filters noise',
        url: 'https://reddit.com/r/indiehackers/example2',
        score: 72,
        suggested_pricing: '$7/mo'
      },
      {
        id: '3',
        idea: 'Meeting Notes Automator',
        summary: 'Automatically generate action items and summaries from video meetings',
        url: 'https://reddit.com/r/SideProject/example3',
        score: 91,
        suggested_pricing: '$12/mo'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockTrends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scanning trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
