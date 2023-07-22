/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict"
/*global markdownHere:false, htmlToText:false, Utils:false, MdhHtmlToText:false */

function requestHandler(request, sender, sendResponse) {
  var focusedElem, mdReturn

  if (request && request.action === "toggle-markdown") {
    // Check if the focused element is a valid render target
    focusedElem = markdownHere.findFocusedElem(window.document)
    if (!focusedElem) {
      // Shouldn't happen. But if it does, just silently abort.
      return false
    }

    if (!markdownHere.elementCanBeRendered(focusedElem)) {
      alert(Utils.getMessage("invalid_field"))
      return false
    }

    mdReturn = markdownHere(document, requestMarkdownConversion, markdownRenderComplete)

    if (typeof mdReturn === "string") {
      // Error message was returned.
      alert(mdReturn)
      return false
    }
  } else if (request.action === "check-forgot-render") {
    const renderable = markdownHere.elementCanBeRendered(window.document.body)
    if (renderable) {
      const body_copy = window.document.body.cloneNode(true)
      return Promise.resolve(markdownHere.looksLikeMarkdown(body_copy))
    }
    return Promise.resolve(renderable)
  } else if (request.action === "request-preview") {
    return doRenderPreview()
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

// The rendering service provided to the content script.
// See the comment in markdown-render.js for why we do this.
function requestMarkdownConversion(elem, range, callback) {
  var mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(elem, range)

  // Send a request to the add-on script to actually do the rendering.
  Utils.makeRequestToBGScript("render", { mdText: mdhHtmlToText.get() }).then((response) => {
    const renderedMarkdown = mdhHtmlToText.postprocess(response.html)
    callback(renderedMarkdown, response.main_css, response.syntax_css)
  })
}

// When rendering (or unrendering) completed, do our interval checks.
function markdownRenderComplete(elem, rendered) {
  return true
}

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
