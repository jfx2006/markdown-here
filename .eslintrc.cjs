/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

module.exports = {
  env: {
    browser: true,
    es2022: true,
    webextensions: true,
    "mailextensions-env/mailextensions": true,
    mocha: true,
  },
  root: true,
  extends: [
    "eslint:recommended",
    //"plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "eslint-plugin-mailextensions-env", "html", "no-unsanitized", "prettier"],
  parserOptions: {
    sourceType: "module",
    //project: true,
    //tsconfigRootDir: __dirname,
  },
  rules: {
    quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ["error", "never"],
    "no-eval": "error",
    curly: ["error", "all"],
    "no-unused-vars": ["error", { args: "none", vars: "local" }],
    "max-len": [
      "error",
      {
        code: 99,
        tabWidth: 2,
        ignoreUrls: true,
      },
    ],
  },
  overrides: [
    {
      files: ["web-ext-config.js"],
      parserOptions: {
        ecmaVersion: 12,
      },
      env: {
        node: true,
        browser: false,
      },
    },
  ],
}
