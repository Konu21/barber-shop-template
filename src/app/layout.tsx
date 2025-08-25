import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LanguageProvider from "./components/LanguageProvider";
import ThemeProvider from "./components/ThemeProvider";
import CookieBanner from "./components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ELITE BARBER - Professional Men's Grooming & Haircuts",
    template: "%s | ELITE BARBER",
  },
  description:
    "Professional barber shop offering premium haircuts, beard trimming, facial treatments, and grooming services for men. Book your appointment online today.",
  keywords: [
    "barber shop",
    "men's haircuts",
    "beard trimming",
    "facial treatments",
    "grooming services",
    "professional barber",
    "hair salon",
    "men's grooming",
    "online booking",
    "appointment booking",
  ],
  authors: [{ name: "ELITE BARBER" }],
  creator: "ELITE BARBER",
  publisher: "ELITE BARBER",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "ELITE BARBER - Professional Men's Grooming & Haircuts",
    description:
      "Professional barber shop offering premium haircuts, beard trimming, facial treatments, and grooming services for men. Book your appointment online today.",
    siteName: "ELITE BARBER",
    images: [
      {
        url: "/barber-bg.webp",
        width: 1200,
        height: 630,
        alt: "ELITE BARBER - Professional Men's Grooming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELITE BARBER - Professional Men's Grooming & Haircuts",
    description:
      "Professional barber shop offering premium haircuts, beard trimming, facial treatments, and grooming services for men.",
    images: ["/barber-bg.webp"],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    "theme-color": "#000000",
    "color-scheme": "dark light",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources with higher priority */}
        <link
          rel="preload"
          href="/barber-bg.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Add flag-icons CSS with better loading strategy */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/css/flag-icons.min.css"
          media="print"
          onLoad="this.media='all'"
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              <main id="main-content" className="flex-1" role="main">
                {children}
              </main>
              <CookieBanner />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
