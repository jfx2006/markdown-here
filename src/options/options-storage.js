/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options storage for markdown-here-revival
 *
 * Requires https://github.com/fregante/webext-options-sync
 */

import { fetchExtFile, getHljsStyles } from "../async_utils.js"
import OptionsSync from "./mailext-options-sync.js"
import {
  migrate_badMathValue,
  migrate_MainCSS,
  migrate_oldHotKey,
  migrate_oldOptions,
  migrate_syntaxCSS,
  migrate_smartReplacements,
  migrate_removeUnused,
  migrate_mathRenderer
} from "./options_migration.js"

export const kOptDefaults = {
  "main-css": "",
  "syntax-css": "nnfx-light.css",
  "math-value": `<img src="https://chart.googleapis.com/chart?cht=tx&chl={urlmathcode}" alt="{mathcode}">`,
  "math-renderer": "disabled",
  "hotkey-input": "Ctrl+Alt+M",
  "forgot-to-render-check-enabled": true,
  "gfm-line-breaks-enabled": true,
  "smart-replacements-enabled": true,
  "last-version": "0",
}

let MIGRATIONS = [
    migrate_oldHotKey,
    migrate_oldOptions,
    migrate_syntaxCSS,
    migrate_badMathValue,
    migrate_MainCSS,
    migrate_smartReplacements,
    migrate_mathRenderer,
    migrate_removeUnused
  ]

export function MDHROptionsMigrate() {
  return MDHROptionsStore()
}

function MDHROptionsStore() {
  let main_css_default_p = fetchExtFile("/default.css")
  let hljs_css_p = getHljsStyles()
  let DEFAULTS = Object.assign({}, kOptDefaults)

  let p_all = Promise.all([main_css_default_p, hljs_css_p])
  p_all.then(async function (value) {
    DEFAULTS["main-css"] = value[0]
    DEFAULTS["hljs_styles"] = value[1]
  })

  return new OptionsSync({
    defaults: DEFAULTS,
    migrations: MIGRATIONS,
    logging: true,
  })
}

export default MDHROptionsStore()
