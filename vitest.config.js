import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    testEnvironment: "node",
    include: ["__tests__/**/*.test.js"],
    setupFiles: ["__tests__/setup.js"],
  },
});
