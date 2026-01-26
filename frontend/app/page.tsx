import Link from 'next/link';
import { ArrowRight, Box } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  href: string;
  status?: 'active' | 'coming-soon';
}

const apps: App[] = [
  {
    id: 'example-app',
    name: 'Example App',
    description: 'A template application demonstrating backend integration with a clean structure.',
    href: '/example-app',
    status: 'active',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black grid-bg">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center glow-on-hover">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">APPS</span>
          </div>
          <div className="text-sm text-gray-600 font-mono">
            {apps.length} {apps.length === 1 ? 'App' : 'Apps'} Available
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-24 max-w-3xl">
          <div className="inline-block mb-6 px-4 py-2 border-2 border-black text-black text-sm font-mono font-bold">
            PERSONAL DASHBOARD
          </div>
          <h1 className="text-7xl font-bold mb-6 leading-none tracking-tighter">
            Your{' '}
            <span className="inline-block border-b-4 border-black">Applications</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A centralized platform for all your web applications.
            Built with precision. Designed for focus.
          </p>
        </section>

        {/* Apps Grid */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">All Applications</h2>
            <div className="text-sm text-gray-500 font-mono">
              More coming soon
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={app.href}
                className="group block h-full"
              >
                <div className="h-full bg-white border-2 border-black p-8 border-hover transition-all duration-300 relative overflow-hidden">
                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Status Badge */}
                    {app.status === 'active' && (
                      <div className="inline-block mb-6 px-3 py-1 border-2 border-black text-xs font-mono font-bold">
                        ACTIVE
                      </div>
                    )}

                    {/* App Name */}
                    <h3 className="text-2xl font-bold mb-4 group-hover:underline transition-all duration-300">
                      {app.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-8">
                      {app.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-gray-600 group-hover:text-black transition-colors duration-300">
                      <span className="text-sm font-mono font-bold">OPEN</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-gray-300 group-hover:border-black transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-gray-300 group-hover:border-black transition-colors duration-300" />
                </div>
              </Link>
            ))}

            {/* Placeholder Cards */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="h-full bg-white border-2 border-gray-200 p-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="inline-block mb-6 px-3 py-1 border-2 border-gray-300 text-xs font-mono font-bold text-gray-400">
                    COMING SOON
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-400">
                    App {i + 2}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    New application under development. Stay tuned for updates.
                  </p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm font-mono font-bold">PENDING</span>
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-gray-200" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-gray-200" />
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-24 pt-24 border-t-2 border-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-6xl font-bold mb-3 border-b-4 border-black inline-block">{apps.length}</div>
              <div className="text-gray-600 font-mono text-sm font-bold mt-2">ACTIVE APPLICATIONS</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-3 text-gray-400">5</div>
              <div className="text-gray-600 font-mono text-sm font-bold mt-2">IN DEVELOPMENT</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-3 text-gray-400">∞</div>
              <div className="text-gray-600 font-mono text-sm font-bold mt-2">POSSIBILITIES</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 font-mono">
              &copy; {new Date().getFullYear()} Darsh Joshi
            </div>
            <div className="text-sm text-gray-600 font-mono">
              Built with precision
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
