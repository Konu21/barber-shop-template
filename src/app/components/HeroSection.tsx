"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { LanguageContext } from "./LanguageProvider";
import { ThemeContext } from "./ThemeProvider";
import Image from "next/image";
import Head from "next/head"; // ✅ pentru preload (pages router)

export default function HeroSection() {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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

  if (!languageContext || !themeContext) {
    return null;
  }

  const { t } = languageContext;

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ✅ Preload pentru imaginea LCP */}
      <Head>
        <link
          rel="preload"
          as="image"
          href="/barber-bg.webp"
          type="image/webp"
        />
      </Head>

      <section
        ref={sectionRef}
        id="hero"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/barber-bg.webp"
            alt="ELITE BARBER Background"
            fill
            priority
            quality={70} // ✅ redus de la 85
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
            className={`object-cover object-center transition-opacity duration-700 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
          />
        </div>

        {/* Overlay */}
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
              {t("hero.book")}
            </button>
            <button
              className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold text-lg px-8 py-4 rounded-lg transition-all flex items-center justify-center"
              onClick={() => scrollToSection("#services")}
            >
              {t("hero.learn")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
