import { PrismaClient } from "@prisma/client";
import "./env.js";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
