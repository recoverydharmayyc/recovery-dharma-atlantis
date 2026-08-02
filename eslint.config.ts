// eslint.config.ts
// ESLint loads this TypeScript config through jiti.
// Keep jiti as a direct devDependency because it is required at runtime for ESLint config loading.
import js from "@eslint/js";
import reactRefresh from "eslint-plugin-react-refresh";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

const commonRules: Record<string, unknown> = {
  // General sanity
  "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "no-undef": "error",
  "no-console": ["warn", { allow: ["warn", "error"] }],

  // Formatting delegated to Prettier
  "no-mixed-spaces-and-tabs": "off",
};

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: { react, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      // React
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "error",
      "react-refresh/only-export-components": "off",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      ...commonRules,
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
    rules: commonRules,
  },
  {
    files: ["*.config.js", "*.config.ts", "eslint.config.ts", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: commonRules,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...commonRules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Disable ESLint stylistic conflicts because Prettier owns formatting:
  {
    rules: {
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
