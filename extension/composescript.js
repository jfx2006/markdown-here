/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

"use strict"

let previewHidden = null

function requestHandler(request, sender, sendResponse) {
  if (request.action === "request-preview") {
    return doRenderPreview()
  } else if (request.action === "md-preview-toggle") {
    previewHidden = request.value
    if (!previewHidden) {
      const scrolled = window.document.scrollingElement
      composeScroll(scrolled).then(() => {})
    }
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

messenger.runtime.sendMessage({ action: "compose-data" }).then((response) => {
  if (response.reply_position === "bottom") {
    let mailBody = window.document.body
    let firstChild = mailBody.firstElementChild
    if (firstChild.nodeName === "DIV" && firstChild.classList.contains("moz-cite-prefix")) {
      let insertElem
      if (response.use_paragraph) {
        insertElem = window.document.createElement("p")
        insertElem.appendChild(window.document.createElement("br"))
      } else {
        insertElem = window.document.createElement("br")
      }
      mailBody.insertAdjacentElement("afterbegin", insertElem)
    }
  }
  return doRenderPreview()
})

async function doRenderPreview() {
  const MdhrMangle = await import(messenger.runtime.getURL("/mdhr-mangle.js"))

  const msgDocument = window.document.cloneNode(true)

  let finalHTML
  try {
    const mdHtmlToText = new MdhrMangle.MdhrMangle(msgDocument)
    const mdText = await mdHtmlToText.preprocess()
    const result_html = await messenger.runtime.sendMessage({
      action: "render-md",
      mdText: mdText,
    })
    finalHTML = mdHtmlToText.postprocess(result_html)
  } catch (reason) {
    console.log(`Error rendering markdown. ${reason}`)
    return
  }
  await sendToPreview(finalHTML)
}

async function sendToPreview(finalHTML, attempts = 1) {
  // Called by doRenderPreview
  try {
    return await messenger.runtime.sendMessage({
      action: "cp.render-preview",
      payload: finalHTML,
    })
  } catch (reason) {
    if (!reason.includes("contentDiv") && attempts > 0) {
      // Not sure about this error. Throw
      throw new Error(reason)
    }
    console.log(`Error sending HTML to preview. ${reason}. Retrying`)
    await sendToPreview(finalHTML, 0)
  }
}

let currentlyScrolling = null

function calculateScrollPercentage(elem) {
  const scrolledAvbSpace = elem.scrollHeight - elem.clientHeight
  const scrolledAmount = elem.scrollTop * (1 + elem.clientHeight / scrolledAvbSpace)
  return scrolledAmount / elem.scrollHeight
}

function debounce(cb, wait = 1000) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => cb(...args), wait)
  }
}

const clearCurrentlyScrolling = debounce(() => {
  currentlyScrolling = null
}, 1000)

async function composeScroll(scrolled) {
  const percentage = calculateScrollPercentage(scrolled)
  if (currentlyScrolling && currentlyScrolling !== scrolled) {
    return
  }
  currentlyScrolling = scrolled
  await messenger.runtime.sendMessage({
    action: "cp.scroll-to",
    payload: { percentage: percentage },
  })
  clearCurrentlyScrolling()
}

window.addEventListener(
  "scroll",
  async function (e) {
    if (previewHidden) {
      return
    }
    const scrolled = e.target.scrollingElement
    await composeScroll(scrolled)
  },
  { capture: true, passive: true },
)

let MsgMutationObserver
async function editorMutationCb(mutationList, observer) {
  if (previewHidden) {
    return
  }
  if (mutationList.type === "attributes" && mutationList.target.nodeName !== "IMG") {
    return
  }
  return await doRenderPreview()
}

;(async () => {
  const mutation_config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  }
  MsgMutationObserver = new MutationObserver(editorMutationCb)
  MsgMutationObserver.observe(window.document.body, mutation_config)
})()
