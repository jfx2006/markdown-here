/*
 * Copyright JFX 2023
 * MIT License
 */
/* global messenger:false module:false Utils:false MdhHtmlToText:false */

import DOMPurify from "../vendor/purify.es.js"
import { getMainCSS, getSyntaxCSS } from "../async_utils.mjs"

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

async function previewFrameLoaded(e) {
  await setMDPreviewStyles()

  const context = await messenger.ex_customui.getContext()
  const win = await messenger.windows.get(context.windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const tabId = win.tabs[0]?.id
  if (tabId) {
    messenger.tabs.sendMessage(tabId, { action: "request-preview" })
  }
}

const p_iframe = document.getElementById("preview_frame")
p_iframe.addEventListener("load", previewFrameLoaded)
p_iframe.src = "preview_iframe.html"

messenger.runtime.onMessage.addListener(async function (request, sender, responseCallback) {
  if (
    typeof sender.tab === "undefined" ||
    typeof sender.tab.id === "undefined" ||
    sender.tab.id < 0
  ) {
    return false
  }
  if (!request.action) {
    return false
  }
  const context = await messenger.ex_customui.getContext()
  if (sender.tab.windowId !== context.windowId) {
    return false
  }
  if (context.windowType !== "messageCompose") {
    return false
  }
  if (request.action === "render-preview") {
    return await renderMDEmail(request.payload)
  }
})
