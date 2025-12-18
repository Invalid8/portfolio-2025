import type { Metadata } from "next";
import { Montserrat, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth";
import { SurpriseUIProvider } from "@/lib/context/suprise-props";
import Navbar from "./_components/Navbar";
import { PageProvider } from "@/lib/context/PageContent";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bebasNeue = Montserrat({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Some Portfolio",
  description: "Yh definitely a portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased dark overflow-hidden`}
      >
        <AuthProvider>
          <PageProvider>
            <SurpriseUIProvider>
              <Navbar />
              {children}
            </SurpriseUIProvider>
          </PageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
