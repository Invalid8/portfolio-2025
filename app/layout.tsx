import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { Montserrat, Geist_Mono, Inter, Caveat } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/lib/context/auth";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Montserrat({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Daniel Fadamitan | Frontend Developer",
    template: "%s | Daniel Fadamitan",
  },
  description:
    "Frontend Developer specializing in React, Next.js, and TypeScript. Building accessible and user-friendly web applications with modern technologies.",
  keywords: [
    "Frontend Developer",
    "React Developer",
    "Next.js",
    "TypeScript",
    "Web Development",
    "JavaScript",
    "Portfolio",
    "Nigeria",
    "Daniel Fadamitan",
    "dalgoridim",
  ],
  authors: [{ name: "Daniel Fadamitan", url: SITE_URL }],
  creator: "Daniel Fadamitan",
  publisher: "Daniel Fadamitan",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Daniel Fadamitan | Frontend Developer",
    description:
      "Frontend Developer specializing in React, Next.js, and TypeScript. Building accessible and user-friendly web applications.",
    siteName: "Daniel Fadamitan Portfolio",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daniel Fadamitan - Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Fadamitan | Frontend Developer",
    description:
      "Frontend Developer specializing in React, Next.js, and TypeScript",
    creator: "@D_Invalid1",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Daniel Fadamitan",
  alternateName: "dalgoridim",
  url: SITE_URL,
  image: `${SITE_URL}/images/og-image.png`,
  jobTitle: "Frontend Developer",
  description:
    "Frontend Developer specializing in React, Next.js, and TypeScript.",
  knowsAbout: [
    "Frontend Development",
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Web Accessibility",
    "UI Engineering",
  ],
  sameAs: ["https://twitter.com/D_Invalid1"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Daniel Fadamitan Portfolio",
  url: SITE_URL,
  author: { "@type": "Person", name: "Daniel Fadamitan" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${caveat.variable} antialiased dark overflow-x-hidden min-h-svh`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
