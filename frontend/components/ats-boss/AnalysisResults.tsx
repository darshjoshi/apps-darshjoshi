'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/api/apps/ats-boss';
import { ScoreCard } from './ScoreCard';
import { RecommendationList } from './RecommendationList';
import { CostDisplay } from './CostDisplay';

interface AnalysisResultsProps {
  results: AnalysisResult;
  atsSystem: string;
}

export function AnalysisResults({ results, atsSystem }: AnalysisResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('recommendations');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ title, isExpanded, onClick }: { title: string; isExpanded: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-gray-100 transition-colors"
    >
      <h3 className="text-lg font-bold font-mono">{title}</h3>
      <span className="text-2xl font-mono">{isExpanded ? '−' : '+'}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <ScoreCard
        overallScore={results.overall_score}
        keywordMatchRate={results.keyword_match_rate}
        atsCompatible={results.ats_compatible}
        atsSystem={atsSystem}
      />

      {/* Recommendations Section */}
      <div>
        <SectionHeader
          title="RECOMMENDATIONS"
          isExpanded={expandedSection === 'recommendations'}
          onClick={() => toggleSection('recommendations')}
        />
        {expandedSection === 'recommendations' && (
          <div className="border-2 border-t-0 border-black p-6">
            <RecommendationList recommendations={results.recommendations} />
          </div>
        )}
      </div>

      {/* Keyword Analysis Section */}
      <div>
        <SectionHeader
          title="KEYWORD ANALYSIS"
          isExpanded={expandedSection === 'keywords'}
          onClick={() => toggleSection('keywords')}
        />
        {expandedSection === 'keywords' && (
          <div className="border-2 border-t-0 border-black p-6 space-y-4">
            {/* Matched Keywords */}
            <div>
              <h4 className="text-sm font-mono font-semibold text-green-600 mb-2">
                MATCHED KEYWORDS ({results.keyword_analysis.matched_keywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.keyword_analysis.matched_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 border-2 border-green-600 bg-green-50 text-green-700 text-sm font-mono"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="text-sm font-mono font-semibold text-red-600 mb-2">
                MISSING KEYWORDS ({results.keyword_analysis.missing_keywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.keyword_analysis.missing_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 border-2 border-red-600 bg-red-50 text-red-700 text-sm font-mono"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Keyword Density */}
            <div className="pt-4 border-t-2 border-gray-200">
              <div className="text-sm font-mono text-gray-600">
                Keyword Density: <span className="font-bold">{(results.keyword_analysis.keyword_density * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parsing Results Section */}
      <div>
        <SectionHeader
          title="PARSING RESULTS"
          isExpanded={expandedSection === 'parsing'}
          onClick={() => toggleSection('parsing')}
        />
        {expandedSection === 'parsing' && (
          <div className="border-2 border-t-0 border-black p-6 space-y-4">
            {/* Successfully Extracted */}
            <div>
              <h4 className="text-sm font-mono font-semibold text-green-600 mb-2">
                SUCCESSFULLY EXTRACTED
              </h4>
              <ul className="space-y-1">
                {results.parsing_results.extracted_sections.map((section, idx) => (
                  <li key={idx} className="text-sm font-mono flex items-center gap-2">
                    <span className="text-green-600">✓</span> {section}
                  </li>
                ))}
              </ul>
            </div>

            {/* Failed to Parse */}
            {results.parsing_results.failed_sections.length > 0 && (
              <div>
                <h4 className="text-sm font-mono font-semibold text-red-600 mb-2">
                  FAILED TO PARSE
                </h4>
                <ul className="space-y-1">
                  {results.parsing_results.failed_sections.map((section, idx) => (
                    <li key={idx} className="text-sm font-mono flex items-center gap-2">
                      <span className="text-red-600">✗</span> {section}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting Issues */}
            {results.parsing_results.formatting_issues.length > 0 && (
              <div>
                <h4 className="text-sm font-mono font-semibold text-yellow-600 mb-2">
                  FORMATTING ISSUES
                </h4>
                <ul className="space-y-1">
                  {results.parsing_results.formatting_issues.map((issue, idx) => (
                    <li key={idx} className="text-sm font-mono flex items-center gap-2">
                      <span className="text-yellow-600">⚠</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATS-Specific Tips Section */}
      <div>
        <SectionHeader
          title={`${atsSystem.toUpperCase()} SPECIFIC TIPS`}
          isExpanded={expandedSection === 'tips'}
          onClick={() => toggleSection('tips')}
        />
        {expandedSection === 'tips' && (
          <div className="border-2 border-t-0 border-black p-6">
            <ul className="space-y-3">
              {results.ats_specific_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-mono text-lg">→</span>
                  <span className="text-sm font-mono flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cost/Usage Display */}
      <CostDisplay usage={results.usage} />
    </div>
  );
}
