/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

function computeDefaultStyleByTagName(msgDocument, tagName) {
  const defaultElemStyle = {}
  const element = msgDocument.createElement(tagName)

  const computedStyleAttached = getComputedStyle(msgDocument.body.appendChild(element))
  const display = computedStyleAttached.getPropertyValue("display")
  element.style.display = "none"
  for (let i = 0; i < computedStyleAttached.length; i++) {
    defaultElemStyle[computedStyleAttached[i]] = computedStyleAttached[computedStyleAttached[i]]
  }

  defaultElemStyle["display"] = display

  msgDocument.body.removeChild(element)
  return defaultElemStyle
}

const precomputeTags = [
  "A",
  "ABBR",
  "ADDRESS",
  "AREA",
  "ARTICLE",
  "ASIDE",
  "AUDIO",
  "B",
  "BASE",
  "BDI",
  "BDO",
  "BLOCKQUOTE",
  "BODY",
  "BR",
  "BUTTON",
  "CANVAS",
  "CAPTION",
  "CENTER",
  "CITE",
  "CODE",
  "COL",
  "COLGROUP",
  "COMMAND",
  "DATALIST",
  "DD",
  "DEL",
  "DETAILS",
  "DFN",
  "DIV",
  "DL",
  "DT",
  "EM",
  "EMBED",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FONT",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEAD",
  "HEADER",
  "HGROUP",
  "HR",
  "HTML",
  "I",
  "IFRAME",
  "IMG",
  "INPUT",
  "INS",
  "KBD",
  "KEYGEN",
  "LABEL",
  "LEGEND",
  "LI",
  "LINK",
  "MAP",
  "MARK",
  "MATH",
  "MENU",
  "META",
  "METER",
  "NAV",
  "NOBR",
  "NOSCRIPT",
  "OBJECT",
  "OL",
  "OPTION",
  "OPTGROUP",
  "OUTPUT",
  "P",
  "PARAM",
  "PRE",
  "PROGRESS",
  "Q",
  "RP",
  "RT",
  "RUBY",
  "S",
  "SAMP",
  "SCRIPT",
  "SECTION",
  "SELECT",
  "SMALL",
  "SOURCE",
  "SPAN",
  "STRONG",
  "STYLE",
  "SUB",
  "SUMMARY",
  "SUP",
  "SVG",
  "TABLE",
  "TBODY",
  "TD",
  "TEXTAREA",
  "TFOOT",
  "TH",
  "THEAD",
  "TIME",
  "TITLE",
  "TR",
  "TRACK",
  "U",
  "UL",
  "VAR",
  "VIDEO",
  "WBR",
]

function computeDefaults(msgDocument) {
  const defaults = {}
  if (msgDocument.body === null) {
    throw "msgDocument.body must exist before creating CSSInliner"
  }
  for (let i = 0; i < precomputeTags.length; i++) {
    defaults[precomputeTags[i]] = computeDefaultStyleByTagName(msgDocument, precomputeTags[i])
  }
  return defaults
}

export class CSSInliner {
  #defaultStyles
  #msgDocument
  constructor(msgDocument) {
    this.#defaultStyles = computeDefaults(msgDocument)
    this.#msgDocument = msgDocument
  }
  // inlineStylesForSingleElement(element, target): inlines the styles for a
  // single element, but not it's children
  //
  // Params:
  // element: The element that computed styles inlined
  inlineStylesForSingleElement(element) {
    const computedStyle = getComputedStyle(element)
    const display = computedStyle.getPropertyValue("display")
    const returnDisplay = element.style.display
    element.style.display = "none"
    if (this.#defaultStyles[element.tagName] == null) {
      this.#defaultStyles[element.tagName] = computeDefaultStyleByTagName(
        this.#msgDocument,
        element.tagName
      )
    }
    for (let i = 0; i < computedStyle.length; i++) {
      const styleName = computedStyle[i]

      // exclude default styles
      if (this.#defaultStyles[element.tagName][styleName] !== computedStyle[styleName]) {
        element.style[styleName] = computedStyle[styleName]
      }

      if (styleName === "display" && this.#defaultStyles[element.tagName]["display"] !== display) {
        element.style["display"] = display
      } else if (styleName === "display") {
        element.style["display"] = ""
      }
    }

    if (element.style.length === 0) {
      element.removeAttribute("style")
    }

    element.style.display = returnDisplay
  }
}
