import TrendsTable from '@/components/TrendsTable';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            MVP Launcher Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage trending micro-SaaS ideas and generate marketing content
          </p>
        </div>

        <TrendsTable />
      </div>
    </div>
  );
}
