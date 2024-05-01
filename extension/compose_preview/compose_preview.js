/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import DOMPurify from "../vendor/purify.es.js"
import { getMainCSS, getSyntaxCSS, debounce, toInt, fetchExtFile } from "../async_utils.mjs"
import OptionsStore from "../options/options-storage.js"
import { CSSInliner } from "./css-inliner.js"

const STYLE_ELEM_IDS = ["MDHR_syntax_css", "MDHR_main_css"]
const REMOVE_ELEM_IDS = STYLE_ELEM_IDS.concat(["MDHR_CSP", "MDHR_tb_style", "MDHR_preview_style"])

let cssInliner

function escapeHTML(strings, html) {
  return `${DOMPurify.sanitize(html)}`
}

function removeMDPreviewStyles(html_msg) {
  makeStylesExplicit(html_msg)
  for (const styleId of REMOVE_ELEM_IDS) {
    const elem = html_msg.getElementById(styleId)
    if (elem) {
      elem.remove()
    }
  }
}

function makeStylesExplicit(html_msg) {
  function filterExcluded(elem) {
    if (elem.classList.contains("markdown-here-exclude")) {
      return NodeFilter.FILTER_REJECT
    }
    return NodeFilter.FILTER_ACCEPT
  }
  const treeWalker = html_msg.createTreeWalker(
    html_msg.body,
    NodeFilter.SHOW_ELEMENT,
    filterExcluded,
  )
  if (!cssInliner) {
    cssInliner = new CSSInliner()
  }
  while (treeWalker.nextNode()) {
    cssInliner.inlineStylesForSingleElement(treeWalker.currentNode)
  }
}

function wrapExternal(doc) {
  const elements = doc.querySelectorAll(
    "body > blockquote[type='cite'], body > div.moz-forward-container",
  )
  let i = 0
  for (const element of elements) {
    const wrapper = doc.createElement("div")
    wrapper.classList.add("external-content")
    wrapper.id = `extcontent-${i}`
    i++
    const shadow = wrapper.attachShadow({ mode: "open" })
    shadow.replaceChildren(...element.childNodes)
    element.insertAdjacentElement("afterbegin", wrapper)
  }
  return doc
}

function deShadowRoot(doc) {
  const elements = doc.querySelectorAll("div.external-content")
  for (const element of elements) {
    if (!element.shadowRoot) {
      continue
    }
    element.replaceChildren(...element.shadowRoot.childNodes)
  }
}

async function renderMDEmail(unsanitized_html) {
  /* cp.render-preview */
  let doc = addDoctype(unsanitized_html)
  doc = parseHTMLFromString(escapeHTML`${doc}`)
  doc = wrapExternal(doc)
  if (!contentDiv) {
    contentDiv = p_iframe.contentDocument.body.querySelector("body > div.markdown-here-wrapper")
  }
  contentDiv.replaceChildren(...doc.body.childNodes)
  return true
}

async function sendPreviewStateToCompose(tabId, value) {
  if (tabId) {
    return await messenger.tabs.sendMessage(tabId, {
      action: "md-preview-toggle",
      value: value,
    })
  }
}

async function togglePreview() {
  const context = await messenger.ex_customui.getContext()
  const win = await messenger.windows.get(context.windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const tabId = win.tabs[0]?.id
  const changedHidden = !context.hidden
  await messenger.ex_customui.setLocalOptions({ hidden: changedHidden })
  await sendPreviewStateToCompose(tabId, changedHidden)
  if (changedHidden) {
    return "inactive"
  }
  return "rendered"
}

async function toggleClassicPreview() {
  const context = await messenger.ex_customui.getContext()
  const changedHidden = !context.hidden
  await messenger.ex_customui.setLocalOptions({ hidden: changedHidden })
  if (changedHidden) {
    return "inactive"
  }
  return "rendered"
}

async function setClassicMode() {
  await messenger.ex_customui.setLocalOptions({ mode: "classic", hidden: true })
  await messenger.runtime.sendMessage({ action: "set-composeaction-bw" })
}

async function setModernMode() {
  const savedState = await OptionsStore.get(["preview-width", "enable-markdown-mode"])
  const preview_width = toInt(savedState["preview-width"])
  const hidden = !savedState["enable-markdown-mode"]
  await messenger.ex_customui.setLocalOptions({
    mode: "modern",
    width: preview_width,
    hidden: hidden,
  })
  if (!hidden) {
    await messenger.runtime.sendMessage({ action: "set-composeaction-purple" })
  } else {
    await messenger.runtime.sendMessage({ action: "set-composeaction-bw" })
  }
}

async function getMsgContent() {
  const html_msg = p_iframe.contentDocument
  removeMDPreviewStyles(html_msg)
  deShadowRoot(html_msg)
  const serializer = new XMLSerializer()
  return serializer.serializeToString(html_msg)
}

const onContextChange = async function (context) {
  const mdhr_mode = (await OptionsStore.get("mdhr-mode"))["mdhr-mode"]
  const data = { "enable-markdown-mode": !context.hidden }
  if (mdhr_mode === "modern") {
    let preview_width = context.width
    if (Boolean(context.width) && context.width < 30) {
      preview_width = 300
    }
    data["preview-width"] = preview_width
  } else {
    // eslint-disable-next-line no-extra-boolean-cast
    if (Boolean(data["preview-width"])) {
      delete data["preview-width"]
    }
  }
  try {
    await OptionsStore.set(data)
  } catch (e) {
    console.log(e)
  }
}

messenger.ex_customui.onEvent.addListener(async (type, details) => {
  switch (type) {
    case "context":
      await onContextChange(details)
      return
  }
})

async function previewFrameLoaded(e) {
  // await addMDPreviewStyles()
  p_iframe.contentWindow.onclick = function (e) {
    e.preventDefault()
  }
  contentDiv = p_iframe.contentDocument.body.querySelector("body > div.markdown-here-wrapper")
  const mdhr_mode = (await OptionsStore.get("mdhr-mode"))["mdhr-mode"]
  if (mdhr_mode === "modern") {
    await setModernMode()
  } else {
    await setClassicMode()
  }
  const context = await messenger.ex_customui.getContext()
  if (context.windowId) {
    const win = await messenger.windows.get(context.windowId, {
      populate: true,
      windowTypes: ["messageCompose"],
    })
    const tabId = win.tabs[0]?.id
    const hidden = !(await OptionsStore.get("enable-markdown-mode"))["enable-markdown-mode"]
    await sendPreviewStateToCompose(tabId, hidden)
  }

  window.addEventListener(
    "resize",
    debounce(function (event) {
      const preview_width = p_iframe.parentElement.clientWidth
      if (preview_width > 0) {
        OptionsStore.set({ "preview-width": preview_width })
      }
    }, 500),
  )
}

async function scrollTo(payload) {
  const target = p_iframe.contentDocument.scrollingElement
  const targetAvbSpace = target.scrollHeight - target.clientHeight
  const scrollTop = payload.percentage * targetAvbSpace

  return target.scrollTo({ top: scrollTop, behavior: "smooth" })
}

function addDoctype(html_string) {
  // Eliminate quirks mode warnings
  return `<!doctype html>\n${html_string}\n`
}

function parseHTMLFromString(string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(string, "text/html")
  return doc
}

let contentDiv
const p_iframe = document.getElementById("preview_frame")

async function loadIFrame() {
  const main_css = await getMainCSS()
  const syntax_css = await getSyntaxCSS()
  const html = await fetchExtFile("/compose_preview/preview_iframe.html")
  const srcdoc = html.replace("@SYNTAX_CSS@", syntax_css).replace("@MAIN_CSS@", main_css)
  const doc = parseHTMLFromString(srcdoc)
  p_iframe.srcdoc = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`
}

loadIFrame()
  .then(async () => {
    await previewFrameLoaded()
  })
  .then(async () => {
    cssInliner = new CSSInliner()
  })

messenger.runtime.onMessage.addListener(function (request, sender, responseCallback) {
  if (
    (typeof sender.tab === "undefined" ||
      typeof sender.tab.id === "undefined" ||
      sender.tab.id < 0) &&
    request.windowId === undefined
  ) {
    return false
  }
  if (!request.action) {
    return false
  }
  if (!request.action.startsWith("cp.")) {
    return false
  }
  return messenger.ex_customui.getContext().then((context) => {
    if (context.windowType !== "messageCompose") {
      return false
    }
    switch (request.action) {
      case "cp.render-preview":
        if (sender.tab.windowId !== context.windowId) {
          return false
        }
        return renderMDEmail(request.payload)
      case "cp.toggle-preview":
        if (request.windowId !== context.windowId) {
          return false
        }
        return togglePreview()
      case "cp.get-content":
        if (request.windowId !== context.windowId) {
          return false
        }
        return getMsgContent()
      case "cp.scroll-to":
        if (sender.tab.windowId !== context.windowId) {
          return false
        }
        return scrollTo(request.payload)
      case "cp.toggle-classic-preview":
        if (request.windowId !== context.windowId) {
          return false
        }
        return toggleClassicPreview()
      case "cp.set-classic-mode":
        if (request.windowId !== context.windowId) {
          return false
        }
        return setClassicMode()
      case "cp.set-modern-mode":
        if (request.windowId !== context.windowId) {
          return false
        }
        return setModernMode()
      default:
        console.log(`Compose Preview: invalid action: ${request.action}`)
    }
  })
})
