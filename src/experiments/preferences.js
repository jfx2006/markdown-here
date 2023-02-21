/* eslint-disable object-shorthand */

/*global ChromeUtils:false Services:false */

// Get various parts of the WebExtension framework that we need.
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm")

// This is the base preference name for all your legacy prefs.
const BASE_PREF_NAME = "mail.identity."
const PREF_REPLY_POS = ".reply_on_top"

const POSITION_MAP = {
  1: "top",
  0: "bottom",
}

// This is the important part. It implements the functions and events defined in schema.json.
// The variable must have the same name you've been using so far, "myapi" in this case.
// eslint-disable-next-line no-unused-vars
var reply_prefs = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      // Again, this key must have the same name.
      reply_prefs: {
        async getReplyPosition(identityId) {
          const identityStr = String(identityId)
          try {
            const positionVal = Services.prefs.getIntPref(
              `${BASE_PREF_NAME}${identityStr}${PREF_REPLY_POS}`
            )
            return POSITION_MAP[positionVal]
          } catch (ex) {
            return undefined
          }
        },
        async getUseParagraph() {
          try {
            return Services.prefs.getBoolPref("mail.compose.default_to_paragraph")
          } catch (ex) {
            return false
          }
        },
      },
    }
  }
}
