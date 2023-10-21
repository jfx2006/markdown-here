/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

"use strict"

/* global  describe, expect, it, before, beforeEach, after, afterEach */
/* global ExternalContent */

describe("ExternalContent", function () {
  it("should exist", function () {
    expect(ExternalContent).to.exist
    expect(ExternalContent.wrapContent).to.exist
    expect(ExternalContent.unwrap).to.exist
    expect(ExternalContent._wrapStyles).to.exist
    expect(ExternalContent._wrapSignature).to.exist
    expect(ExternalContent._wrapQuoted).to.exist
    expect(ExternalContent._wrapForwarded).to.exist
    expect(ExternalContent._wrapBySelector).to.exist
    expect(ExternalContent._wrapAll).to.exist
    expect(ExternalContent._wrap).to.exist
    expect(ExternalContent._makeWrapperElem).to.exist
  })

  let msgDocument
  beforeEach(function () {
    msgDocument = document.implementation.createHTMLDocument()
  })

  describe("makeWrapperElem", function () {
    it("returns an <mdhr-external-content> custom element", function () {
      const wrapper = ExternalContent._makeWrapperElem(msgDocument)

      expect(wrapper).to.have.tagName("mdhr-external-content")
    })
  })

  describe("wrap", function () {
    it("wraps an element with the wrapper", function () {
      // Wrap a <span>
      const wrapped = msgDocument.createElement("span")
      msgDocument.body.appendChild(wrapped)
      ExternalContent._wrap(msgDocument, wrapped)

      const body = msgDocument.querySelector("body")
      expect(body).to.have.length(1)
      expect(body).to.contain("mdhr-external-content")

      const wrapper = body.querySelector("mdhr-external-content")
      expect(wrapper).to.have.length(1)
      expect(wrapper).to.contain("span")
    })
  })

  describe("wrapAll", function () {
    it("wraps multiple element with the wrapper", function () {
      // Wrap some <span>s
      const spans_to_wrap = []
      for (let i = 0; i < 10; i++) {
        const wrapped = msgDocument.createElement("span")
        msgDocument.body.appendChild(wrapped)
        spans_to_wrap.push(wrapped)
      }
      ExternalContent._wrapAll(msgDocument, spans_to_wrap)

      const body = msgDocument.querySelector("body")
      expect(body).to.have.length(1)
      expect(body).to.contain("mdhr-external-content")

      const wrapper = body.querySelector("mdhr-external-content")
      expect(wrapper).to.have.length(10)
      expect(wrapper).to.contain("span")
      expect(wrapper.querySelectorAll("span")).to.have.length(10)
    })
  })

  describe("unwrap", function () {
    it("unwraps a single element", function () {
      const elems = $('<div id="wrapper"><span id="wrapped">Text</span></div>', msgDocument)
      msgDocument.body.appendChild(elems[0])
      ExternalContent.unwrap(elems[0])

      const body = msgDocument.querySelector("body")
      expect(body).to.have.length(1)
      expect(body).to.contain("span")
    })
    it("unwraps multiple elements", function () {
      const elems = $(
        `<div id="wrapper">
<span>Text</span><span>Text2</span><span>Text3</span><span>Text4</span><span>Text5</span>
</div>`,
        msgDocument
      )
      msgDocument.body.appendChild(elems[0])
      ExternalContent.unwrap(elems[0])

      const body = msgDocument.querySelector("body")
      expect(body).to.have.length(5)
      expect(body).to.contain("span")
    })
  })
})
