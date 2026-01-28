import Link from 'next/link';
import { ArrowRight, Linkedin, Github, X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface App {
  id: string;
  name: string;
  description: string;
  href: string;
  status?: 'active' | 'coming-soon';
}

const apps: App[] = [
  {
    id: 'ats-boss',
    name: 'ATS Boss',
    description: 'Beat the ATS robots. Analyze and optimize your resume for Workday, Greenhouse, and Ashby systems.',
    href: '/ats-boss',
    status: 'active',
  },
  {
    id: 'job-finder',
    name: 'Job Search X-Ray',
    description: 'Generate powerful Google search queries to find jobs directly on ATS platforms before they hit job boards.',
    href: '/job-finder',
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
            <Logo size={40} className="glow-on-hover" />
            <span className="text-xl font-bold tracking-tight">MINI PRODUCT SHOWCASE</span>
          </div>
          <a
            href="https://darshjoshi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 font-mono hover:text-black transition-colors"
          >
            Back to my main website
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-24 max-w-3xl">
          <div className="inline-block mb-6 px-4 py-2 border-2 border-black text-black text-sm font-mono font-bold">
            FEEL FREE TO TRY THEM ALL
          </div>
          <h1 className="text-7xl font-bold mb-6 leading-none tracking-tighter">
            Products{' '}
            <span className="inline-block border-b-4 border-black">Showcase</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A collection for me to collaborate with people and add new mini applications and useful AI tools to this showcase page!
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
            {[...Array(4)].map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="h-full bg-white border-2 border-gray-200 p-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="inline-block mb-6 px-3 py-1 border-2 border-gray-300 text-xs font-mono font-bold text-gray-400">
                    COMING SOON
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-400">
                    App {i + 3}
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
              <div className="text-6xl font-bold mb-3 text-gray-400">4</div>
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
