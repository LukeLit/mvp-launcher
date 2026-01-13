import { NextResponse } from 'next/server';
import { logToBlob, createLogEntry } from '@/lib/logger';
import { fetchRedditPosts, filterRecentPosts } from '@/lib/reddit';
import { analyzeWithAI } from '@/lib/vercel-gateway';

// Reddit Trend Scanner API Route
// This endpoint scans Reddit for trending micro-SaaS ideas
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Log scan start
    await logToBlob(createLogEntry(
      'scan',
      'Starting Reddit scan',
      { 
        timestamp: new Date().toISOString(),
        redditApiConfigured: !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
        aiGatewayConfigured: !!process.env.API_GATEWAY
      }
    ));

    // Fetch posts from Reddit using public JSON API (no authentication required)
    const allPosts = await fetchRedditPosts(['SaaS', 'indiehackers', 'SideProject', 'Entrepreneur'], 20);
    
    await logToBlob(createLogEntry(
      'reddit_fetch',
      `Fetched ${allPosts.length} posts from Reddit`,
      { postCount: allPosts.length }
    ));

    // Filter to recent posts with minimum engagement
    const recentPosts = filterRecentPosts(allPosts, 10, 3, 24);
    
    await logToBlob(createLogEntry(
      'info',
      `Filtered to ${recentPosts.length} qualifying posts (min 10 upvotes, 3 comments, last 24h)`,
      { filteredCount: recentPosts.length }
    ));

    // Analyze posts with AI to extract micro-SaaS ideas
    const trends = await analyzeWithAI(recentPosts);

    const duration = Date.now() - startTime;
    
    if (trends.length === 0) {
      // Log no results found
      await logToBlob(createLogEntry(
        'scan',
        'Scan completed: No qualifying trends found',
        { 
          trendsFound: 0,
          duration: `${duration}ms`,
          totalPosts: allPosts.length,
          filteredPosts: recentPosts.length,
          aiConfigured: !!process.env.API_GATEWAY
        }
      ));

      return NextResponse.json({
        success: true,
        data: [],
        message: 'No qualifying posts found—check filters (min 10 upvotes, 3 comments, last 24h)',
        timestamp: new Date().toISOString()
      });
    }

    // Log successful scan
    await logToBlob(createLogEntry(
      'scan',
      `Scan completed: ${trends.length} trends found`,
      { 
        trendsFound: trends.length,
        duration: `${duration}ms`,
        totalPosts: allPosts.length,
        filteredPosts: recentPosts.length,
        trends: trends.map(t => ({ idea: t.idea, score: t.score }))
      }
    ));

    // Add IDs to trends for frontend compatibility
    const trendsWithIds = trends.map((trend, index) => ({
      id: `trend-${Date.now()}-${index}`,
      ...trend
    }));

    return NextResponse.json({
      success: true,
      data: trendsWithIds,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scanning trends:', error);
    
    // Log error
    await logToBlob(createLogEntry(
      'error',
      'Scan failed',
      { 
        error: error instanceof Error ? error.message : String(error),
        duration: `${Date.now() - startTime}ms`
      }
    ));
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
