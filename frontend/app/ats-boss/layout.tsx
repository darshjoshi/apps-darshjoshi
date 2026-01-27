import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATS Boss | Beat the ATS Robots',
  description: 'Learn how Workday, Greenhouse, and Ashby ATS systems work. Understand what we replicate and how to optimize your resume for each platform.',
  openGraph: {
    type: 'website',
    title: 'ATS Boss | Beat the ATS Robots',
    description: 'Learn how Workday, Greenhouse, and Ashby ATS systems work. Understand what we replicate and how to optimize your resume for each platform.',
    url: 'https://apps.darshjoshi.com/ats-boss',
    images: [
      {
        url: '/api/og?title=ATS Boss&description=Beat the ATS robots. Optimize your resume for Workday, Greenhouse, and Ashby.',
        width: 1200,
        height: 630,
        alt: 'ATS Boss - Resume Analyzer',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATS Boss | Beat the ATS Robots',
    description: 'Learn how ATS systems work and what we replicate. Optimize your resume for Workday, Greenhouse, and Ashby.',
    creator: '@darshjoshii',
    images: ['/api/og?title=ATS Boss&description=Beat the ATS robots. Optimize your resume for Workday, Greenhouse, and Ashby.'],
  },
};

export default function ATSBossLayout({ children }: { children: React.ReactNode }) {
  return children;
}
