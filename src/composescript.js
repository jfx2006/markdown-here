/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict"
/*global messenger:false, markdownHere:false, htmlToText:false,
    Utils:false, MdhHtmlToText:false */

// Handle the menu-item click
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
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

// The rendering service provided to the content script.
// See the comment in markdown-render.js for why we do this.
function requestMarkdownConversion(elem, range, callback) {
  var mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(elem, range)

  // Send a request to the add-on script to actually do the rendering.
  Utils.makeRequestToPrivilegedScript(
    document,
    { action: "render", mdText: mdhHtmlToText.get() },
    function (response) {
      var renderedMarkdown = mdhHtmlToText.postprocess(response.html)
      const md_css = response.main_css + response.syntax_css
      callback(renderedMarkdown, md_css)
    }
  )
}

// When rendering (or unrendering) completed, do our interval checks.
function markdownRenderComplete(elem, rendered) {
  return true
}

messenger.runtime.sendMessage({ action: "compose-ready" }).then((response) => {
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
})
