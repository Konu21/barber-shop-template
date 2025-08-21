import { PrismaClient } from "@prisma/client";

// Configurare comună pentru întreaga aplicație
export const config = {
  // Dashboard Authentication
  DASHBOARD_USERNAME: process.env.DASHBOARD_USERNAME || "admin",
  DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || "barber123",
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-change-in-production",

  // Database
  PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL,

  // Google Calendar API
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
  GOOGLE_PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || "primary",

  // Email Configuration
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  BARBER_EMAIL: process.env.BARBER_EMAIL || "",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "",

  // Security
  CRON_SECRET: process.env.CRON_SECRET || "fallback-cron-secret",

  // SEO
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION:
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1",

  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
};

// Optimized Prisma client (without Accelerate for better compatibility)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.IS_PRODUCTION ? ["error"] : ["query", "info", "warn", "error"],
  });

if (!config.IS_PRODUCTION) globalForPrisma.prisma = prisma;
