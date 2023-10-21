/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

;(function () {
  "use strict"

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

  function makeWrapperElem(msgDocument) {
    return msgDocument.createElement("mdhr-external-content")
  }

  /* wrap an element with another
   * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
   */
  function wrap(msgDocument, element) {
    if (element && element.parentNode) {
      const wrapper = makeWrapperElem(msgDocument)
      element.parentNode.insertBefore(wrapper, element)
      wrapper.appendChild(element)
      return wrapper
    }
  }

  /**
   * Wrap an array of items all at once
   * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
   */
  function wrapAll(msgDocument, elementArray) {
    if (elementArray && elementArray.length) {
      const wrapper = makeWrapperElem(msgDocument)
      elementArray[0].parentNode.insertBefore(wrapper, elementArray[0])
      for (let i in elementArray) {
        wrapper.appendChild(elementArray[i])
      }
      return wrapper
    }
  }

  /* unwrap away from an element
   * https://dev.to/btopro/simple-wrap-unwrap-methods-explained-3k5f
   */
  function unwrap(element) {
    if (element && element.parentNode) {
      // move all children out of the element
      while (element.firstChild) {
        element.parentNode.insertBefore(element.firstChild, element)
      }
      // remove the empty element
      element.remove()
    }
  }

  function wrapQuoted(msgDocument) {
    /* Similar to wrapBySelector, except when replying, quoted content is two
     elements: <div class="moz-cite-prefix"/><blockquote/>
     It's not possible to select those with a single CSS selector until `:has`
     is fully supported by Thunderbird, so do the pairing manually.
   */
    const prefixes = msgDocument.querySelectorAll("body > div.moz-cite-prefix")
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

  function wrapBySelector(msgDocument, selector) {
    /* Wraps each element selected by the selector in an <mdhr-external-content> */
    const elements = msgDocument.querySelectorAll(selector)
    for (const element of elements) {
      element.slot = "content"
      wrap(element)
    }
  }

  function wrapForwarded(msgDocument) {
    wrapBySelector(msgDocument, "body > div.moz-forward-container")
  }

  function wrapSignature(msgDocument) {
    wrapBySelector(msgDocument, "body > div.moz-signature, body > pre.moz-signature")
  }

  function wrapStyles(msgDocument) {
    // Check for <style> elements in <head> and any not inside <mdhr-external-content>
    // and move them
    const styles = msgDocument.querySelectorAll(
      "head > style, head > link[rel=stylesheet], body > style"
    )
    const wrapper = msgDocument.querySelector("body > mdhr-external-content")
    for (const styleElem of styles) {
      wrapper.appendChild(styleElem)
    }
  }

  // Exported functions
  function wrapContent(msgDocument, message_type) {
    if (message_type === "reply") {
      wrapQuoted(msgDocument)
    } else if (message_type === "forward") {
      wrapForwarded(msgDocument)
    }
    wrapSignature(msgDocument)
    wrapStyles(msgDocument)
    // msgDocument is modified in-place, no return
  }

  const EXPORTED_SYMBOLS = ["ExternalContent"]

  const ExternalContent = {
    wrapContent: wrapContent,
    unwrap: unwrap,
    _wrapStyles: wrapStyles,
    _wrapSignature: wrapSignature,
    _wrapQuoted: wrapQuoted,
    _wrapForwarded: wrapForwarded,
    _wrapBySelector: wrapBySelector,
    _wrapAll: wrapAll,
    _wrap: wrap,
    _makeWrapperElem: makeWrapperElem,
  }
  if (typeof module !== "undefined") {
    module.exports = ExternalContent
  } else {
    this.ExternalContent = ExternalContent
    this.EXPORTED_SYMBOLS = EXPORTED_SYMBOLS
  }
}).call(
  (function () {
    return this || (typeof window !== "undefined" ? window : global)
  })()
)
