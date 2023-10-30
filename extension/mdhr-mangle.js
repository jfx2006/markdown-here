/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import TurndownService from "./vendor/turndown.esm.js"
import { degausser } from "./vendor/degausser.esm.js"

async function sha256Digest(data) {
  return messenger.runtime.sendMessage({ action: "sha256", data: data })
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
    return degausser(this.doc.body)
  }

  async excludeContent() {
    const excluded = this.doc.querySelectorAll(
      // eslint-disable-next-line max-len
      "body > div.moz-cite-prefix, body > blockquote[type='cite'], body > .moz-signature, body > div.moz-forward-container",
    )
    for (const e of excluded) {
      const range = this.doc.createRange()
      range.selectNode(e)
      const excludeContent = range.cloneContents()
      const placeholder = `MDHR-${await sha256Digest(excludeContent.textContent)}`
      this.#excludedContent.set(placeholder, excludeContent)
      const placeholderElem = this.doc.createElement("span")
      placeholderElem.innerText = placeholder
      e.replaceWith(placeholderElem)
    }
  }

  insertLinebreaks() {
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

  convertHTML() {
    const convertElems = this.doc.body.querySelectorAll("a, img, b, strong, i, em")
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
      let replacement = ""
      for (const child of value.children) {
        child.classList.add("markdown-here-exclude")
        replacement = `${replacement}${child.outerHTML}`
      }
      result_html = result_html.replace(key, replacement)
    })
    this.#result_html = result_html
    return this.#result_html
  }
}
