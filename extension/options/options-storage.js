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
  migrate_mathRenderer,
  migrate_mathRenderer2,
  migrate_macHotkeys,
} from "./options_migration.js"
import { toInt } from "../async_utils.mjs"

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
  "buglink-enabled": false,
  "buglink-url": "https://bugzil.la/{bug_number}",
  "buglink-text": "Bug {bug_number}",
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
  OptionsSync.migrations.removeUnused,
]

export async function MDHROptionsMigrate() {
  const EXT_STORAGE = window.messenger?.storage.sync || {}

  async function get_options_version() {
    // Version 0 is default
    // Version 1 is unstructured (each option is a separate storage key) (unused)
    // Version 2 is structured (one "options" key in storage that's a
    // JSON struct with actual options)
    let rv = 0
    const storage_rv = await EXT_STORAGE.get("options_version")
    if (Object.hasOwn(storage_rv, "options_version")) {
      try {
        rv = toInt(rv["options_version"])
      } catch (e) {
        console.log(e)
        rv = 0
      }
    }
    return rv
  }

  async function set_options_version(version) {
    await EXT_STORAGE.set({ options_version: version })
  }

  const OPTIONS_VERSION = await get_options_version()

  if (OPTIONS_VERSION > 2) {
    return null
  }
  const old_options = await EXT_STORAGE.get()
  console.log(old_options)
  if (Object.hasOwn(old_options, "options")) {
    delete old_options["options"]
  }
  await set_options_version(2)
  EXT_STORAGE.set({ options: JSON.stringify(old_options) })
  console.log(await EXT_STORAGE.get())
}

async function MDHROptionsStore() {
  let main_css_default_p = fetchExtFile("/default.css")
  let DEFAULTS = Object.assign({}, kOptDefaults)

  main_css_default_p.then(async function (value) {
    DEFAULTS["main-css"] = value
  })

  await MDHROptionsMigrate()

  return new OptionsSync({
    defaults: DEFAULTS,
    migrations: MIGRATIONS,
    logging: false,
  })
}

export const OptionsStore = await MDHROptionsStore()
export default OptionsStore
