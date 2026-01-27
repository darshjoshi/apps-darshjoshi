import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try ATS Boss | Resume Analyzer",
  description: "Analyze your resume against Workday, Greenhouse, and Ashby ATS systems. Get instant feedback and actionable recommendations to beat the robots.",
  openGraph: {
    type: 'website',
    title: 'Try ATS Boss | Resume Analyzer',
    description: 'Upload your resume and get instant ATS analysis. See how Workday, Greenhouse, and Ashby would score your application.',
    url: 'https://apps.darshjoshi.com/ats-boss/try',
    images: [
      {
        url: '/api/og?title=Try ATS Boss&description=Analyze your resume against real ATS systems',
        width: 1200,
        height: 630,
        alt: 'ATS Boss - Resume Analyzer Tool',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Try ATS Boss | Resume Analyzer',
    description: 'Upload your resume and get instant ATS analysis. Beat the robots.',
    creator: '@darshjoshii',
    images: ['/api/og?title=Try ATS Boss&description=Analyze your resume against real ATS systems'],
  },
};

export default function ATSBossTryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
