import { RedditResponse, RedditPost } from './types';

/**
 * Fetches hot posts from specified Reddit subreddits
 * Uses Reddit's public JSON API (no authentication required for reading)
 */
export async function fetchRedditPosts(
  subreddits: string[] = ['SaaS', 'indiehackers', 'SideProject', 'Entrepreneur'],
  limit: number = 20
): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];

  for (const subreddit of subreddits) {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MVP-Launcher-Bot/1.0',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch from r/${subreddit}: ${response.status}`);
        continue;
      }

      const data: RedditResponse = await response.json();
      allPosts.push(...data.data.children);
    } catch (error) {
      console.error(`Error fetching r/${subreddit}:`, error);
    }
  }

  return allPosts;
}

/**
 * Filters posts to only include those from the last 24 hours
 * with minimum engagement (upvotes and comments)
 */
export function filterRecentPosts(
  posts: RedditPost[],
  minUpvotes: number = 10,
  minComments: number = 3,
  hoursAgo: number = 24
): RedditPost[] {
  const cutoffTime = Date.now() / 1000 - hoursAgo * 60 * 60;

  return posts.filter((post) => {
    const { ups, num_comments, created_utc } = post.data;
    return (
      created_utc >= cutoffTime &&
      ups >= minUpvotes &&
      num_comments >= minComments
    );
  });
}
