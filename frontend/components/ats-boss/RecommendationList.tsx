import type { Recommendation } from '@/lib/api/apps/ats-boss';

interface RecommendationListProps {
  recommendations: Recommendation[];
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

  // Group by priority
  const grouped = recommendations.reduce((acc, rec) => {
    if (!acc[rec.priority]) {
      acc[rec.priority] = [];
    }
    acc[rec.priority].push(rec);
    return {};
  }, {} as Record<string, Recommendation[]>);

  const priorityOrder: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 font-mono">
        No recommendations needed. Your resume looks great!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {priorityOrder.map((priority) => {
        const items = recommendations.filter(r => r.priority === priority);
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
