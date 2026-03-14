import { execSync } from "child_process";
import { beforeAll, afterAll } from "vitest";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

beforeAll(() => {
  execSync("npx prisma db push --force-reset", {
    env: process.env,
    stdio: "inherit",
  });
});

afterAll(async () => {
  const { prisma } = await import("../lib/prisma.js");
  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({});
    await tx.file.deleteMany({});
    await tx.task.deleteMany({});
    await tx.project.deleteMany({});
    await tx.invite.deleteMany({});
    await tx.user.deleteMany({});
    await tx.org.deleteMany({});
  });
  await prisma.$disconnect();
});
