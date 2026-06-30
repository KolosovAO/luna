import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-magic-numbers": "off"
    }
  },
  {
    files: ["push-worker/src/**/*.ts"],
    languageOptions: {
      globals: {
        atob: "readonly",
        btoa: "readonly",
        crypto: "readonly",
        fetch: "readonly",
        Intl: "readonly",
        Request: "readonly",
        Response: "readonly",
        TextEncoder: "readonly",
        URL: "readonly"
      }
    }
  },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        URL: "readonly"
      }
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        globalThis: "readonly"
      }
    }
  },
  {
    ignores: [".expo", "dist", "node_modules", "openspec"]
  }
);
