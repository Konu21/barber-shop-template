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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: "50px", // Start loading 50px before the section comes into view
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const img = new Image();
      img.onload = () => {
        setIsImageLoaded(true);
      };
      img.src = "/barber-bg.webp";
    }
  }, [isVisible]);

  // Early return after all hooks are called
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

  // Text color based on theme
  const textColor = theme === "light" ? "text-white" : "text-white";
  const subtitleColor = theme === "light" ? "text-gray-200" : "text-gray-200";
  const buttonBorderColor = theme === "light" ? "border-white" : "border-white";
  const buttonHoverBg = theme === "light" ? "hover:bg-white" : "hover:bg-white";
  const buttonHoverText =
    theme === "light" ? "hover:text-black" : "hover:text-black";

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`relative h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 ${
        isImageLoaded
          ? "bg-[url('/barber-bg.webp')] bg-cover bg-center bg-no-repeat"
          : "bg-gradient-to-br from-gray-900 to-gray-700"
      }`}
    >
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h2
          className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${textColor}`}
        >
          {t("hero.title")}
        </h2>
        <p
          className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto ${subtitleColor}`}
        >
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
            className={`border-2 ${buttonBorderColor} ${buttonHoverBg} ${buttonHoverText} font-semibold text-lg px-8 py-4 rounded-lg transition-all flex items-center justify-center ${textColor}`}
            onClick={() => scrollToSection("#services")}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

      {/* Background overlay - darker on light theme */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
          theme === "light" ? "bg-black/40" : "bg-black/40"
        }`}
      ></div>

      {/* Loading indicator */}
      {isVisible && !isImageLoaded && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}
    </section>
  );
}
