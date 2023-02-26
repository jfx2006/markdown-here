/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */
/* eslint-disable max-len */

import { markdownRender, resetMarked } from "../markdown-render.js"

/* global describe, expect, it, before, beforeEach, after, afterEach */
/* global _, $, MarkdownRender, htmlToText, Utils, MdhHtmlToText, markdownHere */

describe("markdownHere", function () {
  it("should exist", function () {
    expect(markdownHere).to.exist
  })

  it("platform supports MutationObserver", function () {
    expect(window.MutationObserver).to.be.ok
  })

  describe("markdownHere", async function () {
    var userprefs = {}
    var $testElem = null

    beforeEach(async function () {
      userprefs = {
        "math-value": null,
        "math-enabled": false,
        "main-css": "",
        "syntax-css": "",
      }
      await resetMarked(userprefs)
      $testElem = $('<div contentEditable="true">').appendTo("body")
    })

    afterEach(function () {
      $testElem.remove()
    })

    var markdownRenderHelper = async function (elem, range, callback) {
      var mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(elem, range)
      var renderedMarkdown = await markdownRender(mdhHtmlToText.get())
      renderedMarkdown = mdhHtmlToText.postprocess(renderedMarkdown)
      callback(renderedMarkdown, userprefs["main-css"] + userprefs["syntax-css"])
    }

    var renderMD = async function (mdHTML, renderCompleteCallback) {
      $testElem.html(mdHTML)
      $testElem.focus()
      renderFocusedElem(renderCompleteCallback)
    }

    var renderFocusedElem = async function (renderCompleteCallback) {
      markdownHere(document, markdownRenderHelper, renderCompleteCallback)
    }

    // If there's no error, done has to be called with no argument.
    var doneCaller = function (expectedInnerHtml) {
      expectedInnerHtml = expectedInnerHtml.trim()
      return function (elem) {
        var renderedHTMLRegex =
          /^<div class="markdown-here-wrapper" data-md-url="[^"]+">([\s\S]*)<div title="MDH:[\s\S]+">[\s\S]*<\/div><\/div>$/
        var renderedHTML = elem.innerHTML.match(renderedHTMLRegex)[1]
        renderedHTML = renderedHTML.trim()
        expect(renderedHTML).to.equal(expectedInnerHtml)
      }
    }

    it("should render simple MD", async function () {
      var md = "_hi_"
      var html = "<p><em>hi</em></p>"
      await renderMD(md, doneCaller(html))
    })

    it("should unrender simple MD", async function () {
      var md = "_hi_"

      // First render
      await renderMD(md, function (elem) {
        // Then unrender
        $testElem.focus()
        renderFocusedElem(function (elem) {
          expect(elem.innerHTML).to.equal(md)
        })
      })
    })

    // Tests fix for https://github.com/adam-p/markdown-here/issues/297
    // Attempting to unrender an email that was a reply to an email that was
    // itself MDH-rendered failed.
    it("should unrender a reply to a rendered email", async function () {
      var replyMD = "_bye_"
      var fullReplyMD =
        replyMD +
        '<br><div class="gmail_quote">On Fri, Aug 14, 2015 at 10:34 PM, Billy Bob <span dir="ltr">&lt;<a href="mailto:bb@example.com" target="_blank">bb@example.com</a>&gt;</span> wrote:<br><blockquote><div class="markdown-here-wrapper" data-md-url="xxx"><p><em>hi</em></p>\n<div title="MDH:X2hpXw==" style="height:0;width:0;max-height:0;max-width:0;overflow:hidden;font-size:0em;padding:0;margin:0;">​</div></div></blockquote></div>'
      // First render
      await renderMD(fullReplyMD, function (elem) {
        // Then unrender
        $testElem.focus()
        renderFocusedElem(async function (elem) {
          expect(elem.innerHTML.slice(0, replyMD.length)).to.equal(replyMD)
        })
      })
    })
  })
})
