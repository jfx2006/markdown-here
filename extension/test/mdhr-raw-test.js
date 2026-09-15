/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

/* global describe, expect, it */

import { stripOldMdhrRaw } from "../compose_preview/mdhr-raw.js"

describe("stripOldMdhrRaw", function () {
  const parser = new DOMParser()

  it("should exist", function () {
    expect(stripOldMdhrRaw).to.exist
  })

  it("should do nothing when there is no mdhr-raw element", function () {
    const doc = parser.parseFromString("<!DOCTYPE html><html><body>Hello</body></html>", "text/html")
    stripOldMdhrRaw(doc)
    expect(doc.body.innerHTML).to.equal("Hello")
  })

  it("should remove a top-level mdhr-raw element", function () {
    const doc = parser.parseFromString(
      '<!DOCTYPE html><html><body>Hello<div class="mdhr-raw" title="MDH:aaaa"></div></body></html>',
      "text/html",
    )
    stripOldMdhrRaw(doc)
    expect(doc.querySelector("div.mdhr-raw")).to.be.null
    expect(doc.body.textContent).to.equal("Hello")
  })

  // Regression test for #82: replying to a message keeps quoting the
  // previous mdhr-raw dump inside the blockquote. Without stripping it
  // before re-embedding a fresh dump, each reply's payload recursively
  // encodes every prior one, growing roughly quadratically with the number
  // of replies in a thread.
  it("should remove mdhr-raw elements nested in quoted reply history", function () {
    const doc = parser.parseFromString(
      `<!DOCTYPE html><html><body>
        New reply text
        <blockquote type="cite">
          Previous message
          <div class="mdhr-raw" title="MDH:oldpayload"></div>
        </blockquote>
      </body></html>`,
      "text/html",
    )
    stripOldMdhrRaw(doc)
    expect(doc.querySelectorAll("div.mdhr-raw")).to.have.lengthOf(0)
    expect(doc.querySelector("blockquote")).to.not.be.null
    expect(doc.body.textContent).to.contain("Previous message")
  })

  it("should remove multiple nested mdhr-raw elements accumulated across several replies", function () {
    const doc = parser.parseFromString(
      `<!DOCTYPE html><html><body>
        Latest reply
        <blockquote type="cite">
          Reply 2
          <div class="mdhr-raw" title="MDH:payload2"></div>
          <blockquote type="cite">
            Reply 1
            <div class="mdhr-raw" title="MDH:payload1"></div>
          </blockquote>
        </blockquote>
      </body></html>`,
      "text/html",
    )
    stripOldMdhrRaw(doc)
    expect(doc.querySelectorAll("div.mdhr-raw")).to.have.lengthOf(0)
  })

  it("should return the same document it was given", function () {
    const doc = parser.parseFromString("<!DOCTYPE html><html><body>Hello</body></html>", "text/html")
    expect(stripOldMdhrRaw(doc)).to.equal(doc)
  })
})
