/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

"use strict"
/*global MdhHtmlToText:false ExternalContent:false */

function requestHandler(request, sender, sendResponse) {
  if (request.action === "request-preview") {
    return doRenderPreview()
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

let message_type

messenger.runtime.sendMessage({ action: "compose-ready" }).then((response) => {
  if (response) {
    message_type = response.message_type
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
  const msgDocument = window.document.cloneNode(true)
  ExternalContent.wrapContent(msgDocument, "reply") // msgDocument is modified in-place

  try {
    const mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(msgDocument.body)
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
