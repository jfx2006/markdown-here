/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options storage for markdown-here-revival
 *
 * Requires https://github.com/fregante/webext-options-sync
 */

import OptionsSync from './mailext-options-sync.js';
import OldOptions from "./old_options.js";

async function fetchExtFile(path, json=false) {
  const url = messenger.runtime.getURL(path)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error fetching ${path}: ${response.status}`)
  }
  if (json) {
    return await response.json()
  } else {
    return await response.text()
  }
}

export const kOptDefaults = {
  'main-css': "",
  'syntax-css': "nnfx.css",
  'math-enabled': false,
  'math-value': `<img src="https://chart.googleapis.com/chart?cht=tx&chl={urlmathcode}" alt="{mathcode}">`,
  'hotkey-input': "Ctrl+Alt+M",
  'forgot-to-render-check-enabled': true,
  'gfm-line-breaks-enabled': true,
  "last-version": "0"
}

export const kSyntaxCSSStyles = (async  () => {
  return await fetchExtFile("/highlightjs/styles/styles.json", true)
})()

export default (async () => {
  let DEFAULTS = Object.assign({}, kOptDefaults);
  DEFAULTS["main-css"] = await fetchExtFile("/default.css")

  const isMac = Boolean((await messenger.runtime.getPlatformInfo())["os"] === "mac")

  return new OptionsSync({
    defaults: DEFAULTS,
    migrations: [
      // Hotkey & main css migration
      (savedOptions, currentDefaults) => {
        const currentVersion = messenger.runtime.getManifest()["version"];
        const lastVersion = savedOptions["last-version"];

        OldOptions.get(function(oldPrefs) {
          if (Object.keys(oldPrefs).length > 0) {
            console.log("Migrating oldPrefs")
            let hotkey = []
            if (oldPrefs.hotkey.shiftKey) {
              hotkey.push("Shift")
            }
            if (oldPrefs.hotkey.ctrlKey) {
              if (isMac) {
                hotkey.push("MacCtrl")
              }
              else {
                hotkey.push("Ctrl")
              }
            }
            if (oldPrefs.hotkey.altKey) {
              hotkey.push("Alt")
            }
            hotkey.push(oldPrefs.hotkey.key)
            OldOptions.remove("hotkey")
            const hotkey_str = hotkey.join("+")
            if (hotkey_str !== currentDefaults.hotkey) {
              savedOptions.hotkey = hotkey.join("+")
            }

            for (const i of ["main-css", "syntax-css", "gfm-line-breaks-enabled",
              "forgot-to-render-check-enabled", "math-enabled", "math-value"]) {
              if (oldPrefs[i] !== OldOptions.defaults[i]) {
                OldOptions.remove(i);
                if (savedOptions[i] !== currentDefaults[i]) {
                  savedOptions[i] = oldPrefs[i];
                }
              }
            }
          }
        });
      },
      OptionsSync.migrations.removeUnused
    ],
    logging: true,
  });
})()
