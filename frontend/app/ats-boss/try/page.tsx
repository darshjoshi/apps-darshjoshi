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

export default function ATSBossTry() {
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
      ats_system: atsSystem as 'workday' | 'greenhouse' | 'ashby',
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
    <AppLayout appName="ATS BOSS" backUrl="/ats-boss">
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
          <LoadingState message={`Deep analysis with GPT-5-mini for ${atsSystem.toUpperCase()}...`} />
          <div className="mt-4 text-center text-sm font-mono text-gray-600">
            GPT-5-mini deep reasoning analysis takes 30-60 seconds. Please be patient...
          </div>
          <div className="mt-2 text-center text-xs font-mono text-blue-600">
            🧠 AI is thinking deeply to replicate exact ATS behavior
          </div>
          <div className="mt-2 text-center text-xs font-mono text-gray-500 italic">
            Deep reasoning = higher accuracy. Worth the wait!
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
