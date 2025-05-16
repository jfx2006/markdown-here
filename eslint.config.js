import globals from "globals"
import js from "@eslint/js"
import json from "@eslint/json"
import css from "@eslint/css";
//import tseslint from 'typescript-eslint'
import mailextensionsEnv from "eslint-plugin-mailextensions-env"
import html from "eslint-plugin-html"
import noUnsanitized from "eslint-plugin-no-unsanitized"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

export default [
  {
    files: ["extension/**/*.json"],
    ignores: ["package-lock.json"],
    language: "json/json",
    ...json.configs.recommended,
  },
  {
		files: ["**/*.css"],
		language: "css/css",
		plugins: { css },
		extends: ["css/recommended"],
	},
  {
    files: ["extension/**/*.js", "extension/**/*.mjs"],
    ...js.configs.recommended,
  },
  //tseslint.configs.recommended,
  noUnsanitized.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ["extension/**/*.js", "extension/**/*.mjs"],
    ignores: [
      "extension/highlightjs/*.js",
      "extension/vendor/*.js",
      "extension/experiments/notificationbar/*.js",
      "extension/experiments/customui/*.js",
      "extension/options/mailext-options-sync.js",
      "extension/options/shortcuts.js",
      "extension/test/chai.js",
      "extension/test/jquery.slim.js",
      "extension/test/mocha.js",
      "extension/test/underscore.js",
    ],
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
    files: ["**!/!*.html"],
    plugins: { html },
  },
  {
    files: ["**/web-ext-config.js"],

    languageOptions: {
      ecmaVersion: 12,
      parserOptions: {},

      globals: {
        ...globals.node,
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
      },
    },
  },
]
