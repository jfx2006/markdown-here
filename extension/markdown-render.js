/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

/*
 * The function that does the basic raw-Markdown-in-HTML to rendered-HTML
 * conversion.
 * The reason we keep this function -- specifically, the function that uses our
 * external markdown renderer (marked.js), text-from-HTML module (jsHtmlToText.js),
 * and CSS -- separate is that it allows us to keep the bulk of the rendering
 * code (and the bulk of the code in our extension) out of the content script.
 * That way, we minimize the amount of code that needs to be loaded in every page.
 */

import { marked } from "./vendor/marked.esm.js"
import hljs from "./highlightjs/highlightjs.esm.js"
import { markedHighlight } from "./vendor/marked-highlight.esm.js"
import markedExtendedTables from "./vendor/marked-extended-tables.esm.js"
import markedLinkifyIt from "./vendor/marked-linkify-it.esm.js"
import { urlSchemify } from "./marked-link-scheme.esm.js"
import { taskListRenderer } from "./marked-tasklists.esm.js"

import OptionsStore from "./options/options-storage.js"

const defaultMarkedOptions = Object.assign({}, marked.getDefaults(), {
  mangle: undefined,
  headerIds: undefined,
  headerPrefix: undefined,
  smartypants: undefined,
})

export async function resetMarked(userprefs) {
  marked.setOptions(defaultMarkedOptions)

  if (userprefs) {
    userprefs = {
      ...OptionsStore.defaults,
      ...userprefs,
    }
  } else {
    userprefs = await OptionsStore.getAll()
  }

  const markedOptions = {
    gfm: true,
    pedantic: false,
    breaks: userprefs["gfm-line-breaks-enabled"],
  }

  marked.setOptions(markedOptions)
  marked.use(taskListRenderer())
  marked.use(urlSchemify())
  marked.use(markedExtendedTables())
  marked.use(markedLinkifyIt({}, { fuzzyLink: false }))
  if (userprefs["smart-replacements-enabled"]) {
    const { markedSmartStuff } = await import("./marked-smartstuff.esm.js")
    marked.use(markedSmartStuff())
  }
  marked.use(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const lowerLang = lang.toLowerCase()
        const language = hljs.getLanguage(lowerLang) ? lowerLang : "plaintext"
        return hljs.highlight(code, { language }).value
      },
    }),
  )
  if (userprefs["math-renderer"] !== "disabled") {
    const { markedMath } = await import("./marked-math.js")
    const mathOptions = {
      math_renderer: userprefs["math-renderer"],
      math_url: userprefs["math-value"],
    }
    marked.use(markedMath(mathOptions))
  }
  if (userprefs["emoji-shortcode-enabled"]) {
    const { markedEmoji } = await import("./vendor/marked-emoji.esm.js")
    const { default: emojis } = await import("./data/shortcodes.mjs")
    marked.use(markedEmoji({ emojis, unicode: true }))
  }
}

/**
 Using the functionality provided by the functions htmlToText and markdownToHtml,
 render html into pretty text.
 */
export async function markdownRender(mdText) {
  return await marked.parse(mdText)
}
