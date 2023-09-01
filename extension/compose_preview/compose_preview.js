/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import DOMPurify from "../vendor/purify.es.js"
import { getMainCSS, getSyntaxCSS } from "../async_utils.mjs"
import OptionsStore from "../options/options-storage.js"

function escapeHTML(strings, html) {
  return `${DOMPurify.sanitize(html)}`
}

async function addStyleSheet(id, css) {
  const style_elem = p_iframe.contentDocument.createElement("style")
  style_elem.id = id
  style_elem.replaceChildren(p_iframe.contentDocument.createTextNode(css))
  p_iframe.contentDocument.head.appendChild(style_elem)
}

async function setMDPreviewStyles() {
  return Promise.all([getMainCSS(), getSyntaxCSS()]).then(async ([main_css, syntax_css]) => {
    await addStyleSheet("main_css", main_css)
    await addStyleSheet("syntax_css", syntax_css)
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

function dropUnusedCSS(html) {
  const NO_MD_SELECTOR = ":not(.markdown-here-exclude,  .markdown-here-exclude *)"
  const STYLE_ELEM_IDS = ["syntax_css", "main_css"]
  let final_css = []
  for (const stylesheet of html.styleSheets) {
    if (STYLE_ELEM_IDS.includes(stylesheet.ownerNode.id)) {
      for (let i = stylesheet.cssRules.length - 1; i >= 0; i--) {
        const origRule = stylesheet.cssRules[i]
        if (origRule.constructor.name === "CSSStyleRule") {
          // CSSStyleRule
          const rule = `:where(${origRule.selectorText}${NO_MD_SELECTOR}`
          const selectorMatches = Array.from(html.body.querySelectorAll(rule))
          if (selectorMatches.length > 0) {
            final_css.push(origRule.cssText)
          }
        }
      }
    }
  }
  for (const removeElemId of STYLE_ELEM_IDS) {
    html.getElementById(removeElemId).remove()
  }
  return final_css.join("\n")
}

async function getMsgContent() {
  const preview = await requestPreview()
  if (!preview) {
    throw new Error("Unable to render email!")
  }
  const html_msg = p_iframe.contentDocument.cloneNode(true)
  const emailCSS = dropUnusedCSS(html_msg)
  const emailCssElem = html_msg.createElement("style")
  emailCssElem.replaceChildren(html_msg.createTextNode(emailCSS))
  html_msg.head.appendChild(emailCssElem)

  const serializer = new XMLSerializer()
  return serializer.serializeToString(html_msg)
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
  await setMDPreviewStyles()

  const savedState = await OptionsStore.get(["preview-width", "preview-hidden"])

  await messenger.ex_customui.setLocalOptions({
    hidden: savedState.hidden,
    width: savedState.width,
  })
}

const p_iframe = document.getElementById("preview_frame")
p_iframe.addEventListener("load", previewFrameLoaded)
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
