'use client';

import { useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import type { Trend } from '@/types/trend';
import Image from 'next/image';

// Mock trends data - in production, this would come from API/KV
const mockTrends: Trend[] = [
  {
    id: '1',
    idea: 'AI Podcast Clipper',
    summary: 'Tool to auto-clip and summarize podcast highlights for social media sharing',
    url: 'https://reddit.com/r/SaaS/example1',
    score: 85,
    suggested_pricing: '$9/mo'
  },
  {
    id: '2',
    idea: 'Email Priority Sorter',
    summary: 'AI-powered email categorization that highlights urgent messages and filters noise',
    url: 'https://reddit.com/r/indiehackers/example2',
    score: 72,
    suggested_pricing: '$7/mo'
  },
  {
    id: '3',
    idea: 'Meeting Notes Automator',
    summary: 'Automatically generate action items and summaries from video meetings',
    url: 'https://reddit.com/r/SideProject/example3',
    score: 91,
    suggested_pricing: '$12/mo'
  }
];

export default function DashboardPage() {
  const [trends, setTrends] = useState<Trend[]>(mockTrends);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [modalType, setModalType] = useState<'copy' | 'image' | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCopy = async (trend: Trend) => {
    setLoading(prev => ({ ...prev, [`copy-${trend.id}`]: true }));
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
        // Update trend with generated copy
        const updatedTrends = trends.map(t => 
          t.id === trend.id 
            ? { ...t, generated_copy: result.data }
            : t
        );
        setTrends(updatedTrends);
        // Use the updated trend from the array
        const updatedTrend = updatedTrends.find(t => t.id === trend.id);
        if (updatedTrend) {
          setSelectedTrend(updatedTrend);
          setModalType('copy');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate copy');
    } finally {
      setLoading(prev => ({ ...prev, [`copy-${trend.id}`]: false }));
    }
  };

  const handleGenerateImage = async (trend: Trend) => {
    setLoading(prev => ({ ...prev, [`image-${trend.id}`]: true }));
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
        // Update trend with generated image
        const updatedTrends = trends.map(t => 
          t.id === trend.id 
            ? { ...t, generated_image: result.data.imageUrl }
            : t
        );
        setTrends(updatedTrends);
        // Use the updated trend from the array
        const updatedTrend = updatedTrends.find(t => t.id === trend.id);
        if (updatedTrend) {
          setSelectedTrend(updatedTrend);
          setModalType('image');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(prev => ({ ...prev, [`image-${trend.id}`]: false }));
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            MVP Launcher Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage trending micro-SaaS ideas and generate marketing content
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Trends Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
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
                {trends.map((trend) => (
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
                            disabled={loading[`copy-${trend.id}`]}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading[`copy-${trend.id}`] ? (
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
                            disabled={loading[`image-${trend.id}`]}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading[`image-${trend.id}`] ? (
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
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
