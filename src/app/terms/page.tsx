"use client";

import { useContext } from "react";
import { LanguageContext } from "../components/LanguageProvider";
import ThemeToggle from "../components/ThemeToggle";
import LanguageToggle from "../components/LanguageToggle";
import Link from "next/link";

export default function TermsOfService() {
  const languageContext = useContext(LanguageContext);

  const t = languageContext?.t || ((key: string) => key);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Theme and Language Toggles */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            {t("terms.title")}
          </h1>
          <p className="text-secondary">{t("terms.lastUpdated")}</p>
        </header>

        {/* Content */}
        <main className="bg-primary rounded-2xl shadow-xl border border-separator p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-secondary leading-relaxed">{t("terms.intro")}</p>
          </section>

          {/* Booking Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("terms.booking.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  ✅ Accurate Information
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.booking.accuracy")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  ⏰ Cancellation Policy
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.booking.cancellation")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🚫 No-Show Policy
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.booking.noShow")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">🔄 Changes</h3>
                <p className="text-secondary text-sm">
                  {t("terms.booking.changes")}
                </p>
              </div>
            </div>
          </section>

          {/* Data Processing Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("terms.data.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">📋 Consent</h3>
                <p className="text-secondary text-sm">
                  {t("terms.data.consent")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">🎯 Purpose</h3>
                <p className="text-secondary text-sm">
                  {t("terms.data.purpose")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">💾 Storage</h3>
                <p className="text-secondary text-sm">
                  {t("terms.data.storage")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🔐 Your Rights
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.data.rights")}
                </p>
              </div>
            </div>
          </section>

          {/* Service Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("terms.service.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🎨 Service Quality
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.service.quality")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  ⏱️ Service Duration
                </h3>
                <p className="text-secondary text-sm">
                  {t("terms.service.duration")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">💰 Pricing</h3>
                <p className="text-secondary text-sm">
                  {t("terms.service.pricing")}
                </p>
              </div>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("terms.liability.title")}
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-secondary text-sm">
                {t("terms.liability.description")}
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("terms.contact.title")}
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-secondary text-sm mb-4">
                {t("terms.contact.description")}
              </p>
              <div className="space-y-2">
                <p className="text-secondary text-sm">
                  <strong>Email:</strong> terms@elitebarber.com
                </p>
                <p className="text-secondary text-sm">
                  <strong>Phone:</strong> +40 123 456 789
                </p>
                <p className="text-secondary text-sm">
                  <strong>Address:</strong> Strada Example, Nr. 123, București
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Navigation */}
        <nav className="mt-8 text-center">
          <Link
            href="/"
            className="text-accent hover:text-accent-hover transition-colors duration-300"
          >
            ← Back to Home
          </Link>
        </nav>
      </div>
    </div>
  );
}
