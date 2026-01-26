'use client';

import { exampleAppAPI } from '@/lib/api/apps/example-app';
import { useAPI } from '@/lib/hooks/useAPI';
import { AppLayout } from '@/components/layouts/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SuccessState } from '@/components/shared/SuccessState';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function ExampleApp() {
  const { data, loading, error, execute } = useAPI(exampleAppAPI.getAll);

  return (
    <AppLayout appName="EXAMPLE APP">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="inline-block mb-6 px-4 py-2 border-2 border-black text-black text-sm font-mono font-bold">
          TEMPLATE APPLICATION
        </div>
        <h1 className="text-6xl font-bold mb-6 leading-none tracking-tighter">
          Example <span className="border-b-4 border-black">Application</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
          This is a template application demonstrating backend integration with clean architecture.
          Test the API connection using the button below.
        </p>
      </section>

      {/* Action Section */}
      <section className="mb-16">
        <div className="border-2 border-black p-12 border-hover transition-all duration-300 relative overflow-hidden group">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold">API Connection Test</h2>
            </div>

            <p className="text-gray-600 mb-8 max-w-xl">
              Click the button below to test the connection to the backend API.
              This demonstrates how data flows between your frontend and backend services.
            </p>

            <Button
              onClick={execute}
              disabled={loading}
              size="lg"
            >
              {loading ? 'LOADING...' : 'FETCH DATA FROM API'}
            </Button>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gray-300" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gray-300" />
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="mb-16">
          <LoadingState message="Fetching data from API..." />
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="mb-16">
          <ErrorState message={error} onRetry={execute} />
        </section>
      )}

      {/* Success State */}
      {data && (
        <section className="mb-16">
          <SuccessState title="Data Received Successfully">
            <div className="bg-white p-6 border-2 border-gray-300 overflow-x-auto">
              <pre className="text-sm font-mono text-green-700">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </SuccessState>
        </section>
      )}

      {/* Info Section */}
      <section className="mt-24 pt-24 border-t-2 border-black">
        <h2 className="text-3xl font-bold mb-8">Technical Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-black p-6">
            <h3 className="font-bold mb-3 text-black font-mono text-sm">FRONTEND</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Next.js 16 with App Router</li>
              <li>• React 19 with TypeScript</li>
              <li>• Tailwind CSS v4</li>
              <li>• Axios for API calls</li>
              <li>• Modular architecture</li>
            </ul>
          </div>

          <div className="border-2 border-black p-6">
            <h3 className="font-bold mb-3 text-black font-mono text-sm">BACKEND</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• FastAPI Python framework</li>
              <li>• RESTful API architecture</li>
              <li>• API key authentication</li>
              <li>• Deployed on Render</li>
            </ul>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
