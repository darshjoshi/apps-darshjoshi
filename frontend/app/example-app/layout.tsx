import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example App | Apps Dashboard",
  description: "A template application demonstrating backend integration with clean architecture. Test the API connection and explore full-stack development patterns.",
  openGraph: {
    type: 'website',
    title: 'Example App | Apps Dashboard',
    description: 'A template application demonstrating backend integration with clean architecture.',
    url: 'https://apps.darshjoshi.com/example-app',
    images: [
      {
        url: '/api/og?title=Example App&description=A template application demonstrating backend integration',
        width: 1200,
        height: 630,
        alt: 'Example App - Apps Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Example App | Apps Dashboard',
    description: 'A template application demonstrating backend integration',
    creator: '@darshjoshii',
    images: ['/api/og?title=Example App&description=A template application demonstrating backend integration'],
  },
};

export default function ExampleAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
