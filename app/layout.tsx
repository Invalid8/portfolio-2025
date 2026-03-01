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
  ],
  authors: [{ name: "Daniel Fadamitan" }],
  creator: "Daniel Fadamitan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dantolu33.vercel.app",
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
    images: ["/og-image.png"],
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
