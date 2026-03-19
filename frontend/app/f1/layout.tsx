import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "F1 Everything | Apps Dashboard",
  description: "The most comprehensive free F1 analytics dashboard. Position rivers, official overtake data, weather correlations, championship predictions, pit crew rankings, and more — using data nobody else touches.",
  openGraph: {
    type: 'website',
    title: 'F1 Everything | Apps Dashboard',
    description: 'The most comprehensive free F1 analytics dashboard. Data-driven insights using untapped F1 feeds nobody else uses.',
    url: 'https://apps.darshjoshi.com/f1',
    images: [
      {
        url: '/api/og?title=F1 Everything&description=The most comprehensive free F1 analytics dashboard',
        width: 1200,
        height: 630,
        alt: 'F1 Everything - Apps Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'F1 Everything | Apps Dashboard',
    description: 'The most comprehensive free F1 analytics dashboard. Data-driven insights using untapped F1 feeds nobody else uses.',
    creator: '@darshjoshii',
    images: ['/api/og?title=F1 Everything&description=The most comprehensive free F1 analytics dashboard'],
  },
};

export default function F1Layout({ children }: { children: React.ReactNode }) {
  return children;
}
