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
import { mathBlock, mathInline } from "./marked-texzilla.js"
import hljs from "./highlightjs/highlight.min.js"

"use strict"

/**
 Using the functionality provided by the functions htmlToText and markdownToHtml,
 render html into pretty text.
 */
export default function markdownRender(mdText, userprefs) {
  function mathify(mathcode) {
    return userprefs['math-value']
            .replace(/\{mathcode\}/ig, mathcode)
            .replace(/\{urlmathcode\}/ig, encodeURIComponent(mathcode))
  }

  // Hook into some of Marked's renderer customizations
  const markedRenderer = new marked.Renderer()

  const defaultLinkRenderer = markedRenderer.link
  markedRenderer.link = function(href, title, text) {
    // Added to fix MDH issue #57: MD links should automatically add scheme.
    // Note that the presence of a ':' is used to indicate a scheme, so port
    // numbers will defeat this.
    href = href.replace(/^(?!#)([^:]+)$/, 'http://$1')

    return defaultLinkRenderer.call(this, href, title, text)
  }

  function mathsExpression(expr) {
    if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
      expr = expr.substr(2, expr.length - 4)
      const math_rendered = mathify(expr)
      return `
              <div style="display:block;text-align:center;">
                ${math_rendered}
              </div>`
    } else if (expr.match(/^\$[\s\S]*\$$/)) {
      expr = expr.substr(1, expr.length - 2)
      return mathify(expr)
    }
    return false
  }

  const defaultCodeRenderer = markedRenderer.code
  const gchartCodeRenderer = function(code, lang, escaped) {
    if (!lang) {
      const math = mathsExpression(code)
      if (math) {
        return math
      }
    }
    if (code.startsWith("\n")) {
      code = code.trimStart()
    }
    return defaultCodeRenderer.call(this, code, lang, escaped)
  }

  const defaultCodespanRenderer = markedRenderer.codespan
  const gchartCodespanRenderer = function(text) {
    const math = mathsExpression(text)
    if (math) {
      return math
    }
    return defaultCodespanRenderer.call(this, text)
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
          text = this.options.sanitize
            ? this.options.sanitizer
              ? this.options.sanitizer(cap[0])
              : escape(cap[0])
            : cap[0]
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

  const markedOptions = {
    renderer: markedRenderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    smartLists: true,
    breaks: userprefs["gfm-line-breaks-enabled"],
    smartypants: userprefs["smart-replacements-enabled"],
    // Bit of a hack: highlight.js uses a `hljs` class to style the code block,
    // so we'll add it by sneaking it into this config field.
    langPrefix: "hljs language-",
    highlight: function (codeText, codeLanguage) {
      if (codeLanguage && hljs.getLanguage(codeLanguage.toLowerCase())) {
        return hljs.highlight(codeText, {
          language: codeLanguage.toLowerCase(),
        }).value
      }
      return codeText
    },
  }

  marked.setOptions(markedOptions)
  marked.use({tokenizer})
  if (userprefs["math-renderer"] === "gchart") {
    markedRenderer.code = gchartCodeRenderer
    markedRenderer.codespan = gchartCodespanRenderer
  } else if (userprefs["math-renderer"] === "texzilla") {
    marked.use({extensions: [mathBlock, mathInline]})
  }
  return marked(mdText)
}
