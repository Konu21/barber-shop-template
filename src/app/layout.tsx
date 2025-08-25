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
  adjustFontFallback: false,
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
        {/* Critical CSS inlined for above-the-fold content */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Critical CSS for initial render */
            body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .hero-content { text-align: center; color: white; z-index: 10; position: relative; }
            .hero-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
            .hero-subtitle { font-size: 1.25rem; margin-bottom: 2rem; }
            .hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
            .hero-button { padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .hero-button-primary { background: #FFC107; color: black; }
            .hero-button-secondary { border: 2px solid white; color: white; background: transparent; }
            .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1; }
            
            /* Optimized font loading */
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2') format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2') format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `,
          }}
        />

        {/* Preload critical resources */}
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

        {/* Load flag-icons asynchronously */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/css/flag-icons.min.css"
          as="style"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/css/flag-icons.min.css"
          />
        </noscript>
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
