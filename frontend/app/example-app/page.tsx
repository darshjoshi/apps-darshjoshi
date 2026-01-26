'use client';

import { useState } from 'react';
import { exampleAppAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Zap, AlertCircle, CheckCircle2, Linkedin, Github, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

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
    <div className="min-h-screen bg-white text-black grid-bg">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm font-bold">BACK</span>
          </Link>

          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-xl font-bold tracking-tight">EXAMPLE APP</span>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
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
                onClick={fetchData}
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

        {/* Error State */}
        {error && (
          <section className="mb-16">
            <div className="border-2 border-red-600 bg-red-50 p-8 relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-red-600">Error Occurred</h3>
                  <p className="text-red-700 font-mono text-sm">{error}</p>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-red-400" />
            </div>
          </section>
        )}

        {/* Success State */}
        {data && (
          <section className="mb-16">
            <div className="border-2 border-green-600 bg-green-50 p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-green-600">Data Received Successfully</h3>
                </div>

                <div className="bg-white p-6 border-2 border-gray-300 overflow-x-auto">
                  <pre className="text-sm font-mono text-green-700">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-green-400" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-green-400" />
            </div>
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
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-600 font-mono">
              &copy; {new Date().getFullYear()} Darsh Joshi
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 font-mono font-bold">
                OPEN FOR COLLABORATION!
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/darshjoshi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/darshjoshi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com/darshjoshii"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                  aria-label="X (Twitter)"
                >
                  <X className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
