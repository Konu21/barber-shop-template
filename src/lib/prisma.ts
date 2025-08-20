import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Use PRISMA_DATABASE_URL for Vercel, fallback to DATABASE_URL
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or PRISMA_DATABASE_URL environment variable is not set");
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
