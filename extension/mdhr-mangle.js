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

async function convertToText(elem) {
  if (messenger.messengerUtilities?.convertToPlainText === undefined) {
    return degausser(elem)
  }
  return await messenger.messengerUtilities.convertToPlainText(elem.outerHTML, {
    flowed: false,
  })
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
