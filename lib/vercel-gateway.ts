import { TrendIdea, RedditPost } from './types';

/**
 * Calls Vercel Gateway API to analyze Reddit posts using Haiku model
 * Returns filtered and ranked trend ideas
 */
export async function analyzeWithAI(posts: RedditPost[]): Promise<TrendIdea[]> {
  const apiKey = process.env.API_GATEWAY;
  const apiUrl = process.env.API_GATEWAY_URL || 'https://api.vercel.com/v1/ai';

  if (!apiKey) {
    console.warn('API_GATEWAY not configured, skipping AI analysis');
    return [];
  }

  // Prepare Reddit data for AI analysis
  const redditData = posts.map((post) => ({
    title: post.data.title,
    url: `https://reddit.com${post.data.permalink}`,
    upvotes: post.data.ups,
    comments: post.data.num_comments,
    text: post.data.selftext?.substring(0, 500) || '', // Limit text length
  }));

  // Construct the prompt based on the Trend Scanner Prompt from docs
  const prompt = `You are a Reddit trend scanner focused on micro-SaaS ideas. Analyze the provided Reddit posts data (JSON from Reddit API hot endpoint, last 24 hours, subs: r/SaaS, r/indiehackers, r/SideProject, r/Entrepreneur).

Steps:
1. Filter posts mentioning needs like "need a tool/app for X", "wish there was AI for Y", "anyone built Z?" or similar pain points. Require min 10 upvotes and at least 3 comments for relevance.
2. Extract key details: title, URL, upvotes, comment count, a 1-2 sentence summary of the need/problem.
3. Rank top 5 novel ideas: Score by engagement (upvotes + comments/2), ensure no duplicates (use semantic similarity—e.g., group similar "email sorter" ideas). Prioritize unsolved/unaddressed needs.
4. Suggest pricing: Based on niche, recommend $5-15/mo tier (e.g., $9/mo for indie tools).
5. If no qualifying posts, output empty array.

Output strict JSON array of objects:
[
  {
    "idea": "Short title of the idea (e.g., AI Podcast Clipper)",
    "summary": "Brief need description",
    "url": "Full Reddit post URL",
    "score": Number (engagement score, 0-100),
    "suggested_pricing": "$X/mo"
  }
]

Handle errors: If data parse fails, output {error: "description"}.

Input data: ${JSON.stringify(redditData, null, 2)}`;

  try {
    // Call Vercel Gateway API (OpenAI-compatible format)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Haiku model as specified
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vercel Gateway API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response - Versal Gateway uses OpenAI-compatible format
    // Response format: { choices: [{ message: { content: "..." } }] }
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('Invalid response format from Vercel Gateway API');
      return [];
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in AI response');
      return [];
    }

    const trends: TrendIdea[] = JSON.parse(jsonMatch[0]);
    return trends.slice(0, 5); // Ensure max 5 trends
  } catch (error) {
    console.error('Error analyzing with AI:', error);
    return [];
  }
}
