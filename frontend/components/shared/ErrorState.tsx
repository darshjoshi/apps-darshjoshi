import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="border-2 border-red-600 bg-red-50 p-8">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-red-600">Error Occurred</h3>
          <p className="text-red-700 font-mono text-sm mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              TRY AGAIN
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
