/*
 * Copyright JFX 2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

/* global describe, expect, it */

import { stripFrontmatter } from "../frontmatter.js"

describe("stripFrontmatter", function () {
  it("should exist", function () {
    expect(stripFrontmatter).to.exist
  })

  it("should strip a well-formed YAML frontmatter block", function () {
    const md = `---
title: Hello World
# a comment
tags:
  - one
  - two
---

# Heading

Body text.
`
    expect(stripFrontmatter(md)).to.equal("\n# Heading\n\nBody text.\n")
  })

  it("should leave a document without frontmatter unchanged", function () {
    const md = "# Heading\n\nSome *markdown* text.\n"
    expect(stripFrontmatter(md)).to.equal(md)
  })

  it("should leave a leading --- with no closing delimiter unchanged", function () {
    const md = "---\ntitle: unterminated\n\nBody text that should survive.\n"
    expect(stripFrontmatter(md)).to.equal(md)
  })

  it("should not touch a --- block appearing later in the body", function () {
    const md = "Intro paragraph\n\n---\nnot: frontmatter\n---\n\nMore text.\n"
    expect(stripFrontmatter(md)).to.equal(md)
  })

  it("should handle Windows line endings", function () {
    const md = "---\r\ntitle: Hello\r\n---\r\n\r\n# Heading\r\n"
    expect(stripFrontmatter(md)).to.equal("\r\n# Heading\r\n")
  })

  it("should handle an empty frontmatter body", function () {
    expect(stripFrontmatter("---\n---\nBody\n")).to.equal("Body\n")
  })

  it("should handle trailing whitespace on the delimiter lines", function () {
    expect(stripFrontmatter("--- \ntitle: x\n---  \nBody\n")).to.equal("Body\n")
  })

  it("should return an empty string unchanged", function () {
    expect(stripFrontmatter("")).to.equal("")
  })

  it("should handle a document that is only a frontmatter block", function () {
    expect(stripFrontmatter("---\ntitle: x\n---\n")).to.equal("")
  })
})
