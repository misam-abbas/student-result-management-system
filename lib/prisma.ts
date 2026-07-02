import { PrismaClient } from "@prisma/client";

/**
 * Next.js reloads modules in development, which would otherwise create a
 * new PrismaClient (and a new connection pool) on every save. Caching the
 * instance on `globalThis` in development avoids exhausting your database's
 * connection limit. In production a single instance is created per
 * serverless function invocation, which is the correct behaviour.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
