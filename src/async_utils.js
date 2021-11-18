/*
 * Copyright JFX 2021
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

export async function getHljsStyles() {
  return fetchExtFile(`${HLJS_STYLES_PATH}/styles.json`, true)
}

export async function getHljsStylesheetURL(syntax_css) {
  const available_styles = await getHljsStyles()
  const syntax_values = Object.values(available_styles)
  if (syntax_values.indexOf(syntax_css) === -1) {
    throw `Invalid stylesheet ${syntax_css}.`
  }
  return messenger.runtime.getURL(`${HLJS_STYLES_PATH}/${syntax_css}`)
}

export async function getHljsStylesheet(syntax_css) {
  return fetchExtFile(await getHljsStylesheetURL(syntax_css))
}

// Copied from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function sha256Digest(text) {
  const msgUint8 = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
