"use client";

import { useContext, useEffect, useRef } from "react";
import { LanguageContext } from "./LanguageProvider";
import { ThemeContext } from "./ThemeProvider";
import Image from "next/image";

export default function HeroSection() {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Optimized intersection observer with passive listeners
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Use fallback values if context is not ready yet
  const { t, isReady: langReady } = languageContext || {
    t: null,
    isReady: false,
  };
  const { theme, isReady: themeReady } = themeContext || {
    theme: "light",
    isReady: false,
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Optimized background image with proper aspect ratio */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/barber-bg.webp"
          alt="ELITE BARBER Background"
          fill
          priority
          quality={75}
          sizes="100vh"
          className="object-cover object-center"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>

      {/* Background overlay */}
      <div className="hero-overlay"></div>

      {/* Content with critical CSS classes */}
      <div className="hero-content max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
          {langReady && t ? t("hero.title") : "Professional Barber Shop"}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-200">
          {langReady && t
            ? t("hero.subtitle")
            : "Quality haircuts and grooming services for men"}
        </p>
        <div className="hero-buttons">
          <button
            className="hero-button hero-button-primary hover:scale-105 flex items-center justify-center"
            onClick={() => scrollToSection("#booking")}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {langReady && t ? t("hero.book") : "Book Appointment"}
          </button>
          <button
            className="hero-button hero-button-secondary hover:bg-white hover:text-black flex items-center justify-center"
            onClick={() => scrollToSection("#services")}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
            {langReady && t ? t("hero.learn") : "Learn More"}
          </button>
        </div>
      </div>
    </section>
  );
}
