/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

"use strict"
/*global MdhHtmlToText:false  Utils:false */

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

function replaceRange(range, html) {
  range.deleteContents()

  // Create a DocumentFragment to insert and populate it with HTML
  const documentFragment = range.createContextualFragment(html)
  range.insertNode(documentFragment)

  // In some clients (and maybe some versions of those clients), on some pages,
  // the newly inserted rendered Markdown will be selected. It looks better and
  // is slightly less annoying if the text is not selected, and consistency
  // across platforms is good. So we're going to collapse the selection.
  // Note that specifying the `toStart` argument to `true` seems to be necessary
  // in order to actually get a cursor in the editor.
  // Fixes #427: https://github.com/adam-p/markdown-here/issues/427
  range.collapse(true)

  return range.commonAncestorContainer
}

async function doRenderPreview() {
  const msgDocument = window.document.cloneNode(true)
  const range = msgDocument.createRange()
  range.selectNodeContents(msgDocument.body)
  const signature = msgDocument.querySelector("body > .moz-signature")
  if (signature) {
    range.setEndBefore(signature)
  }

  try {
    const mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(msgDocument.body, range)
    const result_html = await messenger.runtime.sendMessage({
      action: "render-md",
      mdText: mdhHtmlToText.get(),
    })
    const renderedMarkdown = mdhHtmlToText.postprocess(result_html)
    const finalHTML = replaceRange(range, renderedMarkdown).outerHTML

    return await messenger.runtime.sendMessage({
      action: "cp.render-preview",
      payload: finalHTML,
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
