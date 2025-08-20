"use client";

import { useState, useEffect } from "react";
import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const languageContext = useContext(LanguageContext);

  const t =
    languageContext?.t ||
    ((key: string) => {
      const translations: { [key: string]: { en: string; ro: string } } = {
        "cookies.title": { en: "Cookie Policy", ro: "Politica de Cookie-uri" },
        "cookies.message": {
          en: "We use cookies to improve your experience on our website. By continuing to use this site, you agree to our use of cookies.",
          ro: "Folosim cookie-uri pentru a îmbunătăți experiența ta pe site-ul nostru. Prin continuarea utilizării acestui site, ești de acord cu utilizarea cookie-urilor.",
        },
        "cookies.accept": { en: "Accept All", ro: "Accept Toate" },
        "cookies.decline": { en: "Decline", ro: "Respinge" },
        "cookies.details": { en: "Learn More", ro: "Află Mai Multe" },
        "cookies.close": { en: "Close", ro: "Închide" },
        "cookies.necessary.title": {
          en: "Necessary Cookies",
          ro: "Cookie-uri Necesare",
        },
        "cookies.necessary.desc": {
          en: "These cookies are essential for the website to function properly. They cannot be disabled.",
          ro: "Aceste cookie-uri sunt esențiale pentru funcționarea corectă a site-ului. Nu pot fi dezactivate.",
        },
        "cookies.functional.title": {
          en: "Functional Cookies",
          ro: "Cookie-uri Funcționale",
        },
        "cookies.functional.desc": {
          en: "These cookies enable enhanced functionality and personalization.",
          ro: "Aceste cookie-uri permit funcționalități îmbunătățite și personalizare.",
        },
        "cookies.analytics.title": {
          en: "Analytics Cookies",
          ro: "Cookie-uri de Analiză",
        },
        "cookies.analytics.desc": {
          en: "These cookies help us understand how visitors interact with our website.",
          ro: "Aceste cookie-uri ne ajută să înțelegem cum interacționează vizitatorii cu site-ul nostru.",
        },
        "cookies.data.title": {
          en: "What Data We Store",
          ro: "Ce Date Stocăm",
        },
        "cookies.data.session": {
          en: "Session data for authentication",
          ro: "Date de sesiune pentru autentificare",
        },
        "cookies.data.preferences": {
          en: "Language and theme preferences",
          ro: "Preferințe de limbă și temă",
        },
        "cookies.data.bookings": {
          en: "Booking information (name, phone, email)",
          ro: "Informații despre programări (nume, telefon, email)",
        },
        "cookies.data.analytics": {
          en: "Website usage statistics",
          ro: "Statistici de utilizare a site-ului",
        },
        "cookies.why.title": {
          en: "Why We Need This Data",
          ro: "De Ce Avem Nevoie de Aceste Date",
        },
        "cookies.why.security": {
          en: "To secure your account and prevent unauthorized access",
          ro: "Pentru a-ți securiza contul și a preveni accesul neautorizat",
        },
        "cookies.why.personalization": {
          en: "To provide personalized experience (language, theme)",
          ro: "Pentru a oferi o experiență personalizată (limbă, temă)",
        },
        "cookies.why.bookings": {
          en: "To manage your appointments and send confirmations",
          ro: "Pentru a gestiona programările tale și a trimite confirmări",
        },
        "cookies.why.improvement": {
          en: "To improve our website and services",
          ro: "Pentru a îmbunătăți site-ul nostru și serviciile",
        },
      };

      const language = languageContext?.language || "ro";
      return translations[key]?.[language] || key;
    });

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setShowBanner(false);
  };

  const decline = () => {
    localStorage.setItem("cookieConsent", "none");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Minimalist Cookie Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary/95 backdrop-blur-sm border border-separator rounded-xl shadow-2xl z-50">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Cookie Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary leading-relaxed">
                {t("cookies.message")}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                >
                  {t("cookies.details")}
                </button>
                <span className="text-xs text-secondary">•</span>
                <button
                  onClick={decline}
                  className="text-xs text-secondary hover:text-primary transition-colors"
                >
                  {t("cookies.decline")}
                </button>
                <span className="text-xs text-secondary">•</span>
                <button
                  onClick={acceptAll}
                  className="text-xs bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded-full font-medium transition-colors"
                >
                  {t("cookies.accept")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Cookie Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-separator">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-heading">
                  {t("cookies.title")}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-secondary hover:text-primary transition-colors p-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Cookie Types - Compact */}
                <div className="space-y-3">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-heading mb-1">
                      {t("cookies.necessary.title")}
                    </h3>
                    <p className="text-xs text-secondary">
                      {t("cookies.necessary.desc")}
                    </p>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-heading mb-1">
                      {t("cookies.functional.title")}
                    </h3>
                    <p className="text-xs text-secondary">
                      {t("cookies.functional.desc")}
                    </p>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-heading mb-1">
                      {t("cookies.analytics.title")}
                    </h3>
                    <p className="text-xs text-secondary">
                      {t("cookies.analytics.desc")}
                    </p>
                  </div>
                </div>

                {/* Data We Store - Compact */}
                <div>
                  <h3 className="text-sm font-semibold text-heading mb-3">
                    {t("cookies.data.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.data.session")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.data.preferences")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.data.bookings")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.data.analytics")}
                    </div>
                  </div>
                </div>

                {/* Why We Need This Data - Compact */}
                <div>
                  <h3 className="text-sm font-semibold text-heading mb-3">
                    {t("cookies.why.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.why.security")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.why.personalization")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.why.bookings")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {t("cookies.why.improvement")}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-3 pt-4 border-t border-separator">
                  <button
                    onClick={decline}
                    className="flex-1 px-4 py-2 text-sm font-medium text-secondary hover:text-primary border border-separator rounded-lg hover:bg-secondary transition-colors"
                  >
                    {t("cookies.decline")}
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                  >
                    {t("cookies.accept")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
