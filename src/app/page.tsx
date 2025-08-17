"use client";

import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageToggle from "@/app/components/LanguageToggle";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import ServicesSection from "@/app/components/ServicesSection";
import LocationSection from "@/app/components/LocationSection";
import BookingSection from "@/app/components/BookingSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-primary transition-colors duration-300">
      <Navbar />
      <ThemeToggle />
      <LanguageToggle />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <LocationSection />
      <BookingSection />
    </main>
  );
}
