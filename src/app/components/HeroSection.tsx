"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { LanguageContext } from "./LanguageProvider";
import { ThemeContext } from "./ThemeProvider";

export default function HeroSection() {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Preload image immediately for better LCP
    const img = new Image();
    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => setIsImageLoaded(false);
    img.src = "/barber-bg.webp";

    // Optimized intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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

  if (!languageContext || !themeContext) {
    return null;
  }

  const { t } = languageContext;
  const { theme } = themeContext;

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
      className={`relative h-screen flex items-center justify-center overflow-hidden ${
        isImageLoaded
          ? "bg-[url('/barber-bg.webp')] bg-cover bg-center bg-no-repeat"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      }`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
          {t("hero.title")}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-200">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="bg-accent hover:bg-accent-hover text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
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
            {t("hero.book")}
          </button>
          <button
            className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold text-lg px-8 py-4 rounded-lg transition-all flex items-center justify-center"
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
            {t("hero.learn")}
          </button>
        </div>
      </div>
    </section>
  );
}
