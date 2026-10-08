/*
 * Copyright JFX 2021-2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

const ALLOW_CSS_PROPS = [
  /^--.*$"/i,
  /^align.*$/i,
  /^background.*$/i,
  /^border.*$/i,
  /^color.*$/i,
  /^column.*$/i,
  /^contain$/i,
  /^content.*$/i,
  /^display$/i,
  /^empty-cells$/i,
  /^flex.*$/i,
  /^float$/i,
  /^font-.*$/i,
  /^gap$/i,
  /^grid.*$/i,
  /^hyphen.*$/i,
  /^inset.*$/i,
  /^isolation$/i,
  /^letter-spacing$/i,
  /^line-.*$/i,
  /^list-style.*$/i,
  /^margin-bottom$/i,
  /^margin-right$/i,
  /^margin-left$/i,
  /^margin-top$/i,
  /^object-.*$/i,
  /^opacity$/i,
  /^order$/i,
  /^outline.*$/i,
  /^overflow.*$/i,
  /^padding.*$/i,
  /^position$/i,
  /^quotes$/i,
  /^tab-size$/i,
  /^table-layout$/i,
  /^text-.*$/i,
  /^unicode-bidi$/i,
  /^vertical-align$/i,
  /^visibility$/i,
  /^white-space.*$/i,
  /^word-.*$/i,
]

export class CSSInliner {
  #defaultStyles
  #allowedProps
  constructor() {
    this.#defaultStyles = {}
    this.#allowedProps = null
  }

  // Names of the computed style properties worth inlining. Every element
  // exposes the same property list, so filter it once instead of matching
  // ALLOW_CSS_PROPS against every property of every element.
  #getAllowedProps(computedStyle) {
    if (this.#allowedProps === null) {
      this.#allowedProps = Array.from(computedStyle).filter((styleName) =>
        ALLOW_CSS_PROPS.some((regex) => regex.test(styleName)),
      )
    }
    return this.#allowedProps
  }

  // inlineStyles(elements): inlines the computed styles of each element (not
  // of its children).
  //
  // All styles are read before any is written: writing an inline style
  // invalidates the document styles, so interleaving reads and writes forces a
  // full style recalculation for every element, which takes seconds on large
  // messages (#111). Inlining computed values does not change the computed
  // values of the other elements, so reading everything first is equivalent.
  inlineStyles(elements) {
    const view = elements[0]?.ownerDocument.defaultView
    if (!view) {
      return
    }
    const pending = []
    for (const element of elements) {
      const computedStyle = view.getComputedStyle(element)
      if (this.#defaultStyles[element.tagName] == null) {
        this.#defaultStyles[element.tagName] = view.getDefaultComputedStyle(element)
      }
      const defaultStyle = this.#defaultStyles[element.tagName]
      const styles = []
      for (const styleName of this.#getAllowedProps(computedStyle)) {
        const value = computedStyle[styleName]
        // exclude default styles
        if (defaultStyle[styleName] !== value) {
          styles.push([styleName, value])
        }
      }
      pending.push([element, styles])
    }
    for (const [element, styles] of pending) {
      for (const [styleName, value] of styles) {
        element.style[styleName] = value
      }
      if (element.style.length === 0) {
        element.removeAttribute("style")
      }
    }
  }
}
