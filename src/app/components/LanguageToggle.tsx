"use client";

import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";
import "/node_modules/flag-icons/css/flag-icons.min.css";

export default function LanguageToggle() {
  const context = useContext(LanguageContext);
  if (!context) {
    return null;
  }
  const { language, toggleLanguage } = context;

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-black/30 hover:border-black/50 hover:bg-black/30 transition-all duration-300 z-50 flex items-center justify-center shadow-lg hover:shadow-xl"
      aria-label={`Switch to ${language === "en" ? "Romanian" : "English"}`}
    >
      {language === "en" ? (
        <span className="relative inline-block w-6 h-6 leading-[1em] rounded-full fi-ro"></span>
      ) : (
        <span className="relative inline-block w-6 h-6 leading-[1em] rounded-full fi-gb"></span>
      )}
    </button>
  );
}
