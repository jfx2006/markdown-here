/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict"
/*global htmlToText:false, MdhHtmlToText:false */

import("./async_utils.mjs").then((asyncUtils) => {
  function requestHandler(request, sender, sendResponse) {
    let focusedElem, mdReturn

    if (request.action === "check-forgot-render") {
      const renderable = elementCanBeRendered(window.document.body)
      if (renderable) {
        const body_copy = window.document.body.cloneNode(true)
        return Promise.resolve(looksLikeMarkdown(body_copy))
      }
      return Promise.resolve(renderable)
    } else if (request.action === "request-preview") {
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

  function elementCanBeRendered(elem) {
    // See here for more info about what we're checking:
    // http://stackoverflow.com/a/3333679/729729
    return (
      elem.contentEditable === true ||
      elem.contentEditable === "true" ||
      elem.contenteditable === true ||
      elem.contenteditable === "true" ||
      (elem.ownerDocument && elem.ownerDocument.designMode === "on")
    )
  }

  function looksLikeMarkdown(body_copy) {
    // Selectors to find quoted content and signatures
    // Only look for elements directly below <body> to avoid problems with
    // nested quotes
    for (let selector of [
      "body > div.moz-signature",
      "body > blockquote[type=cite]",
      "body > div.moz-cite-prefix",
      "body > div.moz-forward-container",
    ]) {
      let match_nodes = body_copy.querySelectorAll(selector)
      for (let node of match_nodes) {
        node.remove()
      }
    }
    let mdMaybe = new MdhHtmlToText.MdhHtmlToText(body_copy, null, true).get()
    return asyncUtils.probablyWritingMarkdown(mdMaybe)
  }

  async function doRenderPreview() {
    try {
      const mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(window.document.body)
      const result_html = await messenger.runtime.sendMessage({
        action: "render-md",
        mdText: mdhHtmlToText.get(),
      })
      const renderedMarkdown = mdhHtmlToText.postprocess(result_html)
      const rv = await messenger.runtime.sendMessage({
        action: "cp.render-preview",
        payload: renderedMarkdown,
      })
      return rv
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
})
