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

  if (request && (request.action === 'toggle-markdown')) {

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

    var logger = function() { console.log.apply(console, arguments) }

    mdReturn = markdownHere(
                document,
                requestMarkdownConversion,
                logger,
                markdownRenderComplete)

    if (typeof(mdReturn) === 'string') {
      // Error message was returned.
      alert(mdReturn)
      return false
    }
  }
  else if (request.action === "check-forgot-render") {
    function looksLikeMarkdown() {
      // Make a copy of the email to work with
      let body_copy = window.document.body.cloneNode(true)
      // Selectors to find quoted content and signatures
      // Only look for elements directly below <body> to avoid problems with
      // nested quotes
      for (let selector of [
        "body > .moz-signature",
        "body > blockquote[type=cite]",
        "body > div.moz-cite-prefix"
      ]) {
        let match_nodes = body_copy.querySelectorAll(selector)
        for (let node of match_nodes) {
          node.remove()
        }
      }
      let mdMaybe = new MdhHtmlToText.MdhHtmlToText(body_copy, null, true).get()
      return Utils.probablyWritingMarkdown(mdMaybe)
    }
    const renderable = markdownHere.elementCanBeRendered(window.document.body)
    if (renderable) {
      return Promise.resolve(looksLikeMarkdown())
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
    { action: 'render', mdText: mdhHtmlToText.get() },
    function(response) {
      var renderedMarkdown = mdhHtmlToText.postprocess(response.html)
      callback(renderedMarkdown, response.css)
    })
}


// When rendering (or unrendering) completed, do our interval checks.
function markdownRenderComplete(elem, rendered) {
  return true
}

messenger.runtime.sendMessage({action: "compose-ready"})
  .then(response => {
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
