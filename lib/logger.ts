import { put, list } from '@vercel/blob';
import type { LogEntry, TokenUsage } from '@/types/chat';

// Cost estimation based on model pricing (approximate)
const MODEL_COSTS = {
  'claude-3-haiku-20240307': {
    input: 0.25 / 1_000_000,  // $0.25 per million tokens
    output: 1.25 / 1_000_000,  // $1.25 per million tokens
  },
  'claude-3-sonnet-20240229': {
    input: 3 / 1_000_000,
    output: 15 / 1_000_000,
  },
  'deepseek-chat': {
    input: 0.14 / 1_000_000,
    output: 0.28 / 1_000_000,
  },
};

export function estimateCost(model: string, tokenUsage: TokenUsage): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['claude-3-haiku-20240307'];
  const inputCost = tokenUsage.promptTokens * costs.input;
  const outputCost = tokenUsage.completionTokens * costs.output;
  return inputCost + outputCost;
}

export async function logToBlob(entry: LogEntry): Promise<void> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!blobToken) {
    console.warn('BLOB_READ_WRITE_TOKEN not configured, logging to console only');
    console.log('[LOG]', entry);
    return;
  }

  try {
    const logFileName = `logs/${new Date().toISOString().split('T')[0]}/${entry.id}.json`;
    await put(logFileName, JSON.stringify(entry, null, 2), {
      access: 'public',
      token: blobToken,
    });
  } catch (error) {
    console.error('Failed to write log to blob:', error);
    console.log('[LOG]', entry);
  }
}

export async function getRecentLogs(limit = 50): Promise<LogEntry[]> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!blobToken) {
    return [];
  }

  try {
    const { blobs } = await list({
      prefix: 'logs/',
      limit,
      token: blobToken,
    });

    const logs: LogEntry[] = [];
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const log = await response.json();
        logs.push(log);
      } catch (error) {
        console.error(`Failed to fetch log ${blob.url}:`, error);
      }
    }

    // Sort by timestamp descending
    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Failed to retrieve logs from blob:', error);
    return [];
  }
}

export function createLogEntry(
  type: LogEntry['type'],
  message: string,
  details?: Record<string, unknown>,
  cost?: number,
  tokenUsage?: TokenUsage
): LogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
    cost,
    tokenUsage,
  };
}
