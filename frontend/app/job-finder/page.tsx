import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AppLayout';

export default function JobFinderLanding() {
  return (
    <AppLayout appName="JOB SEARCH X-RAY">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-6 bg-white">
          <div className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-xs font-mono font-bold mb-4">
            FIND JOBS LIKE A RECRUITER
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold">
              <span className="inline-block border-b-4 border-black pb-1">Job Search X-Ray</span>
            </h1>
            <Link href="/job-finder/try">
              <button className="px-6 py-3 border-2 border-black bg-black text-white font-mono font-bold hover:bg-white hover:text-black transition-colors">
                TRY IT NOW! →
              </button>
            </Link>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Most job seekers search on Indeed or LinkedIn and miss 70% of available positions.
              Companies post directly on their ATS platforms (Greenhouse, Lever, Workday) weeks before
              aggregators index them — if they ever do. By the time a job appears on Indeed, hundreds
              have already applied.
            </p>

            <p>
              Recruiters use <strong>X-Ray search techniques</strong> — advanced Google search operators
              that directly target ATS platforms, filter by location, and find jobs posted in the
              last 24-72 hours. This isn&apos;t magic. It&apos;s just knowing which URLs to target and
              how to structure Boolean queries.
            </p>

            <p>
              This tool generates customized Google search queries based on your requirements — role,
              skills, location, and target companies. You get 5-10 copy-paste queries optimized for
              different scenarios: recent postings, specific ATS platforms, location-based, remote-only,
              and more. Click any query to search Google directly.
            </p>
          </div>
        </div>
      </section>

      {/* Why X-Ray Search Works */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">Why X-Ray Search Works</h2>
          <div className="space-y-6">
            {/* Reason 1 */}
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                EARLY ACCESS
              </div>
              <h3 className="text-lg font-bold mb-2">Find Jobs Before Aggregators</h3>
              <p className="text-sm text-gray-700 mb-3">
                Companies post on their ATS first. Job boards scrape these postings days or weeks later
                — if at all. Searching ATS platforms directly means you find openings when they&apos;re fresh,
                before hundreds of applicants pile on.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 border border-black text-xs font-mono">Direct ATS Access</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">24-72 Hour Advantage</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Less Competition</span>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                PRECISION
              </div>
              <h3 className="text-lg font-bold mb-2">Target Exactly What You Want</h3>
              <p className="text-sm text-gray-700 mb-3">
                Boolean operators (AND, OR) and Google&apos;s advanced search syntax let you combine
                multiple criteria: specific roles, required skills, location preferences, and target
                companies. No wading through irrelevant results.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 border border-black text-xs font-mono">Boolean Logic</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Multi-Criteria Filtering</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">High Relevance</span>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                HIDDEN JOBS
              </div>
              <h3 className="text-lg font-bold mb-2">Discover Unlisted Opportunities</h3>
              <p className="text-sm text-gray-700 mb-3">
                Many companies don&apos;t push their jobs to aggregators. They only post on their ATS
                career pages. X-Ray search finds these hidden listings that never appear on mainstream
                job boards, giving you access to opportunities other candidates miss.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 border border-black text-xs font-mono">Unlisted Roles</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Direct Company Pages</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Exclusive Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="border-2 border-black p-6 bg-white">
              <div className="text-5xl font-bold mb-3 text-black">01</div>
              <h3 className="text-lg font-bold mb-2">Input Your Requirements</h3>
              <p className="text-sm text-gray-700">
                Enter your target role, skills, location preferences, and any specific companies or
                ATS platforms you want to focus on.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-2 border-black p-6 bg-white">
              <div className="text-5xl font-bold mb-3 text-black">02</div>
              <h3 className="text-lg font-bold mb-2">Get Custom Queries</h3>
              <p className="text-sm text-gray-700">
                Receive 5-10 optimized Google search queries tailored to different scenarios: recent
                jobs, specific platforms, location-based, remote-only, and more.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-2 border-black p-6 bg-white">
              <div className="text-5xl font-bold mb-3 text-black">03</div>
              <h3 className="text-lg font-bold mb-2">Copy & Search</h3>
              <p className="text-sm text-gray-700">
                Copy any query and paste it into Google, or click the direct search link. Find fresh
                job postings and apply early before the crowd arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Strategies Explained */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Search Strategies We Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ATS-Specific Targeting */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-blue-600 text-white text-xs font-mono font-bold">
              CORE STRATEGY
            </div>
            <h3 className="text-xl font-bold mb-3">ATS-Specific Targeting</h3>
            <p className="text-sm text-gray-600 mb-4">
              Major ATS platforms have predictable URL patterns. We use <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">site:</code> operators
              to search only Greenhouse, Lever, Workday, Taleo, and Jobvite job boards.
            </p>
            <div className="bg-gray-50 border border-gray-300 p-3 mb-3">
              <code className="text-xs font-mono text-gray-800 break-all">
                site:greenhouse.io OR site:lever.co &quot;Software Engineer&quot;
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Searches only Greenhouse and Lever job boards for Software Engineer roles.
            </p>
          </div>

          {/* Date Filtering */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-green-600 text-white text-xs font-mono font-bold">
              RECENCY
            </div>
            <h3 className="text-xl font-bold mb-3">Date Filtering</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">after:</code> to find jobs posted after a specific date.
              This ensures you only see fresh postings, not 6-month-old listings.
            </p>
            <div className="bg-gray-50 border border-gray-300 p-3 mb-3">
              <code className="text-xs font-mono text-gray-800 break-all">
                &quot;Product Manager&quot; after:2026-01-20
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Shows Product Manager jobs posted after January 20, 2026.
            </p>
          </div>

          {/* Boolean Logic */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-purple-600 text-white text-xs font-mono font-bold">
              PRECISION
            </div>
            <h3 className="text-xl font-bold mb-3">Boolean Logic</h3>
            <p className="text-sm text-gray-600 mb-4">
              Combine <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">OR</code> and <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">AND</code> to
              craft precise queries that match multiple role and skill variations in a single search.
            </p>
            <div className="bg-gray-50 border border-gray-300 p-3 mb-3">
              <code className="text-xs font-mono text-gray-800 break-all">
                (&quot;Software Engineer&quot; OR &quot;Backend Engineer&quot;) &quot;Python&quot;
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Finds Software or Backend Engineer roles mentioning Python.
            </p>
          </div>

          {/* Location Targeting */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-orange-600 text-white text-xs font-mono font-bold">
              LOCATION
            </div>
            <h3 className="text-xl font-bold mb-3">Location Targeting</h3>
            <p className="text-sm text-gray-600 mb-4">
              Include location names or use <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">AROUND(X)</code> proximity
              search to find jobs near specific cities. Support for remote, hybrid, and on-site filtering.
            </p>
            <div className="bg-gray-50 border border-gray-300 p-3 mb-3">
              <code className="text-xs font-mono text-gray-800 break-all">
                &quot;Data Analyst&quot; (&quot;San Francisco&quot; OR &quot;Remote&quot;)
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Searches for Data Analyst jobs in San Francisco or remote positions.
            </p>
          </div>

          {/* Multi-Platform Search */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-teal-600 text-white text-xs font-mono font-bold">
              COVERAGE
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Platform Search</h3>
            <p className="text-sm text-gray-600 mb-4">
              Search across multiple ATS platforms simultaneously using <code className="bg-gray-100 px-1 py-0.5 text-xs font-mono">OR</code> between
              site operators. Cast a wide net efficiently.
            </p>
            <div className="bg-gray-50 border border-gray-300 p-3 mb-3">
              <code className="text-xs font-mono text-gray-800 break-all">
                (site:greenhouse.io OR site:lever.co OR site:workday.com) &quot;UX Designer&quot;
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Searches Greenhouse, Lever, and Workday simultaneously for UX Designer roles.
            </p>
          </div>
        </div>
      </section>

      {/* Supported ATS Platforms */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">Supported ATS Platforms</h2>
          <p className="text-sm text-gray-600 mb-6">
            We target the most popular applicant tracking systems used by companies worldwide.
            Each platform has unique URL patterns we exploit for precise searching.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-2 border-black p-4 bg-white">
              <div className="text-lg font-bold mb-1">Greenhouse</div>
              <div className="text-xs font-mono text-gray-500">greenhouse.io</div>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <div className="text-lg font-bold mb-1">Lever</div>
              <div className="text-xs font-mono text-gray-500">lever.co</div>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <div className="text-lg font-bold mb-1">Workday</div>
              <div className="text-xs font-mono text-gray-500">myworkdayjobs.com</div>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <div className="text-lg font-bold mb-1">Taleo</div>
              <div className="text-xs font-mono text-gray-500">taleo.net</div>
            </div>
            <div className="border-2 border-black p-4 bg-white">
              <div className="text-lg font-bold mb-1">Jobvite</div>
              <div className="text-xs font-mono text-gray-500">jobvite.com</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="mb-12 pt-12 border-t-2 border-black">
        <h2 className="text-3xl font-bold mb-8">What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-black p-6 bg-white">
            <h3 className="text-lg font-bold mb-2">📋 Multiple Query Variations</h3>
            <p className="text-sm text-gray-700">
              5-10 different search queries optimized for different scenarios: recent jobs, specific
              ATS platforms, location-based, skill-focused, and more. Each query targets a different
              use case.
            </p>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <h3 className="text-lg font-bold mb-2">🔗 Direct Google Links</h3>
            <p className="text-sm text-gray-700">
              Every query includes a direct Google search link. Click to search immediately without
              copy-pasting. Opens in a new tab so you can test multiple queries efficiently.
            </p>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <h3 className="text-lg font-bold mb-2">📝 Clear Explanations</h3>
            <p className="text-sm text-gray-700">
              Each query is labeled with what it does and why you&apos;d use it. Understand the strategy
              behind each search so you can modify and adapt queries yourself later.
            </p>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <h3 className="text-lg font-bold mb-2">⚡ Instant Generation</h3>
            <p className="text-sm text-gray-700">
              No AI inference, no waiting. Queries are generated instantly using deterministic logic
              based on your inputs. Fast, free, and works offline after initial load.
            </p>
          </div>
        </div>
      </section>

      {/* Ready Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to find jobs like a recruiter?</h2>
              <p className="text-sm text-gray-600 max-w-lg">
                Stop competing with hundreds of applicants on job boards. Use X-Ray search to find
                fresh postings directly on company ATS platforms before the crowd arrives.
              </p>
            </div>
            <Link href="/job-finder/try">
              <button className="shrink-0 px-6 py-3 border-2 border-black bg-black text-white font-mono font-bold hover:bg-white hover:text-black transition-colors">
                GENERATE QUERIES NOW →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
