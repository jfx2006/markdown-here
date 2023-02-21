/*
 * Copyright JFX 2021-2023
 * MIT License
 */

export async function fetchExtFile(path, json=false) {
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
  return messenger.runtime.getURL(`${HLJS_STYLES_PATH}/${syntax_css}`)
}

export async function getHljsStylesheet(syntax_css) {
  return fetchExtFile(await getHljsStylesheetURL(syntax_css))
}

const EMOJI_SHORTCODES = "/data/emoji_codes.json"

export async function getEmojiShortcodes() {
  return fetchExtFile(EMOJI_SHORTCODES, true)
}

// Copied from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function sha256Digest(text) {
  const msgUint8 = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

const LANGS = ["de", "en", "es", "fr", "it", "ja", "ko", "pl", "pt_BR", "ru", "tr", "zh_CN", "zh_TW"]

export async function getLanguage() {
  let accepted_langs = await messenger.i18n.getAcceptLanguages()
  for (let lang of accepted_langs) {
    if (LANGS.includes(lang)) {
      return lang
    }
  }
  return "en"
}

export function getMessage(messageID, subs=null) {
  let message = messenger.i18n.getMessage(messageID, subs)
  if (!message) {
    console.error('Could not find message ID: ' + messageID)
    return null
  }
  return message
}
