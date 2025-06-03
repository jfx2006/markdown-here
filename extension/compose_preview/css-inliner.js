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
  constructor() {
    this.#defaultStyles = {}
  }
  // inlineStylesForSingleElement(element, target): inlines the styles for a
  // single element, but not it's children
  //
  // Params:
  // element: The element that computed styles inlined
  inlineStylesForSingleElement(element) {
    const computedStyle = document.defaultView.getComputedStyle(element)
    if (this.#defaultStyles[element.tagName] == null) {
      this.#defaultStyles[element.tagName] = document.defaultView.getDefaultComputedStyle(element)
    }
    for (let i = 0; i < computedStyle.length; i++) {
      const styleName = computedStyle[i]
      if (ALLOW_CSS_PROPS.some((regex) => styleName.match(regex)?.length > 0)) {
        // exclude default styles
        if (this.#defaultStyles[element.tagName][styleName] !== computedStyle[styleName]) {
          element.style[styleName] = computedStyle[styleName]
        }
      }
    }
    if (element.style.length === 0) {
      element.removeAttribute("style")
    }
  }
}
