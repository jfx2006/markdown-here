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


let texInline = function (mathcode) {
  try {
    return tex2SVG(mathcode)
  } catch (error) {
    console.log(error)
  }
}

const mathInlineRule = /^(\$)([^$]|[^$][\s\S]*?[^$])\1(?!\$)/
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
