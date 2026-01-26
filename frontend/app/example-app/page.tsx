'use client';

import { useState } from 'react';
import { exampleAppAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Box, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExampleApp() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exampleAppAPI.getData();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid-bg">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm">BACK</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Box className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">EXAMPLE APP</span>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="inline-block mb-6 px-4 py-2 border border-white/20 text-white/60 text-sm font-mono">
            TEMPLATE APPLICATION
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-none tracking-tighter">
            Example <span className="text-glow">Application</span>
          </h1>
          <p className="text-xl text-white/50 leading-relaxed font-light max-w-2xl">
            This is a template application demonstrating backend integration with clean architecture.
            Test the API connection using the button below.
          </p>
        </section>

        {/* Action Section */}
        <section className="mb-16">
          <div className="border border-white/10 p-12 glow-border-hover transition-all duration-300 relative overflow-hidden group">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 group-hover:bg-white/10 transition-colors duration-300" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold">API Connection Test</h2>
              </div>

              <p className="text-white/50 mb-8 max-w-xl">
                Click the button below to test the connection to the backend API.
                This demonstrates how data flows between your frontend and backend services.
              </p>

              <Button
                onClick={fetchData}
                disabled={loading}
                size="lg"
                className="font-bold"
              >
                {loading ? 'LOADING...' : 'FETCH DATA FROM API'}
              </Button>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-white/10" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-white/10" />
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section className="mb-16">
            <div className="border border-red-500/30 bg-red-500/5 p-8 relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-red-500">Error Occurred</h3>
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-red-500/30" />
            </div>
          </section>
        )}

        {/* Success State */}
        {data && (
          <section className="mb-16">
            <div className="border border-green-500/30 bg-green-500/5 p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-green-500">Data Received Successfully</h3>
                </div>

                <div className="bg-black/50 p-6 border border-white/10 overflow-x-auto">
                  <pre className="text-sm font-mono text-green-400">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-green-500/30" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-green-500/30" />
            </div>
          </section>
        )}

        {/* Info Section */}
        <section className="mt-24 pt-24 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-8">Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-white/10 p-6">
              <h3 className="font-bold mb-3 text-white/80 font-mono text-sm">FRONTEND</h3>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>• Next.js 16 with App Router</li>
                <li>• React 19 with TypeScript</li>
                <li>• Tailwind CSS v4</li>
                <li>• Axios for API calls</li>
              </ul>
            </div>

            <div className="border border-white/10 p-6">
              <h3 className="font-bold mb-3 text-white/80 font-mono text-sm">BACKEND</h3>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>• FastAPI Python framework</li>
                <li>• RESTful API architecture</li>
                <li>• API key authentication</li>
                <li>• Deployed on Render</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/30 font-mono">
              &copy; {new Date().getFullYear()} Darsh Joshi
            </div>
            <div className="text-sm text-white/30 font-mono">
              Example Application
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
