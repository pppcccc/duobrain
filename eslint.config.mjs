import js from "@eslint/js";
import next from "@next/eslint-plugin-next";

export default [
  js.configs.recommended, // ✅ Default JavaScript ESLint rules
  next.configs.recommended, // ✅ Correct way to apply Next.js ESLint rules
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // ✅ No need to import React in Next.js
      "no-unused-vars": "warn",
    },
  },
];