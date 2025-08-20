"use client";

import { useContext } from "react";
import { LanguageContext } from "../components/LanguageProvider";
import Link from "next/link";

export default function PrivacyPolicy() {
  const languageContext = useContext(LanguageContext);

  const t = languageContext?.t || ((key: string) => key);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            {t("privacy.title")}
          </h1>
          <p className="text-secondary">{t("privacy.lastUpdated")}</p>
        </header>

        {/* Content */}
        <main className="bg-primary rounded-2xl shadow-xl border border-separator p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-secondary leading-relaxed">
              {t("privacy.intro")}
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.data.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  📅 Booking Data
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.data.booking")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🌐 Website Usage
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.data.usage")}
                </p>
              </div>
            </div>
          </section>

          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.purpose.title")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-secondary text-sm">
                  {t("privacy.purpose.booking")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-secondary text-sm">
                  {t("privacy.purpose.communication")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-secondary text-sm">
                  {t("privacy.purpose.improvement")}
                </p>
              </div>
            </div>
          </section>

          {/* Storage */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.storage.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  ⏱️ Retention Period
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.storage.duration")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🔒 Security Measures
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.storage.security")}
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.rights.title")}
            </h2>
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  👁️ Right to Access
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.rights.access")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  ✏️ Right to Rectification
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.rights.rectification")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🗑️ Right to Erasure
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.rights.erasure")}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-heading mb-2">
                  🚫 Right to Object
                </h3>
                <p className="text-secondary text-sm">
                  {t("privacy.rights.object")}
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.contact.title")}
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-secondary text-sm mb-4">
                {t("privacy.contact.description")}
              </p>
              <div className="space-y-2">
                <p className="text-secondary text-sm">
                  <strong>Email:</strong> privacy@elitebarber.com
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

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-heading mb-4">
              {t("privacy.updates.title")}
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-secondary text-sm">
                {t("privacy.updates.description")}
              </p>
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
