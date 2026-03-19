import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Replay | F1 Everything",
  description: "Relive any F1 race lap-by-lap. Scrub through the timeline or watch in cinematic mode with live telemetry.",
  openGraph: {
    type: 'website',
    title: 'Race Replay | F1 Everything',
    description: 'Relive any F1 race lap-by-lap with full telemetry and race control data.',
    url: 'https://apps.darshjoshi.com/f1/replay',
    images: [{
      url: '/api/og?title=Race Replay&description=Relive any F1 race lap-by-lap',
      width: 1200, height: 630,
      alt: 'Race Replay - F1 Everything',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Race Replay | F1 Everything',
    description: 'Relive any F1 race lap-by-lap with full telemetry and race control data.',
    creator: '@darshjoshii',
    images: ['/api/og?title=Race Replay&description=Relive any F1 race lap-by-lap'],
  },
};

export default function ReplayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
