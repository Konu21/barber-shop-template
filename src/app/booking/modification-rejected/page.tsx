"use client";

import Link from "next/link";
import { useContext } from "react";
import { LanguageContext } from "@/app/components/LanguageProvider";
import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageToggle from "@/app/components/LanguageToggle";

export default function ModificationRejectedPage() {
  const languageContext = useContext(LanguageContext);
  const t = languageContext?.t || ((key: string) => key);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 sm:p-6">
      {/* Theme and Language Toggles */}
      <div className="fixed bottom-2 right-2 sm:top-4 sm:right-4 flex z-50">
        <div className="sm:scale-100">
          <ThemeToggle />
        </div>
        <div className=" sm:scale-100">
          <LanguageToggle />
        </div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md mx-auto bg-primary rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center">
        <div className="mb-4 sm:mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 mb-3 sm:mb-4">
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-red-600"
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
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-heading mb-2">
            {t("modification.rejected.title")}
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed px-2 sm:px-0">
            {t("modification.rejected.subtitle")}
          </p>
        </div>

        <div className="bg-secondary rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left">
          <h3 className="font-semibold text-heading mb-2 text-sm sm:text-base">
            {t("modification.rejected.whatHappened")}
          </h3>
          <ul className="text-xs sm:text-sm text-secondary space-y-1.5 sm:space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t("modification.rejected.step1")}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t("modification.rejected.step2")}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t("modification.rejected.step3")}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{t("modification.rejected.step4")}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-4 py-3 sm:py-2 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200"
          >
            {t("modification.backToSite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
