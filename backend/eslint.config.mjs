// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig(
  globalIgnores([
    "dist/**",
    "node_modules/**",
    "prisma/migrations/**",
    "src/generated/**",
  ]),

  js.configs.recommended,

  {
    files: ["src/**/*.ts", "types/**/*.d.ts"],
    extends: [tseslint.configs.recommended, prettier],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/preserve-caught-error": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
);
