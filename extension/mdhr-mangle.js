/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import TurndownService from "./vendor/turndown.esm.js"
import Dentity from "./vendor/dentity.esm.js"
import { degausser } from "./vendor/degausser.esm.js"

const MDHR_RAW_PREFIX = "MDH:"
const MDHR_RAW_CSS =
  "height:0;width:0;max-height:0;max-width:0;overflow:hidden;font-size:0;padding:0;margin:0;"

async function sha256Digest(data) {
  return messenger.runtime.sendMessage({ action: "sha256", data: data })
}

function strToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
  return btoa(binString)
}

export class MdhrMangle {
  #excludedContent = new Map()
  #result_html
  constructor(msgDocument) {
    this.doc = msgDocument
  }

  async preprocess() {
    await this.saveContent()
    await this.excludeContent()
    this.insertLinebreaks()
    //this.escapeTags()
    this.convertHTML()
    const text = degausser(this.doc.body)
    return text.replaceAll(" ", " ")
  }

  async saveContent() {
    const content = `${this.doc.body.innerHTML}`
    const rawHolder = this.doc.createElement("div")
    rawHolder.classList.add("mdhr-raw")
    rawHolder.setAttribute("style", MDHR_RAW_CSS)
    rawHolder.setAttribute("aria-hidden", "true")
    rawHolder.innerText = "&#8203;"
    const encoded = strToBase64(content)
    rawHolder.title = `${MDHR_RAW_PREFIX}${encoded}`
    this.doc.body.insertAdjacentElement("beforeend", rawHolder)
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
      const sibling = br_elem.nextSibling
      if (
        sibling &&
        sibling.nodeType === Node.TEXT_NODE &&
        !sibling.textContent.startsWith("\n")
      ) {
        br_elem.insertAdjacentText("afterend", "\n")
      }
    }
  }

  escapeTags() {
    const escapeElems = this.doc.querySelectorAll("img")
    for (const e of escapeElems) {
      const span = this.doc.createElement("span")
      const text = Dentity.encode(e.outerHTML)
      span.innerText = text
      e.replaceWith(span)
    }
  }

  convertHTML() {
    const convertElems = this.doc.body.querySelectorAll("a, b, strong, i, em")
    const td = new TurndownService()
    for (const e of convertElems) {
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
