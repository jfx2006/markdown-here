/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict"
/*global MdhHtmlToText:false */

function requestHandler(request, sender, sendResponse) {
  if (request.action === "request-preview") {
    return doRenderPreview()
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

messenger.runtime.sendMessage({ action: "compose-ready" }).then((response) => {
  if (response) {
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
  }
  doRenderPreview()
})

async function doRenderPreview() {
  try {
    const mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(window.document.body)
    const result_html = await messenger.runtime.sendMessage({
      action: "render-md",
      mdText: mdhHtmlToText.get(),
    })
    const renderedMarkdown = mdhHtmlToText.postprocess(result_html)
    return await messenger.runtime.sendMessage({
      action: "cp.render-preview",
      payload: renderedMarkdown,
    })
  } catch (reason) {
    console.log(`Error rendering preview. ${reason}`)
  }
}

let MsgMutationObserver
async function editorMutationCb(mutationList, observer) {
  return await doRenderPreview()
}

;(async () => {
  const mutation_config = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: true,
  }
  MsgMutationObserver = new MutationObserver(editorMutationCb)
  MsgMutationObserver.observe(window.document.body, mutation_config)
})()
