/**
 * Types for the Reddit Trend Scanner API
 */

export interface RedditPost {
  data: {
    title: string;
    url: string;
    permalink: string;
    ups: number;
    num_comments: number;
    created_utc: number;
    selftext?: string;
  };
}

export interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export interface TrendIdea {
  idea: string;
  summary: string;
  url: string;
  score: number;
  suggested_pricing: string;
}

export interface VersalRequest {
  model: string;
  prompt: string;
}

export interface VersalResponse {
  content?: string;
  error?: string;
}

export interface ScanResult {
  trends: TrendIdea[];
  timestamp: string;
  error?: string;
}
