'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, LogEntry } from '@/types/chat';

export default function ChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, logs, activeTab]);

  // Fetch logs periodically
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLogs(data.logs);
          }
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check the logs for more details.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (cost?: number) => {
    if (!cost) return 'N/A';
    return `$${cost.toFixed(6)}`;
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    const colors = {
      reddit_fetch: 'text-blue-600 dark:text-blue-400',
      ai_call: 'text-purple-600 dark:text-purple-400',
      scan: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-zinc-600 dark:text-zinc-400',
    };
    return colors[type] || colors.info;
  };

  const getLogTypeBadge = (type: LogEntry['type']) => {
    const badges = {
      reddit_fetch: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      ai_call: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      scan: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      info: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300',
    };
    return badges[type] || badges.info;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isExpanded ? 'w-full max-w-2xl' : 'w-96'
    }`}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden"
           style={{ height: isExpanded ? '600px' : '400px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Agent Console
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'chat' ? (
            <>
              {messages.length === 0 && (
                <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  <p className="mb-2">👋 Welcome to the Agent Console</p>
                  <p className="text-sm">Ask me about scan results, costs, or system status</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.metadata && (
                      <div className="mt-2 pt-2 border-t border-zinc-300 dark:border-zinc-600 text-xs opacity-75">
                        <div className="flex justify-between">
                          <span>Tokens: {msg.metadata.tokenUsage?.totalTokens || 0}</span>
                          <span>Cost: {formatCost(msg.metadata.cost)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-zinc-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <>
              {logs.length === 0 && (
                <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  <p>No logs yet</p>
                  <p className="text-sm mt-2">Logs will appear as you scan Reddit and interact with the agent</p>
                </div>
              )}
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLogTypeBadge(log.type)}`}>
                      {log.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-sm ${getLogTypeColor(log.type)} mb-1`}>
                    {log.message}
                  </p>
                  {log.details && (
                    <details className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      <summary className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
                        View details
                      </summary>
                      <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.cost && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      Cost: <span className="font-mono">{formatCost(log.cost)}</span>
                      {log.tokenUsage && (
                        <span className="ml-2">
                          ({log.tokenUsage.totalTokens} tokens)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>

        {/* Input (only for chat tab) */}
        {activeTab === 'chat' && (
          <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about scans, costs, or debugging..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
