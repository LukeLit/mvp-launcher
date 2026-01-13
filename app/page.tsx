'use client';

import { useState, useEffect } from 'react';
import { TrendIdea, ScanResult } from '@/lib/types';
import TrendsTable from '@/components/TrendsTable';

export default function Home() {
  const [trends, setTrends] = useState<TrendIdea[]>([]);
  const [lastScan, setLastScan] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedTrend, setSelectedTrend] = useState<TrendIdea | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load cached trends on mount
  useEffect(() => {
    const cached = localStorage.getItem('trends');
    const cachedTime = localStorage.getItem('lastScan');
    if (cached) {
      setTrends(JSON.parse(cached));
    }
    if (cachedTime) {
      setLastScan(cachedTime);
    }
  }, []);

  const runScan = async () => {
    setIsScanning(true);
    setError('');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const data: ScanResult = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTrends(data.trends);
        setLastScan(data.timestamp);
        
        // Cache results
        localStorage.setItem('trends', JSON.stringify(data.trends));
        localStorage.setItem('lastScan', data.timestamp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBuildLanding = (trend: TrendIdea) => {
    setSelectedTrend(trend);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrend(null);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Reddit Trend Scanner
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Discover trending micro-SaaS ideas from Reddit
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={runScan}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Scanning...
                </span>
              ) : (
                'Run Scan'
              )}
            </button>

            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Last scan: {formatTimestamp(lastScan)}
            </div>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {trends.length} {trends.length === 1 ? 'trend' : 'trends'} found
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Trends Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <TrendsTable trends={trends} onBuildLanding={handleBuildLanding} />
        </div>

        {/* Build Landing Modal */}
        {showModal && selectedTrend && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Build Landing Page
              </h2>

              <div className="mb-6 space-y-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Idea
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100">
                    {selectedTrend.idea}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Summary
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100">
                    {selectedTrend.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Engagement Score
                    </label>
                    <p className="text-zinc-900 dark:text-zinc-100">
                      {selectedTrend.score}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Suggested Pricing
                    </label>
                    <p className="text-zinc-900 dark:text-zinc-100">
                      {selectedTrend.suggested_pricing}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Reddit Post
                  </label>
                  <a
                    href={selectedTrend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    {selectedTrend.url}
                  </a>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Landing page generation API endpoint not
                  yet implemented. This will trigger the Landing Page Generator
                  from the AI agent prompts.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  disabled
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Landing Page (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Scans r/SaaS, r/indiehackers, r/SideProject, and r/Entrepreneur for
            trending ideas
          </p>
          <p className="mt-1">
            Auto-scans hourly via Vercel cron • Manual scan available anytime
          </p>
        </div>
      </div>
    </div>
  );
}
