import js from "@eslint/js";
import hooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { unicorn },
    rules: {
      ...unicorn.configs.recommended.rules,
      "no-unused-private-class-members": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/return-await": ["error", "always"],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description", "ts-ignore": true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          detectObjects: false,
          enforceConst: true,
          ignore: [-1, 0, 1, 2, 100],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "unicorn/number-literal-case": "off",
      // Project terms such as props, ref, id, and args are established domain names.
      "unicorn/name-replacements": "off",
      // Visibility order does not affect the public API or runtime behavior.
      "unicorn/consistent-class-member-order": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
          },
          ignore: ["CanvasHUD.tsx"],
        },
      ],
      "unicorn/no-null": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["src/utils/logger.ts"],
    // This module is the sole console boundary; all callers use its API.
    rules: { "no-console": "off" },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      "react-hooks": hooks,
    },
    rules: {
      ...hooks.configs.flat["recommended-latest"].rules,
      // JSX numeric props are declarative layout/3D data, not hidden logic.
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
  {
    files: ["tests/**/*.ts", "*.config.ts", "web/*.config.ts"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    files: ["src/config.ts", "src/constants.ts"],
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/tests/**"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-magic-numbers": "off" },
  },
  {
    ignores: [
      "build/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "public/**",
    ],
  },
);
