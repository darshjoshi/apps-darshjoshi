import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface AppHeaderProps {
  appName: string;
  showBackButton?: boolean;
}

export function AppHeader({ appName, showBackButton = true }: AppHeaderProps) {
  return (
    <header className="border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {showBackButton ? (
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm font-bold">BACK</span>
          </Link>
        ) : (
          <div className="w-20" />
        )}

        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tight">{appName}</span>
        </div>

        <div className="w-20" />
      </div>
    </header>
  );
}
