/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options storage for markdown-here-revival
 *
 * Requires https://github.com/fregante/webext-options-sync
 */

import { fetchExtFile } from '../async_utils.js'
import OptionsSync from './mailext-options-sync.js'

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

function MDHROptionsStore() {
  let main_css_default_p = fetchExtFile("/default.css")

  let DEFAULTS = Object.assign({}, kOptDefaults)
  main_css_default_p.then(async function (value) {
    DEFAULTS["main-css"] = await value
  })

  return new OptionsSync({
      defaults: DEFAULTS,
      migrations: [],
      logging: true,
  })
}

export default MDHROptionsStore()
