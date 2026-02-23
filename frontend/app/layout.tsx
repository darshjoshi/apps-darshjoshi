import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apps.darshjoshi.com'),
  title: "Apps Dashboard | Darsh Joshi",
  description: "A collection for me to collaborate with people and add new mini applications and useful AI tools to this showcase page!",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apps.darshjoshi.com',
    title: 'Apps Dashboard | Darsh Joshi',
    description: 'A collection for me to collaborate with people and add new mini applications and useful AI tools to this showcase page!',
    siteName: 'Apps Dashboard',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Apps Dashboard - Mini Product Showcase',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apps Dashboard | Darsh Joshi',
    description: 'A collection of mini applications and useful AI tools',
    creator: '@darshjoshii',
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
