/*
 * Copyright JFX 2023
 * MIT License
 */

const defaultOptions = {
  math_renderer: "disabled",
  math_url: undefined,
  render_func: undefined,
}

export function markedMath(options) {
  options = {
    ...defaultOptions,
    ...options,
  }

  if (options.math_renderer === "disabled") {
    throw new Error("math_renderer is disabled")
  } else if (options.math_renderer === "gchart") {
    if (!options.math_url) {
      throw new Error("GChart math_renderer requires options.math_url")
    }
    options.render_func = mathifyGChart
  } else if (options.math_renderer === "texzilla") {
    options.render_func = mathifyTeXZilla
  } else {
    throw new Error("math_renderer is invalid!")
  }

  async function mathifyGChart(math_code) {
    return options.math_url
      .replace(/\{mathcode\}/gi, math_code)
      .replace(/\{urlmathcode\}/gi, encodeURIComponent(math_code))
  }

  async function mathifyTeXZilla(math_code) {
    const { TeX2PNG } = await import("./marked-texzilla.js")
    return await TeX2PNG(math_code)
  }

  return {
    extensions: [
      {
        name: "mathBlock",
        level: "block", // Is this a block-level or inline-level tokenizer?
        start(src) {
          return src.indexOf("\n$$")
        },
        tokenizer(src, tokens) {
          const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/) // Regex for the complete token
          if (match) {
            return {
              // Token to generate
              type: "mathBlock", // Should match "name" above
              raw: match[0], // Text to consume from the source
              math_code: match[1].trim(),
              html: "",
            }
          }
        },
        renderer(token) {
          return `
            <div style="display:block;text-align:center;">
            ${token.html}
            </div>`
        },
      },
      {
        name: "mathInline",
        level: "inline", // Is this a block-level or inline-level tokenizer?
        start(src) {
          return src.indexOf("$")
        },
        tokenizer(src, tokens) {
          const match = src.match(/^\$+([^$\n]+?)\$+/)
          if (match) {
            return {
              // Token to generate
              type: "mathInline", // Should match "name" above
              raw: match[0], // Text to consume from the source
              math_code: match[1].trim(),
              html: "",
            }
          }
        },
        renderer(token) {
          return token.html
        },
      },
    ],
    async: true,
    async walkTokens(token) {
      if (token.type === "mathInline" || token.type === "mathBlock") {
        token.html = await options.render_func(token.math_code)
      }
    },
  }
}
