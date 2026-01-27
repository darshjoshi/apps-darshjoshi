import type { Scoring, Outcome } from '@/lib/api/apps/ats-boss';

interface ScoreCardProps {
  overallScore: number;
  keywordMatchRate: number;
  atsCompatible: boolean;
  atsSystem: string;
  scoring?: Scoring;
  outcome?: Outcome;
  reasoningSummary?: string;
  analysisModel?: string;
}

export function ScoreCard({
  overallScore,
  keywordMatchRate,
  atsCompatible,
  atsSystem,
  scoring,
  outcome,
  reasoningSummary,
  analysisModel
}: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'EXCELLENT';
    if (score >= 50) return 'GOOD';
    return 'NEEDS WORK';
  };

  const getOutcomeBadgeColor = (category: string) => {
    if (category.includes('highly') || category.includes('excellent') || category.includes('strong')) {
      return 'bg-green-600 text-white';
    }
    if (category.includes('compatible') || category.includes('good')) {
      return 'bg-blue-600 text-white';
    }
    if (category.includes('borderline') || category.includes('partial') || category.includes('potential')) {
      return 'bg-yellow-600 text-white';
    }
    return 'bg-red-600 text-white';
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="border-2 border-black bg-white p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-mono">Analysis Results</h2>
            <p className="text-sm font-mono text-gray-600 mt-1">
              ATS System: {atsSystem.toUpperCase()}
            </p>
          </div>
          {analysisModel && (
            <div className="px-3 py-1 bg-blue-600 text-white text-xs font-mono font-bold">
              POWERED BY {analysisModel.toUpperCase()}
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="border-2 border-black p-4">
          <div className="text-center">
            <div className="text-sm font-mono text-gray-600 mb-2">
              OVERALL ATS SCORE
            </div>
            <div className={`text-6xl font-bold font-mono ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className={`text-lg font-mono font-semibold mt-2 ${getScoreColor(overallScore)}`}>
              {getScoreLabel(overallScore)}
            </div>
          </div>
        </div>

        {/* Outcome Badge (NEW - from GPT-5-mini) */}
        {outcome && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-2 border-black bg-gray-50">
            <div className={`px-6 py-3 border-2 border-black font-mono font-bold text-sm ${getOutcomeBadgeColor(outcome.category)}`}>
              {formatCategory(outcome.category)}
            </div>
            <div className="text-center sm:text-right space-y-1">
              <div className="text-sm font-mono">
                <span className="text-gray-600">Would reach human: </span>
                <span className={outcome.would_reach_human ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {outcome.would_reach_human ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="text-sm font-mono">
                <span className="text-gray-600">Queue position: </span>
                <span className="font-bold">{outcome.queue_position.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reasoning Summary (NEW - from GPT-5-mini) */}
        {reasoningSummary && (
          <div className="p-4 border-2 border-gray-300 bg-gray-50 italic text-sm font-mono text-gray-700">
            &ldquo;{reasoningSummary}&rdquo;
          </div>
        )}

        {/* Score Breakdown (NEW - from GPT-5-mini) */}
        {scoring && (
          <>
            {/* Workday Breakdown */}
            {atsSystem === 'workday' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.keyword_score)}`}>
                    {scoring.keyword_score}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">KEYWORDS (70%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.section_score)}`}>
                    {scoring.section_score}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">SECTIONS (20%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.format_score)}`}>
                    {scoring.format_score}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">FORMAT (10%)</div>
                </div>
              </div>
            )}

            {/* Greenhouse Breakdown */}
            {atsSystem === 'greenhouse' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.keyword_score)}`}>
                    {scoring.keyword_score}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">KEYWORDS (50%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.data_quality_score || 0)}`}>
                    {scoring.data_quality_score || 0}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">DATA QUALITY (30%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.experience_alignment_score || 0)}`}>
                    {scoring.experience_alignment_score || 0}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">EXPERIENCE (20%)</div>
                </div>
              </div>
            )}

            {/* Ashby Breakdown */}
            {atsSystem === 'ashby' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.achievement_score || 0)}`}>
                    {scoring.achievement_score || 0}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">ACHIEVEMENTS (35%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.skills_score || 0)}`}>
                    {scoring.skills_score || 0}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">SKILLS (30%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.progression_score || 0)}`}>
                    {scoring.progression_score || 0}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">PROGRESSION (20%)</div>
                </div>
                <div className="border-2 border-black p-3 text-center">
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(scoring.cultural_fit_score || 50)}`}>
                    {scoring.cultural_fit_score || 50}%
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-1">CULTURAL FIT (15%)</div>
                </div>
              </div>
            )}

          </>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Keyword Match Rate */}
          <div className="border-2 border-black p-4">
            <div className="text-xs font-mono text-gray-600 mb-2">
              KEYWORD MATCH
            </div>
            <div className={`text-3xl font-bold font-mono ${getScoreColor(keywordMatchRate)}`}>
              {keywordMatchRate}%
            </div>
          </div>

          {/* Compatibility Status */}
          <div className="border-2 border-black p-4">
            <div className="text-xs font-mono text-gray-600 mb-2">
              ATS STATUS
            </div>
            <div className={`text-xl font-bold font-mono ${atsCompatible ? 'text-green-600' : 'text-red-600'}`}>
              {atsCompatible ? 'PASS' : 'FAIL'}
            </div>
            <div className="text-xs font-mono text-gray-600 mt-1">
              {atsCompatible ? 'Likely to pass' : 'May be rejected'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="text-xs font-mono text-gray-600 mb-2">
            COMPATIBILITY PROGRESS
          </div>
          <div className="h-4 border-2 border-black bg-white">
            <div
              className={`h-full transition-all duration-500 ${
                overallScore >= 75 ? 'bg-green-600' :
                overallScore >= 50 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
