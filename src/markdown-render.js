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
            .replace(/\{urlmathcode\}/ig, encodeURIComponent(mathcode));
  }

  // Hook into some of Marked's renderer customizations
  const markedRenderer = new marked.Renderer();

  const defaultLinkRenderer = markedRenderer.link;
  markedRenderer.link = function(href, title, text) {
    // Added to fix MDH issue #57: MD links should automatically add scheme.
    // Note that the presence of a ':' is used to indicate a scheme, so port
    // numbers will defeat this.
    href = href.replace(/^(?!#)([^:]+)$/, 'http://$1');

    return defaultLinkRenderer.call(this, href, title, text);
  };

  function mathsExpression(expr) {
    if (userprefs['math-enabled']) {
      if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
        expr = expr.substr(2, expr.length - 4);
        const math_rendered = mathify(expr);
        return `
                <div style="display:block;text-align:center;">
                  ${math_rendered}
                </div>`;
      } else if (expr.match(/^\$[\s\S]*\$$/)) {
        expr = expr.substr(1, expr.length - 2);
        return mathify(expr);
      }
    } else {
      return false;
    }
  }

  const defaultCodeRenderer = markedRenderer.code;
  markedRenderer.code = function(code, lang, escaped) {
    if (!lang) {
      const math = mathsExpression(code);
      if (math) {
        return math;
      }
    }
    if (code.startsWith("\n")) {
      code = code.trimStart()
    }
    return defaultCodeRenderer.call(this, code, lang, escaped);
  };

  const defaultCodespanRenderer = markedRenderer.codespan;
  markedRenderer.codespan = function(text) {
    const math = mathsExpression(text);
    if (math) {
      return math;
    }
    return defaultCodespanRenderer.call(this, text);
  };

  const markedOptions = {
    renderer: markedRenderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    smartLists: true,
    breaks: userprefs["gfm-line-breaks-enabled"],
    smartypants: userprefs["smart-quotes-enabled"],
    // Bit of a hack: highlight.js uses a `hljs` class to style the code block,
    // so we'll add it by sneaking it into this config field.
    langPrefix: "hljs language-",
    highlight: function(codeText, codeLanguage) {
        if (codeLanguage &&
            hljs.getLanguage(codeLanguage.toLowerCase())) {
          return hljs.highlight(codeLanguage.toLowerCase(), codeText).value
        }

        return codeText
      }
    }

  marked.setOptions(markedOptions)
  return marked(mdText)
}
