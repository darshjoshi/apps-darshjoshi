import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare | F1 Everything",
  description: "Compare F1 drivers, teams, and cross-year performance with overlay charts and detailed metrics.",
  openGraph: {
    type: 'website',
    title: 'Compare | F1 Everything',
    description: 'Compare F1 drivers, teams, and cross-year performance.',
    url: 'https://apps.darshjoshi.com/f1/compare',
    images: [{
      url: '/api/og?title=Compare&description=Compare F1 drivers teams and performance',
      width: 1200, height: 630,
      alt: 'Compare - F1 Everything',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare | F1 Everything',
    description: 'Compare F1 drivers, teams, and cross-year performance.',
    creator: '@darshjoshii',
    images: ['/api/og?title=Compare&description=Compare F1 drivers teams and performance'],
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
