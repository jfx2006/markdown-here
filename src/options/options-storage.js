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

export const kOptDefaults = {
  'main-css': "/* Unreal CSS */",
  'syntax-css': "nnfx.css",
  'math-enabled': false,
  'math-value': `<img src="https://chart.googleapis.com/chart?cht=tx&chl={urlmathcode}" alt="{mathcode}">`,
  'hotkey-input': "Ctrl+Alt+M",
  'forgot-to-render-check-enabled': true,
  'gfm-line-breaks-enabled': true
}

async function fetchExtFile(path) {
  const url = messenger.runtime.getURL(path)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error fetching ${path}: ${response.status}`)
  }
  return await response.text()
}

function optionsStore() {
  let DEFAULTS = Object.create(kOptDefaults);
  fetchExtFile("/default.css").then(data => {
    DEFAULTS["main-css"] = data
    }
  )

  return new OptionsSync({
    defaults: DEFAULTS,
    migrations: [
      OptionsSync.migrations.removeUnused
    ],
    storageName: "default",
    logging: true,
  })
}

export let OptionsStore = optionsStore()


