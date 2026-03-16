import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      /** Escalate unused variables to an error; allow underscore-prefixed
       *  names and rest-sibling patterns used to intentionally "omit" a prop. */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      /** Require `import type` (or inline `type` keyword) for type-only
       *  imports to improve tree-shaking and compile-time clarity. */
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // ── General quality ───────────────────────────────────────────────────
      /** Disallow debug console.log calls in production code.
       *  console.warn and console.error are intentional signal paths. */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      /** Require strict equality; null comparisons are exempted
       *  (`x == null` is a common idiom for both null and undefined). */
      eqeqeq: ["error", "always", { null: "ignore" }],
      /** Disallow legacy var declarations. */
      "no-var": "error",
      /** Require const for variables that are never reassigned. */
      "prefer-const": "error",
    },
  },
  {
    files: ["src/modules/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: [
                "@/modules/*.module/core/*",
                "@/modules/*.module/domain.*/*",
                "@/modules/*.module/infra.*/*",
                "@/modules/*.module/_components/*",
              ],
              message:
                "跨模組相依必須走目標 module 的 public index.ts barrel。",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/**/_components/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: [
                "@/modules/*.module/core/*",
                "@/modules/*.module/domain.*/*",
                "@/modules/*.module/infra.*/*",
                "@/modules/*.module/_components/*",
              ],
              message:
                "跨模組相依必須走目標 module 的 public index.ts barrel。",
            },
            {
              group: ["../domain.*/*", "../infra.*/*"],
              message:
                "Presentation 層不得直接依賴同模組的 domain/infra；請改經由 core facade。",
            },
            {
              group: ["firebase/auth", "firebase/firestore", "firebase/storage"],
              message:
                "Presentation 層不得直接使用 Firebase SDK；請改由 module facade 或 adapter 邊界封裝。",
            },
          ],
        },
      ],
    },
  },
];

export default config;
