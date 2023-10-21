/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

class MDHRExternalContent extends HTMLElement {
  constructor() {
    super()
    const templateStr = `<template id="external-content">
      <slot name="content"></slot>
    </template>`
    const template = this.templateString2Elem(templateStr)
    const templateContent = template.content

    this.attachShadow({ mode: "open" }).appendChild(templateContent.cloneNode(true))
  }
  templateString2Elem(templateString) {
    const tmpDoc = new DOMParser().parseFromString(templateString, "text/html")
    return tmpDoc.querySelector("template")
  }
}
customElements.define("mdhr-external-content", MDHRExternalContent)

/* wrap an element with another
 * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
 */
function wrap(element) {
  if (element && element.parentNode) {
    const wrapper = document.createElement("mdhr-external-content")
    element.parentNode.insertBefore(wrapper, element)
    wrapper.appendChild(element)
  }
}

/**
 * Wrap an array of items all at once
 * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
 */
function wrapAll(elementArray) {
  if (elementArray && elementArray.length) {
    const wrapper = document.createElement("mdhr-external-content")
    elementArray[0].parentNode.insertBefore(wrapper, elementArray[0])
    for (let i in elementArray) {
      wrapper.appendChild(elementArray[i])
    }
  }
}

/* unwrap away from an element
 * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
 */
export function unwrap(element) {
  if (element && element.parentNode) {
    // move all children out of the element
    while (element.firstChild) {
      element.parentNode.insertBefore(element.firstChild, element)
    }
    // remove the empty element
    element.remove()
  }
}

export function wrapQuoted() {
  /* Similar to wrapBySelector, except when replying, quoted content is two
     elements: <div class="moz-cite-prefix"/><blockquote/>
     It's not possible to select those with a single CSS selector until `:has`
     is fully supported by Thunderbird, so do the pairing manually.
   */
  const prefixes = document.querySelectorAll("body > div.moz-cite-prefix")
  for (const cite of prefixes) {
    const blockquote = cite.nextElementSibling
    if (blockquote.tagName !== "BLOCKQUOTE") {
      continue
    }
    cite.slot = "content"
    blockquote.slot = "content"
    wrapAll([cite, blockquote])
  }
}

function wrapBySelector(selector) {
  /* Wraps each element selected by the selector in an <mdhr-external-content> */
  const elements = document.querySelectorAll(selector)
  for (const element of elements) {
    element.slot = "content"
    wrap(element)
  }
}

export function wrapForwarded() {
  wrapBySelector("body > div.moz-forward-container")
}

export function wrapSignature() {
  wrapBySelector("body > div.moz-signature, body > pre.moz-signature")
}
