import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettier, // Disables ESLint rules that conflict with Prettier
  {
    plugins: { prettier: pluginPrettier },
    rules: {
      "prettier/prettier": "error",
      "indent": ["error", 2],
      "react/react-in-jsx-scope": "off"
    }
  }
];
