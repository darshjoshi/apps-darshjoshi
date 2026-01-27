'use client';

import { useState } from 'react';
import { atsBossAPI, type AnalysisResult, type GeneratePDFRequest } from '@/lib/api/apps/ats-boss';

interface GeneratePDFButtonProps {
  atsSystem: string;
  resumeText: string;
  jobDescription: string;
  analysisResult: AnalysisResult;
  disabled?: boolean;
}

export function GeneratePDFButton({
  atsSystem,
  resumeText,
  jobDescription,
  analysisResult,
  disabled = false,
}: GeneratePDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    if (!resumeText || !jobDescription || !analysisResult) {
      setError('Missing required data for PDF generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: GeneratePDFRequest = {
        ats_system: atsSystem as 'workday' | 'greenhouse' | 'ashby',
        resume_text: resumeText,
        job_description: jobDescription,
        analysis_result: analysisResult,
      };

      const blob = await atsBossAPI.generatePDF(request);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_optimized_${atsSystem}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGeneratePDF}
        disabled={disabled || loading || !resumeText}
        className="flex-1 px-6 py-3 border-2 border-black bg-black text-white font-mono font-bold
                   hover:bg-white hover:text-black transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            GENERATING PDF...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            GENERATE OPTIMIZED PDF
          </>
        )}
      </button>

      {loading && (
        <div className="text-center text-xs font-mono text-gray-600">
          GPT-5-mini is optimizing your resume for {atsSystem.toUpperCase()}...
        </div>
      )}

      {error && (
        <div className="text-center text-sm font-mono text-red-600">
          {error}
        </div>
      )}

      {!resumeText && !error && (
        <div className="text-center text-xs font-mono text-amber-600">
          Resume text not available. Re-analyze to enable PDF generation.
        </div>
      )}
    </div>
  );
}
