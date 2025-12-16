/*global ChromeUtils:false Services:false */

"use strict"

var { ExtensionUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionUtils.sys.mjs",
)
var { ExtensionError } = ExtensionUtils

// This is the base preference name for all your legacy prefs.
const BASE_PREF_NAME = "mail.identity."
const PREF_REPLY_POS = ".reply_on_top"
const FORMAT_PREF = "mail.compose.default_to_paragraph"

const POSITION_MAP = {
  1: "top",
  0: "bottom",
}

// This is the important part. It implements the functions and events defined in schema.json.
// The variable must have the same name you've been using so far, "myapi" in this case.
// eslint-disable-next-line no-unused-vars
var reply_prefs = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    class LegacyPrefsManager {
      constructor() {
        this.observedBranches = new Map()
        this.QueryInterface = ChromeUtils.generateQI(["nsIObserver", "nsISupportsWeakReference"])
      }

      addObservedBranch(branch, fire) {
        return this.observedBranches.set(branch, fire)
      }

      hasObservedBranch(branch) {
        return this.observedBranches.has(branch)
      }

      removeObservedBranch(branch) {
        return this.observedBranches.delete(branch)
      }

      async observe(aSubject, aTopic, aData) {
        if (aTopic == "nsPref:changed") {
          let branch = [...this.observedBranches.keys()].reduce(
            (p, c) => (aData.startsWith(c) && (!p || c.length > p.length) ? c : p),
            null,
          )
          if (branch) {
            //let name = aData.substr(branch.length)
            let value = await this.getLegacyPref(aData, null, false)
            let fire = this.observedBranches.get(branch)
            fire(branch, value)
          }
        }
      }

      async getLegacyPref(aName, aFallback = null, userPrefOnly = true) {
        let prefType = Services.prefs.getPrefType(aName)
        if (prefType == Services.prefs.PREF_INVALID) {
          return aFallback
        }

        let value = aFallback
        if (!userPrefOnly || Services.prefs.prefHasUserValue(aName)) {
          switch (prefType) {
            case Services.prefs.PREF_STRING:
              value = Services.prefs.getStringPref(aName, aFallback)
              break

            case Services.prefs.PREF_INT:
              value = Services.prefs.getIntPref(aName, aFallback)
              break

            case Services.prefs.PREF_BOOL:
              value = Services.prefs.getBoolPref(aName, aFallback)
              break

            default:
              console.error(`Legacy preference <${aName}> has an unknown type of <${prefType}>.`)
          }
        }
        return value
      }
    }

    let legacyPrefsManager = new LegacyPrefsManager()

    return {
      // Again, this key must have the same name.
      reply_prefs: {
        onFormatChanged: new ExtensionCommon.EventManager({
          context,
          name: "reply_prefs.onFormatChanged",
          register: (fire) => {
            const branch = FORMAT_PREF
            if (legacyPrefsManager.hasObservedBranch(branch)) {
              throw new ExtensionError(`Cannot add more than one listener for branch "${branch}".`)
            }
            legacyPrefsManager.addObservedBranch(branch, fire.sync)
            Services.prefs.getBranch(null).addObserver(branch, legacyPrefsManager)
            return () => {
              Services.prefs.getBranch(null).removeObserver(branch, legacyPrefsManager)
              legacyPrefsManager.removeObservedBranch(branch)
            }
          },
        }).api(),

        async getReplyPosition(identityId) {
          const identityStr = String(identityId)
          try {
            const positionVal = await legacyPrefsManager.getLegacyPref(
              `${BASE_PREF_NAME}${identityStr}${PREF_REPLY_POS}`,
            )
            return POSITION_MAP[positionVal]
          } catch (ex) {
            console.error(ex)
            return undefined
          }
        },
        async getUseParagraph() {
          try {
            return await legacyPrefsManager.getLegacyPref(FORMAT_PREF, null, false)
          } catch (ex) {
            console.error(ex)
            return false
          }
        },
        async setUseParagraph(value) {
          try {
            return Services.prefs.setBoolPref(FORMAT_PREF, value)
          } catch (ex) {
            console.error(ex)
            return undefined
          }
        },
      },
    }
  }
}
