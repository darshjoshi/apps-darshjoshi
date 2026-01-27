import { ReactNode } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { AppFooter } from '@/components/shared/AppFooter';

interface AppLayoutProps {
  appName: string;
  children: ReactNode;
  showBackButton?: boolean;
  backUrl?: string;
}

export function AppLayout({ appName, children, showBackButton = true, backUrl }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black grid-bg">
      <AppHeader appName={appName} showBackButton={showBackButton} backUrl={backUrl} />
      <main className="max-w-5xl mx-auto px-6 py-20">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
