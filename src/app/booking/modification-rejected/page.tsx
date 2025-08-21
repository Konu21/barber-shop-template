"use client";

import Link from "next/link";
import { useContext } from "react";
import { LanguageContext } from "@/app/components/LanguageProvider";

export default function ModificationRejectedPage() {
  const languageContext = useContext(LanguageContext);
  const t = languageContext?.t || ((key: string) => key);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="max-w-md mx-auto bg-primary rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
          <h1 className="text-2xl font-bold text-heading mb-2">
            ❌ Modificare Respinsă
          </h1>
          <p className="text-secondary">
            Ai respins modificarea propusă de frizer. Programarea rămâne la data
            și ora originală.
          </p>
        </div>

        <div className="bg-secondary rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-heading mb-2">
            📅 Ce s-a întâmplat:
          </h3>
          <ul className="text-sm text-secondary space-y-1">
            <li>• Frizerul a propus o modificare a programării</li>
            <li>• Ai respins noua dată și oră</li>
            <li>• Programarea rămâne la data originală</li>
            <li>• Frizerul va fi notificat</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            ← Înapoi la Site
          </Link>
        </div>
      </div>
    </div>
  );
}
