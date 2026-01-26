'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ATSSelector } from '@/components/ats-boss/ATSSelector';
import { ResumeUpload } from '@/components/ats-boss/ResumeUpload';
import { JobDescInput } from '@/components/ats-boss/JobDescInput';
import { AnalysisResults } from '@/components/ats-boss/AnalysisResults';
import { useAPI } from '@/lib/hooks/useAPI';
import { atsBossAPI, type AnalyzeRequest, type AnalysisResponse } from '@/lib/api/apps/ats-boss';

export default function ATSBoss() {
  const [atsSystem, setAtsSystem] = useState<string>('');
  const [resumeBase64, setResumeBase64] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  const { data, loading, error, execute, reset } = useAPI<AnalysisResponse>(
    atsBossAPI.analyzeResume
  );

  const handleFileSelect = (file: File, base64: string) => {
    setResumeBase64(base64);
  };

  const handleAnalyze = async () => {
    if (!atsSystem || !resumeBase64 || !jobDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (jobDescription.trim().length < 50) {
      alert('Job description must be at least 50 characters');
      return;
    }

    const request: AnalyzeRequest = {
      ats_system: atsSystem as 'workday' | 'greenhouse' | 'lever' | 'ashby',
      resume_file: resumeBase64,
      job_description: jobDescription.trim(),
    };

    await execute(request);
  };

  const handleReset = () => {
    setAtsSystem('');
    setResumeBase64('');
    setJobDescription('');
    reset();
  };

  return (
    <AppLayout appName="ATS BOSS">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-6 bg-white">
          <div className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-xs font-mono font-bold mb-4">
            BEAT THE ROBOTS
          </div>

          <h1 className="text-4xl font-bold mb-6">
            <span className="inline-block border-b-4 border-black pb-1">ATS Boss</span>
          </h1>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Every year, millions of qualified candidates never get past the first screening. The reason?
              Applicant Tracking Systems (ATS). Over 97% of Fortune 500 companies use ATS software like
              Workday, Greenhouse, Lever, and Ashby to automatically filter resumes before human recruiters
              ever see them. These systems scan your resume for keywords, parse your formatting, and rank
              you against other candidates—often rejecting 75% of applicants within seconds, regardless of
              their qualifications.
            </p>

            <p>
              ATS platforms use Optical Character Recognition (OCR) and Natural Language Processing (NLP)
              to extract information from your resume. They look for exact keyword matches from the job
              description, standard section headings like &apos;Work Experience&apos; and &apos;Skills,&apos; and clean formatting
              that can be easily parsed. Each system has its own quirks: Workday prioritizes exact keyword
              matches, Greenhouse focuses on structured data extraction, Lever emphasizes semantic
              understanding, and Ashby uses advanced AI matching. A beautifully designed resume with
              graphics and tables might impress a human, but it&apos;s invisible to ATS software.
            </p>

            <p>
              ATS Boss helps you beat the system. Our tool mimics how real ATS platforms analyze resumes,
              giving you an inside look at how Workday, Greenhouse, Lever, and Ashby would score your
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

      {/* Analysis Form */}
      {!data && (
        <section className="mb-12">
          <div className="border-2 border-black p-6 bg-white">
            <h2 className="text-2xl font-bold font-mono mb-6">Analyze Your Resume</h2>

            <div className="space-y-6">
              <ATSSelector value={atsSystem} onChange={setAtsSystem} />

              <ResumeUpload onFileSelect={handleFileSelect} maxSize={5} />

              <JobDescInput value={jobDescription} onChange={setJobDescription} />

              <button
                onClick={handleAnalyze}
                disabled={loading || !atsSystem || !resumeBase64 || jobDescription.length < 50}
                className="w-full px-6 py-4 border-2 border-black bg-black text-white font-mono font-bold text-lg
                         hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ANALYZING...' : 'ANALYZE RESUME'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-12">
          <LoadingState message={`Analyzing your resume with ${atsSystem.toUpperCase()} parser...`} />
          <div className="mt-4 text-center text-sm font-mono text-gray-600">
            {atsSystem === 'ashby'
              ? 'AI-powered analysis may take 20-30 seconds. Please wait...'
              : 'This may take 10-15 seconds. Please wait...'
            }
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-12">
          <ErrorState message={error} onRetry={handleAnalyze} />
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <section className="mb-12">
          <AnalysisResults results={data.data} atsSystem={atsSystem} />

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 border-2 border-black bg-white text-black font-mono font-bold
                       hover:bg-black hover:text-white transition-colors"
            >
              ANALYZE ANOTHER RESUME
            </button>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
