export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    tokenUsage?: TokenUsage;
    cost?: number;
    model?: string;
  };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'reddit_fetch' | 'ai_call' | 'scan' | 'error' | 'info';
  message: string;
  details?: Record<string, unknown>;
  cost?: number;
  tokenUsage?: TokenUsage;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'no_results';
  message: string;
  trendsFound?: number;
  errors?: string[];
  cost?: number;
}
