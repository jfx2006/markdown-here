/*
 * Copyright JFX 2021
 * MIT License
 */

import { getHljsStyles, sha256Digest } from "../async_utils.mjs"
// Sha256 Checksums for old versions of default.css
const OLD_CSS_SUMS = [
  // Test checksum
  "0458194d90138a76c11aeba3eda0aa8aece27f467104c314cdb5e0376a9d7b8c",
  // 3.0.1
  "bb5a0fd030d27ce58011d9250524c83f2cf1242b07f874496b394a7ea02c49c2",
  // 3.1.0
  "72706d3e07c403c35688760180a753552af05c4ed2d5d1906dbf89b5c649342a",
  // 3.2.0
  "fae130ec03db946b335675757ba8db507a9e4b0b2303aae0f6953945b03f7069",
  // 3.3.1
  "67f46b9488904c869638c6f9fc2ea04d1046b5efa1115fec186a327c13a7ea96",
  // 3.5.0
  "807ddb7e46507d2a3b4e69614db057692a1dbc9e2af10d42848035020986c526",
  // 3.999.17
  "2dfd2ecbf89f60805829a9ebbc7506324242dba94c21dced5419395cba646918"
]

// Checksum of the current version of default.css
// 3.999.20
const DEFAULT_CSS_SUM = "9a35df2a345ea9a92cdbe0b6660d47a0dc5a88b096890a34d1e4388ea813e59c"

export function testCssSum(checksum) {
  // Checks the default.css checksum to ensure the above are correct
  // First verify it's not in OLD_CSS_SUMS
  if (OLD_CSS_SUMS.includes(checksum)) {
    throw new Error(`default.css checksum ${checksum} is in OLD_CSS_SUMS when it should not be!`)
  }
  if (checksum !== DEFAULT_CSS_SUM) {
    throw new Error(
      `default.css checksum ${checksum} does not match DEFAULT_CSS_SUM ${DEFAULT_CSS_SUM}!`,
    )
  }
  return true
}

const EXT_STORAGE = window.messenger?.storage.sync || {}

export async function migrate_oldHotKey(options, defaults) {
  let platformInfo = await messenger.runtime.getPlatformInfo()
  let old_hotkey = await EXT_STORAGE.get("hotkey")
  old_hotkey = old_hotkey["hotkey"]
  let isMac = Boolean(platformInfo["os"] === "mac")
  if (old_hotkey !== undefined && old_hotkey !== "") {
    // Might not be JSON encoded?
    try {
      old_hotkey = JSON.parse(old_hotkey)
    } catch (ex) {
      // do nothing, leave the value as-is
    }
    let key_combo = []
    if (old_hotkey.shiftKey) {
      key_combo.push("Shift")
    }
    if (old_hotkey.ctrlKey) {
      if (isMac) {
        key_combo.push("MacCtrl")
      } else {
        key_combo.push("Ctrl")
      }
    }
    if (old_hotkey.altKey) {
      key_combo.push("Alt")
    }
    key_combo.push(old_hotkey.key)

    const hotkey_str = key_combo.join("+")
    if (hotkey_str !== defaults["hotkey-input"]) {
      return { "hotkey-input": hotkey_str }
    }
  }
  return null
}

export async function migrate_oldOptions(options, defaults) {
  const bool_options = ["math-enabled", "gfm-line-breaks-enabled"]
  const string_options = ["main-css", "math-value"]
  const old_option_keys = Array.prototype.concat(bool_options, string_options)
  let old_options = await EXT_STORAGE.get(old_option_keys)
  for (let b_opt of bool_options) {
    // Sometimes booleans turned to strings, which makes testing truthiness annoying
    if (typeof old_options[b_opt] === "string") {
      old_options[b_opt] = Boolean(old_options[b_opt] === "true")
    }
  }
  let changed_options = {}
  for (let opt of old_option_keys) {
    if (options[opt] !== defaults[opt]) {
      changed_options[opt] = old_options[opt]
    }
  }
  if (changed_options.length > 0) {
    return changed_options
  }
  return null
}

export async function migrate_syntaxCSS(options, defaults) {
  const syntax_css_available = await getHljsStyles()
  const syntax_values = Object.values(syntax_css_available)
  const syntax_css = options["syntax-css"]
  if (syntax_values.indexOf(syntax_css) === -1) {
    console.log(`Invalid Highlightjs CSS detected. Resetting to ${defaults["syntax-css"]}`)
    return { "syntax-css": defaults["syntax-css"] }
  }
  return null
}

export async function migrate_badMathValue(options, defaults) {
  // The math formula img code gets escaped too many times
  let math_value = options["math-value"]
  if (math_value[0] === '"') {
    console.log("Unescaping math-value to fix math rendering")
    while (math_value[0] === '"') {
      math_value = JSON.parse(math_value)
    }
    return { "math-value": math_value }
  }
  return null
}

export async function migrate_MainCSS(options, defaults) {
  let sha256 = await sha256Digest(options["main-css"])
  if (sha256 !== DEFAULT_CSS_SUM) {
    if (OLD_CSS_SUMS.includes(sha256)) {
      console.log("Updating main-css to current default.")
      return { "main-css": defaults["main-css"] }
    }
  }
  return null
}

export async function migrate_setLastVersion(options) {
  const thisVersion = messenger.runtime.getManifest().version
  if (options["last-version"] !== thisVersion) {
    console.log(`Setting last-version: ${thisVersion}`)
    return { "last-version": thisVersion }
  }
  return null
}

export async function migrate_removeUnused(options, defaults) {
  let removeKeys = []
  const defaultKeys = Object.keys(defaults)
  // Need to operate on the raw storage keys
  options = await EXT_STORAGE.get()
  for (const key of Object.keys(options)) {
    if (!defaultKeys.includes(key)) {
      removeKeys.push(key)
    }
  }
  if (removeKeys.length > 0) {
    await EXT_STORAGE.remove(removeKeys)
  }
  return null
}

export async function migrate_smartReplacements(options, defaults) {
  if (options["smart-quotes-enabled"] !== undefined) {
    return { "smart-replacements-enabled": options["smart-quotes-enabled"] }
  }
  return null
}

export async function migrate_mathRenderer(options, defaults) {
  if (options["math-enabled"] === true) {
    return { "math-renderer": "texzilla" }
  }
  return null
}
export async function migrate_mathRenderer2(options, defaults) {
  if (options["math-renderer"] === "disabled") {
    return { "math-renderer-enabled": false, "math-renderer": defaults["math-renderer"] }
  } else {
    return { "math-renderer-enabled": true, "math-renderer": options["math-renderer"] }
  }
}

export async function migrate_macHotkeys(options, defaults) {
  if (navigator.platform === "MacIntel") {
    if (options["hotkey-input"] === "Ctrl+Alt+M") {
      return { "hotkey-input": defaults["hotkey-input"] }
    }
  }
  return null
}

export async function migrate_toStructured(options, defaults) {
  const old_options = await EXT_STORAGE.get(Object.keys(defaults))
  await EXT_STORAGE.remove(Object.keys(defaults))
  return Object.assign(options, defaults, old_options)
}
