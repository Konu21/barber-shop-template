"use client";

import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";
import { ThemeContext } from "./ThemeProvider";
import { services } from "../data/services";

export default function ServicesSection() {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);

  if (!languageContext || !themeContext) {
    return null;
  }

  const { t } = languageContext;
  const { theme } = themeContext;

  // Service descriptions mapping
  const serviceDescriptions: { [key: string]: string } = {
    "tundere-clasica": t("services.haircut.desc"),
    "styling-modern": t("services.styling.desc"), // adaugă în translations dacă nu există
    "aranjare-barba": t("services.beard.desc"),
    "tratament-facial": t("services.facial.desc"),
    "pachet-complet": t("services.package.desc"), // adaugă în translations dacă nu există
    "tundere-copii": t("services.kids.desc"), // adaugă în translations dacă nu există
  };

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-heading mb-4">
              {t("services.title")}
            </h3>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              {t("services.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const isPackage = service.id === "pachet-complet";

              return (
                <div
                  key={service.id}
                  className={`${
                    isPackage
                      ? "bg-[#1A1A1A] text-white border-gray-700"
                      : "bg-secondary border-separator"
                  } border rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
                >
                  <div className="p-8 text-center">
                    <h4
                      className={`text-2xl font-bold mb-4 ${
                        isPackage ? "text-white" : "text-heading"
                      }`}
                    >
                      {t(`services.${service.id}.name`)} {/* titlu tradus */}
                    </h4>
                    <p
                      className={`mb-6 ${
                        isPackage ? "text-gray-300" : "text-secondary"
                      }`}
                    >
                      {t(`services.${service.id}.desc`)}{" "}
                      {/* descriere tradusă */}
                    </p>
                    <div className="text-3xl font-bold text-accent mb-4">
                      {service.price} RON
                    </div>
                    <div
                      className={`text-sm ${
                        isPackage ? "text-gray-400" : "text-secondary"
                      }`}
                    >
                      {service.duration}
                    </div>
                    {isPackage && (
                      <div className="mt-4 text-sm text-white font-semibold">
                        {t("services.package.savings")}{" "}
                        {/* dacă vrei și text suplimentar */}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
