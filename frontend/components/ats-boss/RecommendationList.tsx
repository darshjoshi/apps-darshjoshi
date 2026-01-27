import type { Recommendation, DeepRecommendation } from '@/lib/api/apps/ats-boss';

// Type guard to check if it's an old-style recommendation
function isOldRecommendation(rec: Recommendation | DeepRecommendation): rec is Recommendation {
  return 'priority' in rec && 'issue' in rec && 'suggestion' in rec;
}

interface RecommendationListProps {
  recommendations: (Recommendation | DeepRecommendation)[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-600 bg-red-50';
      case 'medium':
        return 'border-yellow-600 bg-yellow-50';
      case 'low':
        return 'border-green-600 bg-green-50';
      default:
        return 'border-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'HIGH PRIORITY';
      case 'medium':
        return 'MEDIUM PRIORITY';
      case 'low':
        return 'LOW PRIORITY';
      default:
        return priority.toUpperCase();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('keyword')) return 'border-blue-600 bg-blue-50';
    if (category.includes('format')) return 'border-purple-600 bg-purple-50';
    if (category.includes('structure')) return 'border-orange-600 bg-orange-50';
    if (category.includes('achievement')) return 'border-green-600 bg-green-50';
    if (category.includes('skill')) return 'border-cyan-600 bg-cyan-50';
    return 'border-gray-600 bg-gray-50';
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 font-mono">
        No recommendations needed. Your resume looks great!
      </div>
    );
  }

  // Check if we have old-style or new-style recommendations
  const hasOldStyle = recommendations.some(r => isOldRecommendation(r));

  if (hasOldStyle) {
    // Old-style recommendations grouped by priority
    const oldRecs = recommendations.filter(isOldRecommendation);
    const priorityOrder: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

    return (
      <div className="space-y-6">
        {priorityOrder.map((priority) => {
          const items = oldRecs.filter(r => r.priority === priority);
          if (items.length === 0) return null;

          return (
            <div key={priority}>
              <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
                <span>{getPriorityIcon(priority)}</span>
                <span>{getPriorityLabel(priority)}</span>
                <span className="text-gray-600">({items.length})</span>
              </h4>
              <div className="space-y-3">
                {items.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`border-2 p-4 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-1 border border-black bg-white">
                          {rec.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-mono font-semibold">
                        Issue: {rec.issue}
                      </div>
                      <div className="text-sm font-mono text-gray-700">
                        → {rec.suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // New-style deep recommendations from GPT-5-mini
  const deepRecs = recommendations as DeepRecommendation[];

  return (
    <div className="space-y-4">
      {deepRecs.map((rec, idx) => (
        <div
          key={idx}
          className={`border-2 p-4 ${getCategoryColor(rec.category)}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold px-2 py-1 border border-black bg-white">
                {rec.category.toUpperCase()}
              </span>
              {rec.expected_impact && (
                <span className="text-xs font-mono font-bold text-green-700 bg-green-100 px-2 py-1">
                  {rec.expected_impact}
                </span>
              )}
            </div>
            <div className="text-sm font-mono">
              <span className="text-gray-600">Current: </span>
              <span className="font-semibold">{rec.current_state}</span>
            </div>
            <div className="text-sm font-mono text-green-700 bg-green-50 p-2 border border-green-300">
              <span className="font-bold">→ Fix: </span>
              {rec.recommended_change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
