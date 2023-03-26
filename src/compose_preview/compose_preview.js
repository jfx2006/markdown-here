/*
 * Copyright JFX 2023
 * MIT License
 */
/* global messenger:false module:false Utils:false MdhHtmlToText:false */

import DOMPurify from "../vendor/purify.es.js"
import { getMainCSS, getSyntaxCSS } from "../async_utils.mjs"
import OptionsStore from "../options/options-storage.js"

function escapeHTML(strings, html) {
  return `${DOMPurify.sanitize(html)}`
}

async function setMDPreviewStyles() {
  return Promise.all([getMainCSS(), getSyntaxCSS()]).then(([main_css, syntax_css]) => {
    let style_elem = p_iframe.contentDocument.getElementById("main_css")
    style_elem.replaceChildren(p_iframe.contentDocument.createTextNode(main_css))

    style_elem = p_iframe.contentDocument.getElementById("syntax_css")
    style_elem.replaceChildren(p_iframe.contentDocument.createTextNode(syntax_css))
  })
}

async function renderMDEmail(unsanitized_html) {
  p_iframe.contentDocument.body.innerHTML = escapeHTML`${unsanitized_html}`
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
  return serializer.serializeToString(p_iframe.contentDocument)
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

async function requestPreview(callback) {
  let rv = false
  const context = await messenger.ex_customui.getContext()
  const win = await messenger.windows.get(context.windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const tabId = win.tabs[0]?.id
  if (tabId) {
    rv = await messenger.tabs.sendMessage(tabId, { action: "request-preview" })
  }
  return rv
}

async function previewFrameLoaded(e) {
  await setMDPreviewStyles()

  const savedState = await OptionsStore.get(["preview-width", "preview-hidden"])

  await messenger.ex_customui.setLocalOptions({
    hidden: savedState.hidden,
    width: savedState.width,
  })
  await requestPreview()
}

const p_iframe = document.getElementById("preview_frame")
p_iframe.addEventListener("load", previewFrameLoaded)
p_iframe.src = "preview_iframe.html"

messenger.runtime.onMessage.addListener(async function (request, sender, responseCallback) {
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
  const context = await messenger.ex_customui.getContext()
  if (context.windowType !== "messageCompose") {
    return false
  }
  switch (request.action) {
    case "cp.render-preview":
      if (sender.tab.windowId !== context.windowId) {
        return false
      }
      return await renderMDEmail(request.payload)
    case "cp.toggle-preview":
      if (request.windowId !== context.windowId) {
        return false
      }
      return await togglePreview()
    case "cp.get-content":
      if (request.windowId !== context.windowId) {
        return false
      }
      return await getMsgContent()
    default:
      console.log(`Compose Preview: invalid action: ${request.action}`)
  }
})
