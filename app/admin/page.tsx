'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminSettings {
  scanEnabled: boolean;
}

export default function AdminPage() {
  const [settings, setSettings] = useState<AdminSettings>({ scanEnabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScan = async (enabled: boolean) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanEnabled: enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Settings
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Configure system-wide settings for MVP Launcher
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Scan Settings
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Control automatic Reddit trend scanning
            </p>
          </div>

          <div className="px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    Enable Reddit Scanning
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    When enabled, the system will automatically scan Reddit for trending micro-SaaS ideas.
                    This affects both manual scans via the &quot;Scan Reddit&quot; button and automated hourly cron jobs.
                  </p>
                </div>
                <div className="ml-6">
                  <button
                    type="button"
                    onClick={() => handleToggleScan(!settings.scanEnabled)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      settings.scanEnabled ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={settings.scanEnabled}
                  >
                    <span className="sr-only">Enable scanning</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.scanEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-b-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Current status: <span className="font-medium">{settings.scanEnabled ? 'Enabled' : 'Disabled'}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {settings.scanEnabled
                    ? 'The scan endpoint is active and will process requests from the cron job and manual triggers.'
                    : 'The scan endpoint is disabled. Manual and automated scans will be blocked until re-enabled.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
