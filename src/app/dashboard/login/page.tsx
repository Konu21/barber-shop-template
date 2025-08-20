"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useContext } from "react";
import { LanguageContext } from "@/app/components/LanguageProvider";
import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageToggle from "@/app/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const languageContext = useContext(LanguageContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = languageContext?.t || ((key: string) => key);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("dashboardToken");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("dashboardToken", data.token);
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">
            {t("login.title")}
          </h1>
          <p className="text-secondary">{t("login.subtitle")}</p>
        </div>

        {/* Login Form */}
        <div className="bg-primary rounded-2xl shadow-xl border border-separator p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-heading mb-2"
              >
                {t("login.username")}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-separator rounded-lg bg-secondary text-heading placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                placeholder={t("login.usernamePlaceholder")}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-heading mb-2"
              >
                {t("login.password")}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-separator rounded-lg bg-secondary text-heading placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                placeholder={t("login.passwordPlaceholder")}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm">
                  {error === "Invalid credentials"
                    ? t("login.invalidCredentials")
                    : t("login.loginFailed")}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>
        </div>
        {/* Back to Home Link */}
        <div className="text-center mb-4 mt-4">
          <Link
            href="/"
            className="inline-flex items-center text-accent hover:text-accent-hover transition-colors text-sm"
          >
            {t("login.backToHome")}
          </Link>
        </div>

        {/* Toggles */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
