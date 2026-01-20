import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "ui",
          include: ["cli/ui/src/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"]
        }
      },
      {
        test: {
          name: "node",
          include: ["**/*.test.ts", "**/*.test.tsx"],
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cli/integration/**",
            "cli/ui/src/**/*.test.tsx"
          ],
          environment: "node",
          setupFiles: ["./vitest.setup.ts"]
        }
      }
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100
      },
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.css",
        "**/*.config.*",
        "**/cli/ui/vite-env.d.ts",
        "**/cli/integration/**",
        "**/scripts/**"
      ]
    }
  }
});
