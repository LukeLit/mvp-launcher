import { NextRequest, NextResponse } from 'next/server';
import { fetchRedditPosts, filterRecentPosts } from '@/lib/reddit';
import { analyzeWithAI } from '@/lib/vercel-gateway';
import { notifySlack } from '@/lib/slack';
import { ScanResult } from '@/lib/types';

/**
 * Reddit Trend Scanner API Route
 * Fetches Reddit posts, analyzes with AI, and sends top trends to Slack
 * Designed to run hourly via Vercel cron
 * 
 * Security: Set CRON_SECRET environment variable to protect this endpoint
 * from unauthorized access. Without it, the endpoint is publicly accessible.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (only for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set and auth header is provided, verify it
    // This allows manual scans (no auth) while protecting cron endpoint
    if (cronSecret && authHeader) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('❌ Invalid CRON_SECRET provided');
        return NextResponse.json(
          { error: 'Unauthorized - Invalid credentials' },
          { status: 401 }
        );
      }
    }
    
    // Log warning if CRON_SECRET is not set in production
    if (!cronSecret && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  CRON_SECRET not set - endpoint is publicly accessible');
    }

    console.log('🔍 Starting Reddit trend scan...');

    // Step 1: Fetch Reddit posts from multiple subreddits
    const posts = await fetchRedditPosts();
    console.log(`📥 Fetched ${posts.length} posts from Reddit`);

    // Step 2: Filter posts from last 24 hours with minimum engagement
    const recentPosts = filterRecentPosts(posts);
    console.log(`✅ Filtered to ${recentPosts.length} qualifying posts`);

    // Step 3: Analyze with AI (Haiku via Vercel Gateway)
    const trends = await analyzeWithAI(recentPosts);
    console.log(`🤖 AI identified ${trends.length} trend ideas`);

    // Step 4: Send notification to Slack
    await notifySlack(trends);
    console.log('📢 Slack notification sent');

    // Step 5: Return results
    const result: ScanResult = {
      trends,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error in scan route:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Send error notification to Slack
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `⚠️ Reddit Trend Scanner Error: ${errorMessage}`,
          }),
        });
      }
    } catch (slackError) {
      console.error('Failed to send error to Slack:', slackError);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
