import type { Trend } from '@/types/trend';

// Mock Vercel KV for development
// In production, replace with actual @vercel/kv import

const kvStore = new Map<string, Trend>();

export async function getTrend(id: string): Promise<Trend | null> {
  if (typeof window !== 'undefined') {
    return null; // Client-side
  }
  return kvStore.get(`trend:${id}`) || null;
}

export async function setTrend(id: string, trend: Trend): Promise<void> {
  if (typeof window !== 'undefined') {
    return; // Client-side
  }
  kvStore.set(`trend:${id}`, trend);
}

export async function getAllTrends(): Promise<Trend[]> {
  if (typeof window !== 'undefined') {
    return []; // Client-side
  }
  const trends: Trend[] = [];
  for (const [key, value] of kvStore.entries()) {
    if (key.startsWith('trend:')) {
      trends.push(value);
    }
  }
  return trends;
}
