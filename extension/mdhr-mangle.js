/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import TurndownService from "./vendor/turndown.esm.js"

async function sha256Digest(data) {
  return messenger.runtime.sendMessage({ action: "sha256", data: data })
}

// Thunderbird trims the result of convertToPlainText(), which drops the
// indentation of a message that starts with an indented code block. A marker
// in front of the content keeps it; leading blank lines are still removed.
const START_MARKER = "MDHR_START_MARKER"

async function convertToText(elem) {
  elem.prepend(START_MARKER)
  const text = await messenger.messengerUtilities.convertToPlainText(elem.outerHTML, {
    flowed: false,
  })
  elem.firstChild.remove()
  const start = text.indexOf(START_MARKER)
  if (start === -1) {
    return text
  }
  return text.slice(start + START_MARKER.length).replace(/^(?:[ \t\u00a0]*\n)+/, "")
}

export class MdhrMangle {
  #excludedContent = new Map()
  #result_html
  constructor(msgDocument) {
    this.doc = msgDocument
  }

  async preprocess() {
    await this.excludeContent()
    this.insertLinebreaks()
    this.convertHTML()
    const text = await convertToText(this.doc.body)
    return text.replaceAll(" ", " ")
  }

  async excludeContent() {
    const emojiDrop = this.doc.querySelector("ul.dropdown-menu")
    if (emojiDrop) {
      emojiDrop.remove()
    }

    const excluded = this.doc.querySelectorAll(
      // eslint-disable-next-line max-len
      "body > blockquote[type='cite'], body > .moz-signature, body > div.moz-forward-container, img, div.mdhr-raw",
    )
    for (const e of excluded) {
      const excludeContent = e.outerHTML
      const placeholder = `MDHR-${await sha256Digest(excludeContent)}`
      this.#excludedContent.set(placeholder, excludeContent)
      const placeholderElem = this.doc.createElement("span")
      placeholderElem.innerText = placeholder
      e.replaceWith(placeholderElem)
    }
  }

  insertLinebreaks() {
    const div_elems = this.doc.body.querySelectorAll("div")
    for (const div_elem of div_elems) {
      const previousSibling = div_elem.previousSibling
      if (
        previousSibling &&
        previousSibling.nodeType === Node.TEXT_NODE &&
        !previousSibling.textContent.endsWith("\n")
      ) {
        div_elem.insertAdjacentText("beforebegin", "\n")
      }
    }
    const br_elems = this.doc.body.querySelectorAll("br")
    for (const br_elem of br_elems) {
      const previousSibling = br_elem.previousSibling
      const nextSibling = br_elem.nextSibling

      if (
        previousSibling &&
        previousSibling.nodeType === Node.TEXT_NODE &&
        !previousSibling.textContent.endsWith("\n") &&
        nextSibling &&
        nextSibling.nodeType === Node.TEXT_NODE &&
        !nextSibling.textContent.startsWith("\n")
      ) {
        br_elem.insertAdjacentText("afterend", "\n")
      }
    }
  }

  // Links and emphasis that Thunderbird renders inside Markdown code (inline
  // `code` or a ``` fence), such as an auto-linked URL, are code text, not
  // Markdown (adam-p/markdown-here#104). Code indented by four spaces is not
  // detected.
  findElemsInCode(elems) {
    const targets = new Set(elems)
    const inCode = new Set()
    let line = ""
    let inFence = false
    const endLine = () => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
      }
      line = ""
    }
    const walker = this.doc.createTreeWalker(
      this.doc.body,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    )
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.data.split("\n")
        parts.forEach((part, i) => {
          if (i > 0) {
            endLine()
          }
          line += part
        })
      } else if (targets.has(node)) {
        if (inFence || (line.match(/`/g) || []).length % 2 === 1) {
          inCode.add(node)
        }
      } else if (["BR", "DIV", "P"].includes(node.nodeName)) {
        endLine()
      }
    }
    return inCode
  }

  convertHTML() {
    const convertElems = this.doc.body.querySelectorAll("a, b, strong, i, em")
    const inCode = this.findElemsInCode(convertElems)
    const td = new TurndownService()
    for (const e of convertElems) {
      if (inCode.has(e)) {
        e.replaceWith(e.textContent)
        continue
      }
      const md = this.doc.createElement("span")
      const wrapper = this.doc.createElement("x-turndown-root")
      wrapper.id = "turndown-root"
      e.insertAdjacentElement("beforebegin", wrapper)
      wrapper.appendChild(e)
      md.innerText = td.turndown(wrapper)
      wrapper.replaceWith(md)
    }
  }

  postprocess(result_html) {
    this.#excludedContent.forEach(function (value, key, map) {
      result_html = result_html.replace(key, value)
    })
    this.#result_html = result_html
    return this.#result_html
  }
}
