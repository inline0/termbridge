import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["cli/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000
  }
});
