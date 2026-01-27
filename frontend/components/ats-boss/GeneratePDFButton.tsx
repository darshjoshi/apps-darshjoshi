'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Clean up blob URL when component unmounts or when regenerating
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleGeneratePDF = useCallback(async () => {
    if (!resumeText || !jobDescription || !analysisResult) {
      setError('Missing required data for PDF generation');
      return;
    }

    // Clean up previous URL if regenerating
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setPdfBlob(null);
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
      const url = window.URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [atsSystem, resumeText, jobDescription, analysisResult, pdfUrl]);

  const handlePreview = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  const handleDownload = useCallback(() => {
    if (pdfBlob) {
      // Create a fresh blob URL specifically for download
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `resume_optimized_${atsSystem}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    }
  }, [pdfBlob, atsSystem]);

  const handleRegenerate = useCallback(() => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfBlob(null);
    setPdfUrl(null);
    setError(null);
  }, [pdfUrl]);

  // Not ready state - missing resume text
  if (!resumeText) {
    return (
      <div className="border-2 border-dashed border-amber-400 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-700 font-mono text-sm">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Resume text not available. Re-analyze to enable PDF generation.</span>
        </div>
      </div>
    );
  }

  // PDF generated state - show preview/download options
  if (pdfBlob && pdfUrl && !loading) {
    return (
      <div className="border-2 border-black bg-white">
        {/* Success header */}
        <div className="bg-green-50 border-b-2 border-black px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-bold text-green-800">
              PDF Ready for {atsSystem.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-mono text-green-700 mt-1">
            Your ATS-optimized resume has been generated
          </p>
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            {/* Preview button */}
            <button
              onClick={handlePreview}
              className="flex-1 px-4 py-3 border-2 border-black bg-white text-black font-mono font-bold
                       hover:bg-gray-100 transition-colors
                       flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              PREVIEW
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-3 border-2 border-black bg-black text-white font-mono font-bold
                       hover:bg-gray-800 transition-colors
                       flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              DOWNLOAD
            </button>
          </div>

          {/* Regenerate link */}
          <button
            onClick={handleRegenerate}
            className="w-full text-center text-sm font-mono text-gray-500 hover:text-black transition-colors underline"
          >
            Regenerate PDF
          </button>
        </div>
      </div>
    );
  }

  // Default state - generate button
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGeneratePDF}
        disabled={disabled || loading}
        className="w-full px-6 py-4 border-2 border-black bg-black text-white font-mono font-bold text-lg
                   hover:bg-white hover:text-black transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-3"
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
            GENERATING...
          </>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            GENERATE OPTIMIZED PDF
          </>
        )}
      </button>

      {loading && (
        <div className="border-2 border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-gray-700">
              Optimizing for {atsSystem.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-mono text-gray-500">
            GPT-5-mini is restructuring your resume with ATS-specific formatting...
          </p>
        </div>
      )}

      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-red-700 font-mono text-sm">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
