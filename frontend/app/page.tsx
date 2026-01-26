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
    <div className="min-h-screen bg-black text-white grid-bg">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center glow-on-hover">
              <Box className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">APPS</span>
          </div>
          <div className="text-sm text-white/40 font-mono">
            {apps.length} {apps.length === 1 ? 'App' : 'Apps'} Available
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-24 max-w-3xl">
          <div className="inline-block mb-6 px-4 py-2 border border-white/20 text-white/60 text-sm font-mono">
            PERSONAL DASHBOARD
          </div>
          <h1 className="text-7xl font-bold mb-6 leading-none tracking-tighter">
            Your{' '}
            <span className="text-glow inline-block">Applications</span>
          </h1>
          <p className="text-xl text-white/50 leading-relaxed font-light">
            A centralized platform for all your web applications.
            Built with precision. Designed for focus.
          </p>
        </section>

        {/* Apps Grid */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">All Applications</h2>
            <div className="text-sm text-white/40 font-mono">
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
                <div className="h-full bg-black border border-white/10 p-8 glow-border-hover transition-all duration-300 group-hover:border-white/30 relative overflow-hidden">
                  {/* Background glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Status Badge */}
                    {app.status === 'active' && (
                      <div className="inline-block mb-6 px-3 py-1 border border-white/20 text-xs font-mono text-white/60">
                        ACTIVE
                      </div>
                    )}

                    {/* App Name */}
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-glow transition-all duration-300">
                      {app.name}
                    </h3>

                    {/* Description */}
                    <p className="text-white/50 leading-relaxed mb-8 font-light">
                      {app.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-mono">OPEN</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-white/5 group-hover:border-white/20 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-white/5 group-hover:border-white/20 transition-colors duration-300" />
                </div>
              </Link>
            ))}

            {/* Placeholder Cards */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="h-full bg-black border border-white/5 p-8 relative overflow-hidden opacity-40"
              >
                <div className="relative z-10">
                  <div className="inline-block mb-6 px-3 py-1 border border-white/10 text-xs font-mono text-white/30">
                    COMING SOON
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white/20">
                    App {i + 2}
                  </h3>
                  <p className="text-white/10 leading-relaxed mb-8 font-light">
                    New application under development. Stay tuned for updates.
                  </p>
                  <div className="flex items-center gap-2 text-white/10">
                    <span className="text-sm font-mono">PENDING</span>
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-white/5" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-white/5" />
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-24 pt-24 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-5xl font-bold mb-3 text-glow">{apps.length}</div>
              <div className="text-white/40 font-mono text-sm">Active Applications</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3">5</div>
              <div className="text-white/40 font-mono text-sm">In Development</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3">∞</div>
              <div className="text-white/40 font-mono text-sm">Possibilities</div>
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
              Built with precision
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
