import type { Metadata } from "next";
import ThemeProvider from "../components/ThemeProvider";
import LanguageProvider from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "Dashboard - ELITE BARBER",
  description:
    "Admin dashboard for ELITE BARBER - Manage bookings and appointments.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "/dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-secondary">{children}</div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
