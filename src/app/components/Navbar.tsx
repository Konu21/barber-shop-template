"use client";

import { useState, useContext } from "react";
import { LanguageContext } from "./LanguageProvider";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const context = useContext(LanguageContext);

  if (!context) {
    return null;
  }

  const { t } = context;

  const navItems = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#location", label: t("nav.location") },
    { href: "#booking", label: t("nav.booking") },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    scrollToSection(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-separator">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-accent">
              <span className="text-heading">ELITE</span>
              <span className="text-accent">BARBER</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-primary hover:text-accent transition-colors duration-300 font-medium cursor-pointer"
                onClick={(e) => handleNavClick(item.href, e)}
              >
                {item.label}
              </a>
            ))}
            <button
              className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
              onClick={() => {
                closeMenu();
                scrollToSection("#booking");
              }}
            >
              {t("nav.bookNow")}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary hover:text-accent transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-primary/95 backdrop-blur-md border-t border-separator py-4">
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-primary hover:text-accent hover:bg-highlight transition-all duration-300 transform hover:translate-x-2 relative overflow-hidden cursor-pointer"
                  onClick={(e) => handleNavClick(item.href, e)}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isMenuOpen
                      ? "slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                      : "none",
                    opacity: 0,
                    transform: "translateX(-100%)",
                  }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-accent/10 transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
                </a>
              ))}
              <div
                className="px-4 pt-3"
                style={{
                  animationDelay: "600ms",
                  animation: isMenuOpen
                    ? "slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                    : "none",
                  opacity: 0,
                  transform: "translateX(-100%)",
                }}
              >
                <button
                  className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => {
                    closeMenu();
                    scrollToSection("#booking");
                  }}
                >
                  {t("nav.bookNow")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-100%) scale(0.95);
          }
          50% {
            opacity: 0.5;
            transform: translateX(-50%) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </nav>
  );
}
