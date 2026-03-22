import { PrismaClient } from "@prisma/client";
import "./env.js";

const globalForPrisma = globalThis;

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && !dbUrl.includes("connect_timeout")) {
  const separator = dbUrl.includes("?") ? "&" : "?";
  dbUrl = `${dbUrl}${separator}connect_timeout=30&pool_timeout=30&pgbouncer=true`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
