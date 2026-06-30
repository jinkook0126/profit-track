import js from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
      prettier,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      "@tanstack/query": tanstackQuery,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {},
      },
    },

    rules: {
      "react/jsx-props-no-spreading": "off",
      /*
       * prettier
       */
      "prettier/prettier": "error",

      /*
       * react
       */
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "react/function-component-definition": "off",

      /*
       * react hooks
       */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /*
       * accessibility
       */
      "jsx-a11y/anchor-is-valid": "warn",

      /*
       * import
       */
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",

      /*
       * import sort
       */
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      /*
       * unused imports
       */
      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      /*
       * typescript
       */
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/no-unused-vars": "off",

      /*
       * console
       */
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  ...tanstackQuery.configs["flat/recommended"],
];
