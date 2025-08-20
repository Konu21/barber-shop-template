import { PrismaClient } from "@prisma/client";

// Configurare comună pentru întreaga aplicație
export const config = {
  // Dashboard Authentication
  DASHBOARD_USERNAME: process.env.DASHBOARD_USERNAME || "admin",
  DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || "barber123",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Google Calendar API
  GOOGLE_APPLICATION_CREDENTIALS:
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "./google-credentials.json",
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || "primary",

  // Email Configuration
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  BARBER_EMAIL: process.env.BARBER_EMAIL || "",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "",

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
};

// Optimized Prisma client with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.IS_PRODUCTION ? ["error"] : ["query", "info", "warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (!config.IS_PRODUCTION) globalForPrisma.prisma = prisma;
