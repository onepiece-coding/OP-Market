import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.e2e.ts"],
    include: ["tests/e2e/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**", "prisma/**", "src/generated/**"],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
    },
  },
});
