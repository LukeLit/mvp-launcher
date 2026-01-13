'use client';

import { TrendIdea } from '@/lib/types';

interface TrendsTableProps {
  trends: TrendIdea[];
  onBuildLanding?: (trend: TrendIdea) => void;
}

export default function TrendsTable({ trends, onBuildLanding }: TrendsTableProps) {
  if (trends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No trends found. Click &quot;Run Scan&quot; to fetch the latest trends.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="text-left py-3 px-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Idea
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Summary
            </th>
            <th className="text-center py-3 px-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Score
            </th>
            <th className="text-center py-3 px-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Pricing
            </th>
            <th className="text-center py-3 px-4 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {trends.map((trend, index) => (
            <tr
              key={index}
              className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {trend.idea}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                  {trend.summary}
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {trend.score}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {trend.suggested_pricing}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    View Post
                  </a>
                  {onBuildLanding && (
                    <button
                      onClick={() => onBuildLanding(trend)}
                      className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Build Landing
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
