/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import DOMPurify from "../vendor/purify.es.js"
import { getMainCSS, getSyntaxCSS } from "../async_utils.mjs"
import OptionsStore from "../options/options-storage.js"
import { CSSInliner } from "./css-inliner.js"

const STYLE_ELEM_IDS = ["syntax_css", "main_css"]

let cssInliner

function escapeHTML(strings, html) {
  return `${DOMPurify.sanitize(html)}`
}

async function addStyleSheet(id, css) {
  const style_elem = p_iframe.contentDocument.createElement("style")
  style_elem.id = id
  style_elem.replaceChildren(p_iframe.contentDocument.createTextNode(css))
  p_iframe.contentDocument.head.appendChild(style_elem)
}

async function addMDPreviewStyles() {
  await Promise.all([getMainCSS(), getSyntaxCSS()]).then(async ([main_css, syntax_css]) => {
    await addStyleSheet("syntax_css", syntax_css)
    await addStyleSheet("main_css", main_css)
  })
}

function enableMDPreviewStyles() {
  for (const styleId of STYLE_ELEM_IDS) {
    const elem = p_iframe.contentDocument.getElementById(styleId)
    if (elem) {
      elem.disabled = false
    }
  }
}

function disableMDPreviewStyles() {
  for (const styleId of STYLE_ELEM_IDS) {
    const elem = p_iframe.contentDocument.getElementById(styleId)
    if (elem) {
      elem.disabled = true
    }
  }
}

function makeStylesExplicit() {
  function filterExcluded(elem) {
    if (elem.classList.contains("markdown-here-exclude")) {
      return NodeFilter.FILTER_REJECT
    }
    return NodeFilter.FILTER_ACCEPT
  }
  const treeWalker = p_iframe.contentDocument.createTreeWalker(
    p_iframe.contentDocument.body,
    NodeFilter.SHOW_ELEMENT,
    filterExcluded
  )
  while (treeWalker.nextNode()) {
    cssInliner.inlineStylesForSingleElement(treeWalker.currentNode)
  }
}

async function renderMDEmail(unsanitized_html) {
  enableMDPreviewStyles()
  p_iframe.contentDocument.body.innerHTML = escapeHTML`${unsanitized_html}`
  makeStylesExplicit()
  disableMDPreviewStyles()
  return true
}

async function togglePreview() {
  const context = await messenger.ex_customui.getContext()
  await messenger.ex_customui.setLocalOptions({ hidden: !context.hidden })
  return context.hidden
}

async function getMsgContent() {
  const preview = await requestPreview()
  if (!preview) {
    throw new Error("Unable to render email!")
  }
  const serializer = new XMLSerializer()
  return serializer.serializeToString(preview)
}

const onContextChange = async function (context) {
  try {
    await OptionsStore.set({ "preview-hidden": context.hidden, "preview-width": context.width })
    // ... in real code, you would do something with the contact here...
  } catch (e) {
    console.log(e)
  }
}

messenger.ex_customui.onEvent.addListener(async (type, details) => {
  switch (type) {
    case "context":
      // This event fires if the context is changed dynamically: for example,
      // the user might alter the address book to create a new contact in
      await onContextChange(details)
      return
  }
})

async function requestPreview() {
  const context = await messenger.ex_customui.getContext()
  const win = await messenger.windows.get(context.windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const tabId = win.tabs[0]?.id
  if (tabId) {
    return await messenger.tabs.sendMessage(tabId, { action: "request-preview" })
  }
}

async function previewFrameLoaded(e) {
  cssInliner = new CSSInliner(p_iframe.contentDocument)
  await addMDPreviewStyles()

  const savedState = await OptionsStore.get(["preview-width", "preview-hidden"])

  await messenger.ex_customui.setLocalOptions({
    hidden: savedState.hidden,
    width: savedState.width,
  })
}

const p_iframe = document.getElementById("preview_frame")
p_iframe.addEventListener("load", await previewFrameLoaded)
p_iframe.src = "preview_iframe.html"

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
      default:
        console.log(`Compose Preview: invalid action: ${request.action}`)
    }
  })
})
