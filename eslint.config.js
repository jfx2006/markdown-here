import globals from "globals"
import js from "@eslint/js"
import json from "@eslint/json"
import css from "@eslint/css"
import markdown from "@eslint/markdown"
//import tseslint from 'typescript-eslint'
import mailextensionsEnv from "eslint-plugin-mailextensions-env"
import html from "eslint-plugin-html"
import noUnsanitized from "eslint-plugin-no-unsanitized"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

import { globalIgnores } from "eslint/config"
import { includeIgnoreFile } from "@eslint/compat"
import { fileURLToPath } from "node:url"

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url))

export default [
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    ".ruff_cache/**",
    "CI/**",
    "requirements/**",
    "mailext-options-sync/**",
    "test/**",
    "venv/**",
  ]),
  globalIgnores([
    "extension/highlightjs/**",
    "extension/locale_maker/**",
    "extension/vendor/**",
    "extension/experiments/notificationbar/**",
    "extension/experiments/customui/**",
    "extension/options/mailext-options-sync.js",
    "extension/options/shortcuts.js",
    "extension/test/chai.js",
    "extension/test/chai-dom.js",
    "extension/test/jquery.slim.js",
    "extension/test/mocha.js",
    "extension/test/underscore.js",
  ]),
  {
    files: ["package.json", "extension/**/*.json"],
    plugins: { json },
    ignores: [
      "extension/_locales/**/*.json",
      "extension/data/emoji_codes.json",
      "extension/experiments/notificationbar/*.json",
      "extension/experiments/customui/*.json",
    ],
    language: "json/json",
    ...json.configs.recommended,
  },
  {
    files: ["extension/**/*.css"],
    ignores: ["extension/test/mocha.css"],
    language: "css/css",
    plugins: { css },
    ...css.configs.recommended,
  },
  {
    files: ["*.js", "extension/**/*.js", "extension/**/*.mjs", "tools/**/*js"],
    ...js.configs.recommended,
    //tseslint.configs.recommended,
    ...noUnsanitized.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...mailextensionsEnv.environments.mailextensions.globals,
        ...globals.mocha,
      },
      sourceType: "module",
      parserOptions: {},
    },
    plugins: {
      js,
      "mailextensions-env": mailextensionsEnv,
    },
    rules: {
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      semi: ["error", "never"],
      "no-eval": "error",
      curly: ["error", "all"],
      "no-unused-vars": [
        "error",
        {
          args: "none",
          vars: "local",
        },
      ],
      "max-len": [
        "error",
        {
          code: 99,
          tabWidth: 2,
          ignoreUrls: true,
        },
      ],
    },
  },
  {
    files: ["extension/**/*.html"],
    plugins: { html },
  },
  {
    files: ["*.md", "extension/**/*.md"],
    plugins: { markdown },
    processor: "markdown/markdown",
    ignores: [
      "extension/_locales/**/*.md",
      "!extension/experiments/notificationbar/*.md",
      "!extension/experiments/customui/README.md",
    ],
    language: "markdown/gfm",
    rules: {
      "markdown/no-html": "error",
    },
  },
  eslintPluginPrettierRecommended,
]
