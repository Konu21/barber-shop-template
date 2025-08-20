import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import ServicesSection from "@/app/components/ServicesSection";
import LocationSection from "@/app/components/LocationSection";
import BookingSection from "@/app/components/BookingSection";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "ELITE BARBER - Professional Men's Grooming & Haircuts",
  description:
    "Professional barber shop offering premium haircuts, beard trimming, facial treatments, and grooming services for men. Book your appointment online today.",
  keywords: [
    "barber shop",
    "men's haircuts",
    "beard trimming",
    "facial treatments",
    "grooming services",
    "professional barber",
    "online booking",
  ],
  openGraph: {
    title: "ELITE BARBER - Professional Men's Grooming & Haircuts",
    description:
      "Professional barber shop offering premium haircuts, beard trimming, facial treatments, and grooming services for men.",
    url: "/",
    siteName: "ELITE BARBER",
    images: [
      {
        url: "/barber-bg.webp",
        width: 1200,
        height: 630,
        alt: "ELITE BARBER - Professional Men's Grooming",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="min-h-screen bg-primary transition-colors duration-300">
        <section id="hero" aria-label="Hero Section">
          <HeroSection />
        </section>

        <section id="about" aria-label="About Us">
          <AboutSection />
        </section>

        <section id="services" aria-label="Our Services">
          <ServicesSection />
        </section>

        <section id="contact" aria-label="Contact Information">
          <LocationSection />
        </section>

        <section id="booking" aria-label="Book Appointment">
          <BookingSection />
        </section>
      </main>

      <footer>
        <Footer />
      </footer>
    </>
  );
}
