/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import OptionsStore from "./options/options-storage.js"
import { fetchExtFile, wxGetUrl } from "./wxfetch.mjs"

export { fetchExtFile, wxGetUrl } from "./wxfetch.mjs"

export const HLJS_STYLES_PATH = "/highlightjs/styles"
const FALLBACK_HLJS_CSS = "nnfx-light.css"

export async function getHljsStyles() {
  return fetchExtFile(`${HLJS_STYLES_PATH}/styles.json`, true)
}

export async function getHljsStylesheetURL(syntax_css) {
  const available_styles = await getHljsStyles()
  const syntax_values = Object.values(available_styles)
  if (syntax_values.indexOf(syntax_css) === -1) {
    console.log(`Invalid hljs CSS. Returning fallback ${FALLBACK_HLJS_CSS}`)
    syntax_css = FALLBACK_HLJS_CSS
  }
  return wxGetUrl(`${HLJS_STYLES_PATH}/${syntax_css}`)
}

export async function getHljsStylesheet(syntax_css) {
  return fetchExtFile(await getHljsStylesheetURL(syntax_css))
}

export async function getSyntaxCSS() {
  const syntax_css_name = await OptionsStore.get("syntax-css")
  return await getHljsStylesheet(syntax_css_name["syntax-css"])
}
export async function getMainCSS() {
  const main_css = await OptionsStore.get("main-css")
  return main_css["main-css"]
}

// Copied from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function sha256Digest(text) {
  const msgUint8 = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

const LANGS = [
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "pt_BR",
  "ru",
  "tr",
  "zh_CN",
  "zh_TW",
]

export async function getLanguage() {
  let accepted_langs = await messenger.i18n.getAcceptLanguages()
  for (let lang of accepted_langs) {
    if (LANGS.includes(lang)) {
      return lang
    }
  }
  return "en"
}

export function getMessage(messageID, subs = null) {
  let message = window.messenger?.i18n.getMessage(messageID, subs) || null
  if (!message) {
    console.error("Could not find message ID: " + messageID)
    return null
  }
  return message
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const context = this,
      args = arguments
    const later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

export function toInt(value) {
  // Wrapper around parseInt to always return an integer value or throw if not
  const rv = parseInt(value)
  if (isNaN(rv)) {
    throw new Error(`Not an integer ${value}!`)
  }
  return rv
}
