/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
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
import { markedHighlight } from "/vendor/marked-highlight.esm.js"
import hljs from "./highlightjs/highlight.min.js"
import markedExtendedTables from "./vendor/marked-extended-tables.esm.js"
import markedLinkifyIt from "./vendor/marked-linkify-it.esm.js"

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

  function smartarrows(text) {
    return text
      .replace(/<-->/g, "\u2194")
      .replace(/<--/g, "\u2190")
      .replace(/-->/g, "\u2192")
      .replace(/<==>/g, "\u21d4")
      .replace(/<==/g, "\u21d0")
      .replace(/==>/g, "\u21d2")
  }

  const tokenizer = {
    inlineText(src, smartypants) {
      const cap = this.rules.inline.text.exec(src)
      if (cap) {
        let text
        if (this.lexer.state.inRawBlock) {
          text = cap[0]
        } else {
          text = this.options.smartypants ? smartypants(smartarrows(cap[0])) : cap[0]
        }
        return {
          type: "text",
          raw: cap[0],
          text,
        }
      }
    },
  }

  // Hook into some of Marked's renderer customizations
  const markedRenderer = new marked.Renderer()

  const defaultLinkRenderer = markedRenderer.link
  markedRenderer.link = function (href, title, text) {
    // Added to fix MDH issue #57: MD links should automatically add scheme.
    // Note that the presence of a ':' is used to indicate a scheme, so port
    // numbers will defeat this.
    href = href.replace(/^(?!#)([^:]+)$/, "https://$1")

    return defaultLinkRenderer.call(this, href, title, text)
  }

  const markedOptions = {
    renderer: markedRenderer,
    gfm: true,
    pedantic: false,
    breaks: userprefs["gfm-line-breaks-enabled"],
  }

  marked.setOptions(markedOptions)
  marked.use(markedExtendedTables())
  marked.use(markedLinkifyIt({}, {}))
  if (userprefs["smart-replacements-enabled"]) {
    const { markedSmartypants } = await import("./vendor/marked-smartypants.esm.js")
    marked.use(markedSmartypants())
    marked.use({ tokenizer })
  }
  marked.use(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const lowerLang = lang.toLowerCase()
        const language = hljs.getLanguage(lowerLang) ? lowerLang : "plaintext"
        return hljs.highlight(code, { language }).value
      },
    })
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
