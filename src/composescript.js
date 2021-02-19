/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict";
/*global messenger:false, markdownHere:false, CommonLogic:false, htmlToText:false,
    Utils:false, MdhHtmlToText:false, marked:false*/

// Handle the menu-item click
function requestHandler(request, sender, sendResponse) {
  var focusedElem, mdReturn;

  if (request && (request.action === 'context-click' ||
                  request.action === 'hotkey' ||
                  request.action === 'button-click')) {

    // Check if the focused element is a valid render target
    focusedElem = markdownHere.findFocusedElem(window.document);
    if (!focusedElem) {
      // Shouldn't happen. But if it does, just silently abort.
      return false;
    }

    if (!markdownHere.elementCanBeRendered(focusedElem)) {
      alert(Utils.getMessage('invalid_field'));
      return false;
    }

    var logger = function() { console.log.apply(console, arguments); };

    mdReturn = markdownHere(
                document,
                requestMarkdownConversion,
                logger,
                markdownRenderComplete);

    if (typeof(mdReturn) === 'string') {
      // Error message was returned.
      alert(mdReturn);
      return false;
    }
  }
  else if (request.action === "check-forgot-render") {
    function looksLikeMarkdown() {
      let mdMaybe = new MdhHtmlToText.MdhHtmlToText(window.document.body, null, true).get();
      return CommonLogic.probablyWritingMarkdown(mdMaybe);
    }
    const renderable = markdownHere.elementCanBeRendered(window.document.body);
    if (renderable) {
      return Promise.resolve(looksLikeMarkdown());
    }
    return Promise.resolve(renderable);
  }
}
messenger.runtime.onMessage.addListener(requestHandler);


// The rendering service provided to the content script.
// See the comment in markdown-render.js for why we do this.
function requestMarkdownConversion(elem, range, callback) {
  var mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(elem, range);

  // Send a request to the add-on script to actually do the rendering.
  Utils.makeRequestToPrivilegedScript(
    document,
    { action: 'render', mdText: mdhHtmlToText.get() },
    function(response) {
      var renderedMarkdown = mdhHtmlToText.postprocess(response.html);
      callback(renderedMarkdown, response.css);
    });
}


// When rendering (or unrendering) completed, do our interval checks.
function markdownRenderComplete(elem, rendered) {
  return true;
}
