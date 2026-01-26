interface ScoreCardProps {
  overallScore: number;
  keywordMatchRate: number;
  atsCompatible: boolean;
  atsSystem: string;
}

export function ScoreCard({
  overallScore,
  keywordMatchRate,
  atsCompatible,
  atsSystem
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

  return (
    <div className="border-2 border-black bg-white p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold font-mono">Analysis Results</h2>
          <p className="text-sm font-mono text-gray-600 mt-1">
            ATS System: {atsSystem.toUpperCase()}
          </p>
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
