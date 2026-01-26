import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATS Boss | Beat the ATS Robots',
  description: 'Analyze your resume against Workday, Greenhouse, Lever, and Ashby ATS systems. Get actionable recommendations to optimize your resume for maximum ATS compatibility.',
  openGraph: {
    type: 'website',
    title: 'ATS Boss | Beat the ATS Robots',
    description: 'Analyze your resume against Workday, Greenhouse, Lever, and Ashby ATS systems. Get actionable recommendations to optimize your resume for maximum ATS compatibility.',
    url: 'https://apps.darshjoshi.com/ats-boss',
    images: [
      {
        url: '/api/og?title=ATS Boss&description=Beat the ATS robots. Optimize your resume for Workday, Greenhouse, Lever, and Ashby.',
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
    description: 'Analyze your resume against Workday, Greenhouse, Lever, and Ashby ATS systems.',
    creator: '@darshjoshii',
    images: ['/api/og?title=ATS Boss&description=Beat the ATS robots. Optimize your resume for Workday, Greenhouse, Lever, and Ashby.'],
  },
};

export default function ATSBossLayout({ children }: { children: React.ReactNode }) {
  return children;
}
