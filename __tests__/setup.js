import { execSync } from "child_process";
import { beforeAll, afterAll } from "vitest";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

beforeAll(() => {
  execSync("npx prisma db push --force-reset --accept-data-loss", {
    env: process.env,
    stdio: "inherit",
  });
});

afterAll(async () => {
  const { prisma } = await import("../lib/prisma.js");
  await prisma.comment.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.org.deleteMany({});
  await prisma.$disconnect();
});
