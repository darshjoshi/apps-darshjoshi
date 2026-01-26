import { CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

interface SuccessStateProps {
  title?: string;
  children: ReactNode;
}

export function SuccessState({ title = 'Success', children }: SuccessStateProps) {
  return (
    <div className="border-2 border-green-600 bg-green-50 p-8">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-green-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}
