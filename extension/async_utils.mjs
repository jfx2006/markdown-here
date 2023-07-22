/*
 * Copyright JFX 2021-2023
 * MIT License
 */

import OptionsStore from "./options/options-storage.js"

export function wxGetUrl(path) {
  const url = window.messenger?.runtime.getURL(path)
  if (url) {
    return url
  }
  if (path.startsWith("/")) {
    const slashroot = document.querySelector("meta[name=slashroot]").content || "."
    path = `${slashroot}${path}`
  }
  const u = new URL(path, location.href)
  return u.href
}

export async function fetchExtFile(path, json = false) {
  const url = wxGetUrl(path)
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

const EMOJI_SHORTCODES = "/data/emoji_codes.json"

export async function getEmojiShortcodes() {
  return fetchExtFile(EMOJI_SHORTCODES, true)
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

// Returns true if `text` looks like raw Markdown, false otherwise.
export function probablyWritingMarkdown(mdMaybe) {
  /*
  This is going to be tricky and fraught with danger. Challenges:
    * If it's not sensitive enough, it's useless.
    * If it's too sensitive, users will be super annoyed.
    * Different people write different kinds of Markdown: coders use backticks,
      mathies use dollar signs, normal people don't use either.
    * Being slow would be bad.

  Ways I considered doing this, but discarded:
    * Use Highlight.js's relevance score.
    * Use the size of the array returned by Marked.js's lexer/parser.
    * Render the contents, replace `<p>` tags with newlines, do string distance.

  But I think there are some simple heuristics that will probably be more
  accurate and/or faster.
*/

  // Ensure that we're not checking on enormous amounts of text.
  if (mdMaybe.length > 10000) {
    mdMaybe = mdMaybe.slice(0, 10000)
  }

  // TODO: Export regexes from Marked.js instead of copying them. Except...
  // Marked's rules use /^.../, which breaks our matching.

  // NOTE: It's going to be tempting to use a ton of fancy regexes, but remember
  // that this check is getting run every few seconds, and we don't want to
  // slow down the user's browser.
  // To that end, we're going to stop checking when we find a match.

  function logMatch(type, match) {
    const log =
      "Markdown Here detected unrendered " +
      type +
      (typeof match.index !== "undefined"
        ? ': "' + mdMaybe.slice(match.index, match.index + 10) + '"'
        : "")

    if (log !== probablyWritingMarkdown.lastLog) {
      console.log(log)
      probablyWritingMarkdown.lastLog = log
    }
  }

  // At least two bullet points
  const bulletList = mdMaybe.match(/^[*+-] /gm)
  if (bulletList && bulletList.length > 1) {
    logMatch("bullet list", bulletList)
    return true
  }

  // Backticks == code. Does anyone use backticks for anything else?
  const backticks = mdMaybe.match(/`/)
  if (backticks) {
    logMatch("code", backticks)
    return true
  }

  // Math
  const math = mdMaybe.match(/`\$([^ \t\n$]([^$]*[^ \t\n$])?)\$`/)
  if (math) {
    logMatch("math", math)
    return true
  }

  // We're going to look for strong emphasis (e.g., double asterisk), but not
  // light emphasis (e.g., single asterisk). Rationale: people use surrounding
  // single asterisks pretty often in ordinary, non-MD text, and we don't want
  // to be annoying.
  // TODO: If we ever get really fancy with MD detection, the presence of light
  // emphasis should still contribute towards the determination.
  const emphasis = mdMaybe.match(/__([\s\S]+?)__(?!_)|\*\*([\s\S]+?)\*\*(?!\*)/)
  if (emphasis) {
    logMatch("emphasis", emphasis)
    return true
  }

  // Headers. (But not hash-mark-H1, since that seems more likely to false-positive, and
  // less likely to be used. And underlines of at least length 5.)
  const header = mdMaybe.match(/(^\s{0,3}#{2,6}[^#])|(^\s*[-=]{5,}\s*$)/m)
  if (header) {
    logMatch("header", header)
    return true
  }

  // Links
  // I'm worried about incorrectly catching square brackets in rendered code
  // blocks, so we're only going to look for '](' and '][' (which still aren't
  // immune to the problem, but a little better). This means we won't match
  // reference links (where the text in the square brackets is used elsewhere for
  // for the link).
  const link = mdMaybe.match(/\]\(|\]\[/)
  if (link) {
    logMatch("link", link)
    return true
  }

  return false
}
