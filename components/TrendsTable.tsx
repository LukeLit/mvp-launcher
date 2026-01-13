'use client';

import { useState } from 'react';
import type { Trend } from '@/types/trend';
import PreviewModal from '@/components/PreviewModal';
import Image from 'next/image';

interface TrendsTableProps {
  initialTrends?: Trend[];
}

export default function TrendsTable({ initialTrends = [] }: TrendsTableProps) {
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [modalType, setModalType] = useState<'copy' | 'image' | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan');
      
      if (!response.ok) {
        throw new Error('Failed to scan trends');
      }

      const result = await response.json();
      
      if (result.success) {
        setTrends(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan trends');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async (trend: Trend) => {
    setButtonLoading(prev => ({ ...prev, [`copy-${trend.id}`]: true }));
    setError(null);

    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: trend.idea,
          summary: trend.summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate copy');
      }

      const result = await response.json();
      
      if (result.success) {
        const updatedTrends = trends.map(t => 
          t.id === trend.id 
            ? { ...t, generated_copy: result.data }
            : t
        );
        setTrends(updatedTrends);
        const updatedTrend = updatedTrends.find(t => t.id === trend.id);
        if (updatedTrend) {
          setSelectedTrend(updatedTrend);
          setModalType('copy');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate copy');
    } finally {
      setButtonLoading(prev => ({ ...prev, [`copy-${trend.id}`]: false }));
    }
  };

  const handleGenerateImage = async (trend: Trend) => {
    setButtonLoading(prev => ({ ...prev, [`image-${trend.id}`]: true }));
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: trend.idea,
          summary: trend.summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      
      if (result.success) {
        const updatedTrends = trends.map(t => 
          t.id === trend.id 
            ? { ...t, generated_image: result.data.imageUrl }
            : t
        );
        setTrends(updatedTrends);
        const updatedTrend = updatedTrends.find(t => t.id === trend.id);
        if (updatedTrend) {
          setSelectedTrend(updatedTrend);
          setModalType('image');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setButtonLoading(prev => ({ ...prev, [`image-${trend.id}`]: false }));
    }
  };

  const handleViewPreview = (trend: Trend, type: 'copy' | 'image') => {
    setSelectedTrend(trend);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedTrend(null);
    setModalType(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Trending Ideas
        </h2>
        <button
          onClick={handleScan}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Scanning...' : 'Scan Reddit'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Idea
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
            {trends.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No trends yet. Click &quot;Scan Reddit&quot; to discover ideas.
                </td>
              </tr>
            ) : (
              trends.map((trend) => (
                <tr key={trend.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {trend.idea}
                    </div>
                    <a 
                      href={trend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Reddit Post
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                      {trend.summary}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {trend.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {trend.suggested_pricing}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateCopy(trend)}
                          disabled={buttonLoading[`copy-${trend.id}`]}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {buttonLoading[`copy-${trend.id}`] ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            'Generate Copy'
                          )}
                        </button>
                        {trend.generated_copy && (
                          <button
                            onClick={() => handleViewPreview(trend, 'copy')}
                            className="inline-flex items-center px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 text-xs font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            View Copy
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateImage(trend)}
                          disabled={buttonLoading[`image-${trend.id}`]}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {buttonLoading[`image-${trend.id}`] ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            'Generate Image'
                          )}
                        </button>
                        {trend.generated_image && (
                          <button
                            onClick={() => handleViewPreview(trend, 'image')}
                            className="inline-flex items-center px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 text-xs font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            View Image
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={!!selectedTrend && !!modalType}
        onClose={closeModal}
        title={modalType === 'copy' ? 'Generated Copy Preview' : 'Generated Image Preview'}
      >
        {selectedTrend && modalType === 'copy' && selectedTrend.generated_copy && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Headline
              </h3>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {selectedTrend.generated_copy.headline}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Description
              </h3>
              <p className="text-base text-zinc-700 dark:text-zinc-300">
                {selectedTrend.generated_copy.description}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Call to Action
              </h3>
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                {selectedTrend.generated_copy.cta}
              </button>
            </div>
          </div>
        )}
        
        {selectedTrend && modalType === 'image' && selectedTrend.generated_image && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <Image
                src={selectedTrend.generated_image}
                alt={`Hero image for ${selectedTrend.idea}`}
                width={1200}
                height={600}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium mb-1">Image URL:</p>
              <code className="block p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs break-all">
                {selectedTrend.generated_image}
              </code>
            </div>
          </div>
        )}
      </PreviewModal>
    </div>
  );
}
