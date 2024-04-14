/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

export function markedSmartStuff() {
  return {
    tokenizer: {
      inlineText(src) {
        // don't escape inlineText
        const cap = this.rules.inline.text.exec(src)

        /* istanbul ignore next */
        if (!cap) {
          // should never happen
          return
        }

        const text = cap[0]
          .replace(/<-->/g, "\u2194")
          .replace(/<--/g, "\u2190")
          .replace(/-->/g, "\u2192")
          .replace(/<==>/g, "\u21d4")
          .replace(/<==/g, "\u21d0")
          .replace(/==>/g, "\u21d2")
          .replace(/---/g, "\u2014")
          // en-dashes
          .replace(/--/g, "\u2013")
          // opening singles
          // eslint-disable-next-line no-useless-escape
          .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018")
          // closing singles & apostrophes
          .replace(/'/g, "\u2019")
          // opening doubles
          // eslint-disable-next-line no-useless-escape
          .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201c")
          // closing doubles
          .replace(/"/g, "\u201d")
          // ellipses
          .replace(/\.{3}/g, "\u2026")

        return {
          type: "text",
          raw: cap[0],
          text,
        }
      },
    },
  }
}
