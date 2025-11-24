import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "@": fileURLToPath(new URL("./client/src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "client/src/__tests__/**/*.test.{ts,tsx}",
      "server/**/*.test.{ts,tsx}",
    ],
    environmentMatchGlobs: [
      ["server/**/*.test.{ts,tsx}", "node"],
    ],
    coverage: {
      reportsDirectory: "./coverage",
    },
  },
});

