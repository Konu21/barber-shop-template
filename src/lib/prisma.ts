import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Use PRISMA_DATABASE_URL
const databaseUrl = process.env.PRISMA_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("PRISMA_DATABASE_URL environment variable is not set");
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
