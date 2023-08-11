/*
 * Copyright JFX 2023
 * MIT License
 */

const defaultOptions = {
  math_renderer: "disabled",
  math_url: undefined,
  render_func: undefined,
}

const inlineStartRule = /(?<=\s|^)\$(?!\$)/
const inlineRule = /^(\$)([^$\n]|[^$\n][\s\S]*?[^$])\1(?!\$)/
const blockRule = /^(\$\$)([^$]|[^$][\s\S]*?[^$])\1(?!\$)/

export function markedMath(options = {}) {
  const mathRenderer = createRenderer(options)
  return {
    extensions: [
      mathBlock(options, createRenderer(options)),
      mathInline(options, createRenderer(options)),
    ],
    async: true,
    async walkTokens(token) {
      if (token.type === "mathInline" || token.type === "mathBlock") {
        token.html = await mathRenderer(token.math_code, token.type === "mathBlock")
      }
    },
  }
}

function createRenderer(options) {
  options = {
    ...defaultOptions,
    ...options,
  }

  async function mathifyGChart(math_code) {
    return options.math_url
      .replace(/\{mathcode\}/gi, math_code)
      .replace(/\{urlmathcode\}/gi, encodeURIComponent(math_code))
  }

  async function mathifyTeXZilla(math_code, isBlock) {
    const { TeX2PNG } = await import("./marked-texzilla.js")
    return await TeX2PNG(math_code, isBlock)
  }

  if (options.math_renderer === "disabled") {
    throw new Error("math_renderer is disabled")
  } else if (options.math_renderer === "gchart") {
    if (!options.math_url) {
      throw new Error("GChart math_renderer requires options.math_url")
    }
    return mathifyGChart
  } else if (options.math_renderer === "texzilla") {
    return mathifyTeXZilla
  } else {
    throw new Error("math_renderer is invalid!")
  }
}

function mathBlock(options, renderer) {
  return {
    name: "mathBlock",
    level: "block", // Is this a block-level or inline-level tokenizer?
    start(src) {
      return src.match(/\$\$/)?.index
    },
    tokenizer(src, tokens) {
      const match = src.match(blockRule) // Regex for the complete token
      if (match) {
        return {
          // Token to generate
          type: "mathBlock", // Should match "name" above
          raw: match[0], // Text to consume from the source
          math_code: match[2].trim(),
          html: "",
        }
      }
    },
    renderer(token) {
      return `
            <div style="display:block;text-align:center;margin-top:-1em;margin-bottom:1.2em;">
            ${token.html}
            </div>`
    },
  }
}

function mathInline(options, renderer) {
  return {
    name: "mathInline",
    level: "inline", // Is this a block-level or inline-level tokenizer?
    start(src) {
      const match = src.match(inlineStartRule)
      if (!match) {
        return
      }
      const possibleMath = src.substring(match.index)
      if (possibleMath.match(inlineRule)) {
        return match.index
      }
    },
    tokenizer(src, tokens) {
      const match = src.match(inlineRule)
      if (match) {
        return {
          // Token to generate
          type: "mathInline", // Should match "name" above
          raw: match[0], // Text to consume from the source
          math_code: match[2].trim(),
          html: "",
        }
      }
    },
    renderer(token) {
      return token.html
    },
  }
}
