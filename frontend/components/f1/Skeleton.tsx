import { Loader2 } from 'lucide-react';

export function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 p-2">
      <div className="h-6 bg-gray-200 w-1/3" />
      <div className="h-3 bg-gray-100 w-1/2" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="h-4 bg-gray-200 w-8" />
            <div className="h-4 bg-gray-100 flex-1" />
            <div className="h-4 bg-gray-200 w-16" />
          </div>
        ))}
      </div>
      <div className="h-[300px] bg-gray-50 border border-gray-200 mt-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    </div>
  );
}
