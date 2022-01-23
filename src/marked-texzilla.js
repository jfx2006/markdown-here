/*
* Copyright JFX 2021
* MIT License
*/
"use strict"

import TeXZilla from "./vendor/TeXZilla.js"
import { marked } from "./vendor/marked.esm.js"

function tex2SVG(aTeX, aRTL, aSize) {
  // Set default size.
  if (aSize === undefined) {
    aSize = 24
  }
  let svgImg = TeXZilla.toImage(aTeX, aRTL, true, aSize)
  svgImg.classList.add("math_texzilla_svg")
  return svgImg.outerHTML
}

let texBlock = function(mathcode) {
  const math_rendered = tex2SVG(mathcode)
  return `
          <div style="display:block;text-align:center;">
            ${math_rendered}
          </div>`
}

let texInline = function(mathcode) {
  try {
    return tex2SVG(mathcode)
  } catch (error) {
    console.log(error)
  }
}

const mathBlockRule = /^(\$\$)([^$]|[^$][\s\S]*?[^$])\1(?!\$)/
export const mathBlock = {
  name: 'mathBlock',
  level: 'block',                                 // Is this a block-level or inline-level tokenizer?
  start(src) {
    return src.match(/\$\$/)?.index
  },
  tokenizer(src, tokens) {
    const match = mathBlockRule.exec(src)              // Regex for the complete token
    if (match) {
      return {                                         // Token to generate
        type: 'mathBlock',                             // Should match "name" above
        raw: match[0],                                 // Text to consume from the source
        text: match[2].trim(),
      }
    }
  },
  renderer(token) {
    return texBlock(token.text)
  },
}

const mathInlineRule = /^(\$)([^$\n]|[^$\n][\s\S]*?[^$])\1(?!\$)/
marked.Lexer.rules.inline.mathInline = mathInlineRule
export const mathInline = {
  name: 'mathInline',
  level: 'inline',                                 // Is this a block-level or inline-level tokenizer?
  start(src) {
    return src.match(/\$/)?.index
  },    // Hint to Marked.js to stop and check for a match
  tokenizer(src, tokens) {
    const match = mathInlineRule.exec(src)  // Regex for the complete token
    if (match) {
      return {                                         // Token to generate
        type: 'mathInline',                           // Should match "name" above
        raw: match[0],                                 // Text to consume from the source
        text: match[2].trim(),
      }
    }
  },
  renderer(token) {
    return texInline(token.text)
  },
}
