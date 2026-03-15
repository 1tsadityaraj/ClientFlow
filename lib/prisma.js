import "./env.js";
import { PrismaClient } from "@prisma/client";

let _prisma;

/** @type {PrismaClient} */
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined; // Handle async/await checks
    if (!_prisma) {
      _prisma = new PrismaClient();
    }
    return _prisma[prop];
  }
});
