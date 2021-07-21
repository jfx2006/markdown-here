/*
 * Copyright JFX 2021
 * MIT License
 */

import { getHljsStyles } from '../async_utils.js'

// Sha256 Checksums for old versions of default.css
const OLD_CSS_SUMS = [
  // 3.0.1
  "bb5a0fd030d27ce58011d9250524c83f2cf1242b07f874496b394a7ea02c49c2",
  // 3.1.0
  "72706d3e07c403c35688760180a753552af05c4ed2d5d1906dbf89b5c649342a",
]

// Checksum of the current version of default.css
// 3.2.0
const DEFAULT_CSS_SUM = "fae130ec03db946b335675757ba8db507a9e4b0b2303aae0f6953945b03f7069"

const EXT_STORAGE = (messenger.storage.sync || messenger.storage.local)

// Copied from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function sha256Digest(text) {
  const msgUint8 = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

async function getOldOptions() {
  const _div = "##"
  const bool_options = ["math-enabled", "forgot-to-render-check-enabled", "gfm-line-breaks-enabled"]
  const oldOptions = await EXT_STORAGE.get(null)
  let _key
  for (_key of Object.keys(oldOptions)) {
    // Older settings aren't JSON-encoded, so they'll throw an exception.
    try {
      oldOptions[_key] = JSON.parse(oldOptions[_key])
    }
    catch (ex) {
      // do nothing, leave the value as-is
    }
  }
  for (let b_opt of bool_options) {
    if (typeof(oldOptions[b_opt]) === "string") {
      if (oldOptions[b_opt] === "true") {
        oldOptions[b_opt] = true
      } else {
        oldOptions[b_opt] = false
      }
    }
  }

  let tempObj = {}, finalObj = {}
  for (_key of Object.keys(oldOptions)) {
    let val = oldOptions[_key]
    let divIndex = _key.indexOf(_div)
    if (divIndex < 0) {
      finalObj[_key] = val
    } else {
      let keybase = _key.slice(0, divIndex)
      let keynum = _key.slice(divIndex+2)
      tempObj[keybase] = tempObj[keybase] || []
      tempObj[keybase][keynum] = val
    }
  }
  for (_key of Object.keys(tempObj)) {
    finalObj[_key] = tempObj[_key].join("")
  }
  return finalObj
}

// Hotkey & main css migration
async function migrate_pre320(options) {
  const platformInfo = await messenger.runtime.getPlatformInfo()
  const isMac = platformInfo["os"] === "mac"
  let oldPrefs = await getOldOptions()
  let currentPrefs = await options.getAll()
  if (Object.keys(oldPrefs).length > 0) {
    console.log("Migrating oldPrefs")
    let hotkey = []
    if (oldPrefs.hotkey !== undefined) {
      if (oldPrefs.hotkey.shiftKey) {
        hotkey.push("Shift")
      }
      if (oldPrefs.hotkey.ctrlKey) {
        if (isMac) {
          hotkey.push("MacCtrl")
        } else {
          hotkey.push("Ctrl")
        }
      }
      if (oldPrefs.hotkey.altKey) {
        hotkey.push("Alt")
      }
      hotkey.push(oldPrefs.hotkey.key)
      const hotkey_str = hotkey.join("+")
      if (hotkey_str !== options.defaults.hotkey) {
        await options.set({ hotkey: hotkey_str })
      }
    }

    let updateObj = {}
    for (let _i of ["main-css", "gfm-line-breaks-enabled",
      "forgot-to-render-check-enabled", "math-enabled", "math-value"]) {
      if (currentPrefs[_i] !== options.defaults[_i]) {
        updateObj[_i] = oldPrefs[_i]
      }
      await options.setAll(updateObj)
    }
  }
}

async function migrate_SyntaxCSS(options) {
  const syntax_css_available = await getHljsStyles()
  const syntax_values = Object.values(syntax_css_available)
  const syntax_css = await options.get("syntax-css")
  if (syntax_values.indexOf(syntax_css["syntax-css"]) === -1) {
    console.log(`Invalid Highlightjs CSS detected. Resetting to ${options.defaults["syntax-css"]}`)
    await options.reset("syntax-css")
  }
}

async function migrate_badMathValue(options) {
  // The math formula img code gets escaped too many times
  let math_value_obj = await options.get("math-value")
  let math_value = math_value_obj["math-value"]
  if (math_value[0] === '"') {
    console.log("Unescaping math-value to fix math rendering")
    while (math_value[0] === '"') {
      math_value = JSON.parse(math_value)
    }
    await options.set({"math-value": math_value})
  }
}

async function migrate_MainCSS(options) {
  let currentCSS = await options.get("main-css")
  let sha256 = await sha256Digest(currentCSS)
  if (sha256 !== DEFAULT_CSS_SUM) {
    if (OLD_CSS_SUMS.includes(sha256)) {
      console.log("Updating main-css to current default.")
      await options.reset("main-css")
    }
  }
}

async function migrate_removeUnused(options) {
  let currentPrefs = await EXT_STORAGE.get()
  for (let _key of Object.keys(currentPrefs)) {
    if (!(_key in options.defaults)) {
      console.log(`Removing unused storage key ${_key}.`)
      await EXT_STORAGE.remove(_key)
    }
  }
}

async function migrate_setLastVersion(options) {
  const thisVersion = messenger.runtime.getManifest().version
  console.log(`Migrations complete. Setting version: ${thisVersion}`)
  return await options.set({"last-version": thisVersion})
}

class Version {
  constructor(versionStr) {
    const verRe = /^(?<major>\d+)\.(?<minor>\d+)(?:\.(?<patch>\d+)(?:\.(?<sequence>\d+))?)?$/
    let matchVer = verRe.exec(versionStr)
    if (matchVer !== null) {
      this.major = Number(matchVer.groups.major)
      this.minor = Number(matchVer.groups.minor)
      this.patch = Number(matchVer.groups.patch) || 0
      this.sequence = Number(matchVer.groups.sequence) || 0
    }
    else {
      this.major = this.minor = this.patch = this.sequence = null
    }
  }
  get value() {
    const boost = 3
    let power = 0
    let rv = 0
    for (let v of [this.sequence, this.patch, this.minor, this.major]) {
      rv += v * Math.pow(10, power)
      power += boost
    }
    return rv
  }
  get version() {
    // string version -- ?? needed
    return `${this.major}.${this.minor}.${this.patch}.${this.sequence}`
  }
}

class AsyncMigration {
  constructor(version, func) {
    this.version = version  // max version to run migration for
    this.func = func
  }
  get sValue() {
    // sortable version
    return this.version.value
  }
}

class MigrationStack {
  constructor() {
    this.stack = []
  }
  addMigration(versionStr, func) {
    let aMigration = new AsyncMigration(new Version(versionStr), func)
    this.stack.push(aMigration)
  }
  get migrations() {
    // returns migration stack sorted by version
    return this.stack.sort((a,b) => {return a.sValue - b.sValue})
  }
  async doMigrations(OptionStore) {
    const lastVersionStr = await OptionStore.get("last-version")
    const lastVersion = new Version(lastVersionStr)
    for (let _migration of this.migrations) {
      if (lastVersion.value < _migration.sValue) {
        try {
          await _migration.func(OptionStore)
        } catch(e) {
          console.log(`Error in migration ${_migration.func.name}: ${e}.`)
          throw(e)
        }
      }
    }
  }
}

let prefMigrations = new MigrationStack()
prefMigrations.addMigration("3.2.0", migrate_pre320)
prefMigrations.addMigration("3.2.6", migrate_SyntaxCSS)
prefMigrations.addMigration("3.2.6.1", migrate_badMathValue)
prefMigrations.addMigration("99.0.0", migrate_MainCSS)
prefMigrations.addMigration("99.1.0", migrate_removeUnused)
prefMigrations.addMigration("99.2.0", migrate_setLastVersion)

export default prefMigrations
