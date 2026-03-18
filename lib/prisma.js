import { PrismaClient } from "@prisma/client";
import "./env.js";

let _prisma;

export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined; // Avoid promise-like behavior
    if (!_prisma) {
      _prisma = new PrismaClient();
    }
    return _prisma[prop];
  }
});
