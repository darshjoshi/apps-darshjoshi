import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Search X-Ray | Apps Dashboard",
  description: "Generate powerful Google search queries to find jobs on Greenhouse, Lever, Workday, and other ATS platforms. X-Ray search strategies for job seekers.",
  openGraph: {
    type: 'website',
    title: 'Job Search X-Ray | Apps Dashboard',
    description: 'Generate powerful Google search queries to find jobs on Greenhouse, Lever, Workday, and other ATS platforms. X-Ray search strategies for job seekers.',
    url: 'https://apps.darshjoshi.com/job-finder',
    images: [
      {
        url: '/api/og?title=Job Search X-Ray&description=Generate powerful Google search queries for job hunting',
        width: 1200,
        height: 630,
        alt: 'Job Search X-Ray - Apps Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Search X-Ray | Apps Dashboard',
    description: 'Generate powerful Google search queries to find jobs on Greenhouse, Lever, Workday, and other ATS platforms. X-Ray search strategies for job seekers.',
    creator: '@darshjoshii',
    images: ['/api/og?title=Job Search X-Ray&description=Generate powerful Google search queries for job hunting'],
  },
};

export default function JobFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
