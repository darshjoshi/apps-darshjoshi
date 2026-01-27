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
              Every year, millions of qualified candidates never get past the first screening. The reason?
              Applicant Tracking Systems (ATS). Over 97% of Fortune 500 companies use ATS software like
              Workday, Greenhouse, and Ashby to automatically filter resumes before human recruiters
              ever see them. These systems scan your resume for keywords, parse your formatting, and rank
              you against other candidates—often rejecting 75% of applicants within seconds, regardless of
              their qualifications.
            </p>

            <p>
              ATS platforms use Optical Character Recognition (OCR) and Natural Language Processing (NLP)
              to extract information from your resume. They look for exact keyword matches from the job
              description, standard section headings like &apos;Work Experience&apos; and &apos;Skills,&apos; and clean formatting
              that can be easily parsed. Each system has its own quirks: Workday prioritizes exact keyword
              matches, Greenhouse focuses on structured data extraction, and Ashby uses advanced AI matching.
              A beautifully designed resume with
              graphics and tables might impress a human, but it&apos;s invisible to ATS software.
            </p>

            <p>
              ATS Boss helps you beat the system. Our tool mimics how real ATS platforms analyze resumes,
              giving you an inside look at how Workday, Greenhouse, and Ashby would score your
              application. Simply select your target ATS, upload your resume, paste the job description,
              and receive a comprehensive analysis showing exactly what the system sees—and what it doesn&apos;t.
              Get actionable recommendations to optimize your resume for maximum ATS compatibility while
              maintaining your unique professional story.
            </p>

            <p>
              Stop wondering why you&apos;re not getting callbacks. With ATS Boss, you can test and refine your
              resume for each application, ensuring you make it past the automated gatekeepers and into the
              hands of real hiring managers. Our AI-powered analysis goes beyond simple keyword counting—we
              replicate the actual parsing logic, scoring algorithms, and ranking criteria used by each
              platform. Get your resume ATS-ready in minutes, not hours.
            </p>
          </div>
        </div>
      </section>

      {/* What We Replicate Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">What We Replicate</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              ATS Boss doesn&apos;t just scan for keywords—we replicate the actual parsing logic,
              scoring algorithms, and ranking criteria used by each platform. Here&apos;s what makes
              our analysis authentic:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start">
                <span className="mr-2 mt-1 text-lg">•</span>
                <span><strong>Parsing Logic:</strong> We mimic how each ATS extracts information
                from your resume, including section detection, data extraction, and formatting analysis.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 text-lg">•</span>
                <span><strong>Keyword Matching:</strong> From Workday&apos;s exact matching to Ashby&apos;s
                AI-powered semantic understanding, we replicate each system&apos;s approach.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 text-lg">•</span>
                <span><strong>Scoring Algorithms:</strong> Our scoring reflects real ATS priorities—
                keyword density, section structure, formatting compatibility, and more.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 text-lg">•</span>
                <span><strong>Recommendations:</strong> Get specific, actionable advice tailored to
                each ATS system&apos;s quirks and preferences.</span>
              </li>
            </ul>
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
              Strict exact keyword matching. Prefers DOCX format. Standard headings required.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE REPLICATE:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Exact keyword matching (no synonyms)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Standard section heading detection</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Single-column layout verification</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Format compatibility scoring</span>
              </li>
            </ul>
          </div>

          {/* Greenhouse Card */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-green-600 text-white text-xs font-mono font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-3">Greenhouse</h3>
            <p className="text-sm text-gray-600 mb-4">
              Strong structured data extraction. Good semantic understanding. 300+ integrations.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE REPLICATE:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Semantic keyword matching capability</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Structured data extraction patterns</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Integration-focused parsing</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Standard format handling</span>
              </li>
            </ul>
          </div>

{/* Ashby Card */}
          <div className="border-2 border-black p-6 bg-white">
            <div className="inline-block mb-4 px-3 py-1 border-2 border-black bg-purple-600 text-white text-xs font-mono font-bold">
              CUTTING-EDGE AI
            </div>
            <h3 className="text-2xl font-bold mb-3">Ashby</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cutting-edge AI matching. Best at understanding context and career transitions.
            </p>
            <h4 className="font-mono text-xs font-bold mb-2">WHAT WE REPLICATE:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Advanced AI matching algorithms</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Context-aware understanding</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Pattern recognition across roles</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Quantified achievement detection</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="mb-12 pt-12 border-t-2 border-black">
        <h2 className="text-3xl font-bold mb-8">By the Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-black p-6 bg-white text-center">
            <div className="text-5xl font-bold font-mono mb-2">97%</div>
            <div className="text-sm text-gray-600">Fortune 500 companies use ATS</div>
          </div>
          <div className="border-2 border-black p-6 bg-white text-center">
            <div className="text-5xl font-bold font-mono mb-2">75%</div>
            <div className="text-sm text-gray-600">Resumes rejected by ATS within seconds</div>
          </div>
          <div className="border-2 border-black p-6 bg-white text-center">
            <div className="text-5xl font-bold font-mono mb-2">3</div>
            <div className="text-sm text-gray-600">Major ATS systems we replicate</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-12">
        <div className="border-2 border-black p-12 bg-black text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stop Guessing. Start Optimizing.</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your resume and get instant feedback from three major ATS systems.
            Know exactly how the robots see you.
          </p>
          <Link href="/ats-boss/try">
            <button className="px-8 py-4 border-2 border-white bg-white text-black font-mono font-bold text-lg hover:bg-transparent hover:text-white transition-colors">
              ANALYZE YOUR RESUME NOW →
            </button>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
