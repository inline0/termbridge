import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    environment: "node",
    environmentMatchGlobs: [["cli/ui/src/**/*.test.tsx", "jsdom"]],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.config.*",
        "**/cli/ui/vite-env.d.ts"
      ]
    }
  }
});
