/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options storage for markdown-here-revival
 *
 * Requires https://github.com/fregante/webext-options-sync
 */

import { fetchExtFile } from "../wxfetch.mjs"
import OptionsSync from "./mailext-options-sync.js"
import {
  migrate_badMathValue,
  migrate_MainCSS,
  migrate_oldHotKey,
  migrate_oldOptions,
  migrate_syntaxCSS,
  migrate_smartReplacements,
  migrate_removeUnused,
  migrate_mathRenderer,
  migrate_mathRenderer2,
  migrate_macHotkeys,
  migrate_toStructured,
} from "./options_migration.js"

function hotKeyDefault() {
  if (navigator.platform === "MacIntel") {
    return "MacCtrl+Command+M"
  }
  return "Ctrl+Alt+M"
}

export const kOptDefaults = {
  "main-css": "",
  "syntax-css": "nnfx-light.css",
  "math-value": `<img src="https://www.example.com/path/to/api/{urlmathcode}" alt="{mathcode}">`,
  "math-renderer-enabled": false,
  "math-renderer": "texzilla",
  "hotkey-input": hotKeyDefault(),
  "gfm-line-breaks-enabled": true,
  "forgot-to-render-check-enabled": true,
  "smart-replacements-enabled": true,
  "emoji-shortcode-enabled": true,
  "emoji-autocomplete-enabled": true,
  "last-version": "0",
  "preview-width": 650,
  "saved-preview-width": 650,
  "enable-markdown-mode": true,
  "mdhr-mode": "modern",
}

let MIGRATIONS = [
  migrate_oldHotKey,
  migrate_oldOptions,
  migrate_syntaxCSS,
  migrate_badMathValue,
  migrate_MainCSS,
  migrate_smartReplacements,
  migrate_mathRenderer,
  migrate_mathRenderer2,
  migrate_macHotkeys,
  migrate_toStructured,
  migrate_removeUnused,
]

export function MDHROptionsMigrate() {
  return MDHROptionsStore()
}

function MDHROptionsStore() {
  let main_css_default_p = fetchExtFile("/default.css")
  let DEFAULTS = Object.assign({}, kOptDefaults)

  main_css_default_p.then(async function (value) {
    DEFAULTS["main-css"] = value
  })

  return new OptionsSync({
    defaults: DEFAULTS,
    migrations: MIGRATIONS,
    logging: true,
  })
}

export const OptionsStore = MDHROptionsStore()
export default OptionsStore
