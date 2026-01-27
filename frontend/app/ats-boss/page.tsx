import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AppLayout';

export default function ATSBossLanding() {
  return (
    <AppLayout appName="ATS BOSS">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-6 bg-white">
          <div className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-xs font-mono font-bold mb-4">
            BEAT THE ROBOTS
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold">
              <span className="inline-block border-b-4 border-black pb-1">ATS Boss</span>
            </h1>
            <Link href="/ats-boss/try">
              <button className="px-6 py-3 border-2 border-black bg-black text-white font-mono font-bold hover:bg-white hover:text-black transition-colors">
                TRY HERE! →
              </button>
            </Link>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Over 97% of Fortune 500 companies use Applicant Tracking Systems to filter resumes
              before a human ever sees them. These systems reject up to 75% of applicants
              automatically based on keyword matches, section parsing, and formatting compatibility.
              Your qualifications don&apos;t matter if the software can&apos;t read them.
            </p>

            <p>
              ATS Boss uses <strong>GPT-5-mini&apos;s reasoning capabilities</strong> (OpenAI o4-mini)
              to simulate how Workday, Greenhouse, and Ashby would actually parse and score your resume.
              This isn&apos;t keyword counting — the model reasons step-by-step through each system&apos;s
              documented parsing logic, scoring weights, and ranking criteria to produce an analysis
              that mirrors real ATS behavior.
            </p>

            <p>
              Upload your resume, paste the job description, and get a detailed scoring breakdown
              showing exactly where you stand — which keywords matched, which were missed, which
              sections the parser found or skipped, and where you&apos;d land in the recruiter&apos;s
              queue. Then generate an optimized PDF resume that addresses every issue found,
              using only your real experience.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                PHASE 1 — ANALYSIS
              </div>
              <h3 className="text-lg font-bold mb-2">Deep ATS Simulation</h3>
              <p className="text-sm text-gray-700 mb-3">
                GPT-5-mini (o4-mini) is prompted with the exact parsing rules, scoring weights, and
                ranking logic documented for each ATS system. It reasons through your resume
                step-by-step — detecting sections, extracting keywords, checking formatting — and
                produces a scored analysis with specific issues and fixes.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 border border-black text-xs font-mono">Section Detection</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Keyword Matching</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Format Analysis</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Score Breakdown</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Queue Prediction</span>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                PHASE 2 — GENERATION
              </div>
              <h3 className="text-lg font-bold mb-2">Optimized Resume PDF</h3>
              <p className="text-sm text-gray-700 mb-3">
                GPT-4o-mini takes your original resume, the job description, and the full Phase 1
                analysis — scoring breakdown, near-misses, missing keywords, critical issues — and
                restructures your content to fix every identified problem. The output is rendered
                into a single-page PDF using ReportLab with ATS-specific formatting.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 border border-black text-xs font-mono">Content Restructuring</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Keyword Integration</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Single-Page PDF</span>
                <span className="px-2 py-1 border border-black text-xs font-mono">Anti-Hallucination Guards</span>
              </div>
            </div>

            {/* Anti-hallucination note */}
            <div className="bg-gray-50 border-2 border-black p-4">
              <p className="text-xs font-mono text-gray-700">
                <strong>ON HONESTY:</strong> The generated resume only uses information from your
                original resume. It will never fabricate metrics, invent skills you don&apos;t have,
                or add experience that isn&apos;t yours. Missing keywords are incorporated only by
                rephrasing your existing experience to use the job description&apos;s terminology —
                not by making things up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported ATS Systems */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Supported ATS Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workday Card */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-red-600 text-white text-xs font-mono font-bold">
              MOST STRICT
            </div>
            <h3 className="text-2xl font-bold mb-3">Workday</h3>
            <p className="text-sm text-gray-600 mb-4">
              Exact string matching. No synonym understanding. Standard headings only. The strictest
              of the three — if your resume doesn&apos;t use the JD&apos;s exact phrases, Workday won&apos;t find them.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">SCORING WEIGHTS:</h4>
            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Keywords (exact match)</span><span>70%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-red-600" style={{width: '70%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Section Completeness</span><span>20%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-red-600" style={{width: '20%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Format Compatibility</span><span>10%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-red-600" style={{width: '10%'}} /></div>
              </div>
            </div>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE SIMULATE:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start"><span className="mr-2">→</span><span>Exact keyword matching (case-insensitive, no synonyms)</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Standard section heading detection and skipping</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Single-column layout verification</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Near-miss identification (why a keyword almost matched)</span></li>
            </ul>
          </div>

          {/* Greenhouse Card */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-green-600 text-white text-xs font-mono font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-3">Greenhouse</h3>
            <p className="text-sm text-gray-600 mb-4">
              Semantic matching with structured data extraction. More forgiving on synonyms
              but strict on data quality — dates, titles, and fields must be cleanly parseable.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">SCORING WEIGHTS:</h4>
            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Keyword Relevance</span><span>50%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-green-600" style={{width: '50%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Data Quality</span><span>30%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-green-600" style={{width: '30%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Experience Alignment</span><span>20%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-green-600" style={{width: '20%'}} /></div>
              </div>
            </div>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE SIMULATE:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start"><span className="mr-2">→</span><span>Semantic keyword matching with confidence scores</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Structured field extraction (company, title, dates)</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Data extraction quality assessment</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Experience-to-JD alignment scoring</span></li>
            </ul>
          </div>

          {/* Ashby Card */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-purple-600 text-white text-xs font-mono font-bold">
              AI-FIRST
            </div>
            <h3 className="text-2xl font-bold mb-3">Ashby</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered matching focused on impact. Cares less about keywords, more about
              quantified achievements, demonstrated skills, and career trajectory.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">SCORING WEIGHTS:</h4>
            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Achievement Quality</span><span>35%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-purple-600" style={{width: '35%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Skills Match</span><span>30%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-purple-600" style={{width: '30%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Career Trajectory</span><span>20%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-purple-600" style={{width: '20%'}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Cultural Fit</span><span>15%</span>
                </div>
                <div className="w-full h-2 border border-black"><div className="h-full bg-purple-600" style={{width: '15%'}} /></div>
              </div>
            </div>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE SIMULATE:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start"><span className="mr-2">→</span><span>Quantified achievement extraction and scoring</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Skill inference from experience context</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Career progression and trajectory analysis</span></li>
              <li className="flex items-start"><span className="mr-2">→</span><span>Standout factor identification</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section className="mb-12 pt-12 border-t-2 border-black">
        <h2 className="text-3xl font-bold mb-8">Under the Hood</h2>
        <p className="text-sm text-gray-600 mb-6">
          This is a real engineering project, not a wrapper around a single API call. Here&apos;s
          what&apos;s actually running when you hit &quot;Analyze.&quot;
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-black p-6 bg-white">
            <div className="font-mono text-xs font-bold mb-3 text-gray-500">ANALYSIS ENGINE</div>
            <h3 className="text-lg font-bold mb-2">GPT-5-mini (o4-mini)</h3>
            <p className="text-sm text-gray-700 mb-3">
              Each ATS system has a dedicated analyzer with system-specific prompts that encode
              the documented parsing rules, scoring weights, and ranking thresholds. The model
              uses extended thinking to reason through section detection, keyword extraction,
              formatting analysis, and scoring calculation step by step.
            </p>
            <div className="text-xs font-mono text-gray-500">
              3 dedicated analyzers &middot; low reasoning effort for cost efficiency
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <div className="font-mono text-xs font-bold mb-3 text-gray-500">RESUME GENERATOR</div>
            <h3 className="text-lg font-bold mb-2">GPT-4o-mini + ReportLab</h3>
            <p className="text-sm text-gray-700 mb-3">
              The full analysis — scoring breakdown, near-misses, missing keywords, critical
              issues, ATS-specific data — is fed to GPT-4o-mini to restructure your resume
              content. The structured JSON output is then rendered into a single-page PDF
              with dynamic spacing that fills the entire page.
            </p>
            <div className="text-xs font-mono text-gray-500">
              3-pass page fill algorithm &middot; ATS-specific PDF templates
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <div className="font-mono text-xs font-bold mb-3 text-gray-500">INTEGRITY</div>
            <h3 className="text-lg font-bold mb-2">Anti-Hallucination Guardrails</h3>
            <p className="text-sm text-gray-700 mb-3">
              The generator is constrained to only use information from your original resume.
              Multi-layered prompt rules prevent the model from fabricating metrics, inventing
              skills, or adding experience that doesn&apos;t exist. Keywords are integrated by
              rephrasing existing bullets — not by making new claims.
            </p>
            <div className="text-xs font-mono text-gray-500">
              10 base rules &middot; ATS-specific constraints &middot; end-of-prompt enforcement
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <div className="font-mono text-xs font-bold mb-3 text-gray-500">STACK</div>
            <h3 className="text-lg font-bold mb-2">FastAPI + Next.js</h3>
            <p className="text-sm text-gray-700 mb-3">
              Python backend with FastAPI serving the analysis and generation endpoints.
              Next.js 14 frontend with App Router. PDF rendering with ReportLab.
              Full cost transparency shown for every API call — you can see exactly
              what each analysis costs to run.
            </p>
            <div className="text-xs font-mono text-gray-500">
              Python 3.11 &middot; TypeScript &middot; ReportLab &middot; OpenAI API
            </div>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Want to see how this works internally?</h2>
              <p className="text-sm text-gray-600 max-w-lg">
                This is an open engineering project. If you&apos;re curious about the prompt
                engineering, the scoring simulation, the PDF generation pipeline, or want to
                collaborate — let&apos;s connect.
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/darshjoshi"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 border-2 border-black bg-white text-black font-mono font-bold hover:bg-black hover:text-white transition-colors"
            >
              CONNECT ON LINKEDIN →
            </a>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
