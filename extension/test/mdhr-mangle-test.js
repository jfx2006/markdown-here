/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

/* global describe, expect, it, before, beforeEach, after, afterEach */

import { MdhrMangle } from "../mdhr-mangle.js"

describe("MdhrMangle", function () {
  it("should exist", function () {
    expect(MdhrMangle).to.exist
  })

  const parser = new DOMParser()
  const replyMsg = parser.parseFromString(
    `<!DOCTYPE html>
<html>
<body>Hello World!<br><br>
    <div class="moz-cite-prefix">On 11/5/23 13:20, You wrote:<br></div>
    <blockquote type="cite" cite="jibberish">
        <pre class="moz-quote-pre" wrap="">Some stuff</pre>
    </blockquote><br>
    <div class="moz-signature">-- <br>
        My sig<br>**with markdown**<br>
    </div>
</body></html>`,
    "text/html",
  )
  const fwdMsg = parser.parseFromString(
    `<!DOCTYPE html>
<html>
<body>Hello World!<br><br>
    <div class="moz-forward-container"><br>-------- Forwarded Message --------<table class="moz-email-headers-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
                <tr>
                    <th valign="BASELINE" nowrap="nowrap" align="RIGHT">Subject: </th>
                    <td>Forward</td>
                </tr>
                <tr>
                    <th valign="BASELINE" nowrap="nowrap" align="RIGHT">Date: </th>
                    <td>Sun, 05 Nov 2023 00:00:00 +0000</td>
                </tr>
                <tr>
                    <th valign="BASELINE" nowrap="nowrap" align="RIGHT">From: </th>
                    <td>A person &lt;me@example.com&gt;</td>
                </tr>
                <tr>
                    <th valign="BASELINE" nowrap="nowrap" align="RIGHT">To: </th>
                    <td>Other person &lt;you@example.com&gt;</td>
                </tr>
            </tbody>
        </table>
        <br><br>;) A message.<br>
     </div>
</body></html>`,
    "text/html",
  )

  let msgDoc

  async function get(mdHTML) {
    const doc = parser.parseFromString(mdHTML, "text/html")
    const mdHtmlToText = new MdhrMangle(doc)
    return await mdHtmlToText.preprocess()
  }

  it("should be okay with an empty string", async function () {
    expect(await get("")).to.equal("")
  })

  // Test some cases with bare text nodes
  it("should properly handle bare text nodes", async function () {
    let html = ""
    let target = ""
    expect(await get(html)).to.equal(target)

    html = "asdf"
    target = "asdf"
    expect(await get(html)).to.equal(target)

    html = 'asdf<div class="x">qwer</div>'
    target = "asdf\nqwer"
    expect(await get(html)).to.equal(target)

    html = 'asdf<br class="x">qwer'
    target = "asdf\nqwer"
    expect(await get(html)).to.equal(target)

    html = 'asdf<br class="x">qwer<div>zxcv</div>asdf'
    target = "asdf\nqwer\nzxcv\nasdf"
    expect(await get(html)).to.equal(target)

    html = 'asdf<br class="x">qwer<div>zxcv</div>ghjk<div>yuio</div>asdf'
    target = "asdf\nqwer\nzxcv\nghjk\nyuio\nasdf"
    expect(await get(html)).to.equal(target)

    html = 'asdf<br class="x">qwer<div><div>zxcv</div>ghjk<div>yuio</div></div>asdf'
    target = "asdf\nqwer\nzxcv\nghjk\nyuio\nasdf"
    expect(await get(html)).to.equal(target)

    html = 'asdf\n<br class="x">qwer<div><div>zxcv</div>ghjk<div>yuio</div></div>asdf'
    target = "asdf\nqwer\nzxcv\nghjk\nyuio\nasdf"
    expect(await get(html)).to.equal(target)

    html = '<div class="x">asdf</div>qwer'
    target = "asdf\nqwer"
    expect(await get(html)).to.equal(target)
  })

  describe("excludeContent", function () {
    it("should exclude signatures", async function () {
      msgDoc = replyMsg.cloneNode(true)
      const m = new MdhrMangle(msgDoc)
      await m.excludeContent()

      expect(msgDoc.querySelector("body > .moz-signature")).to.be.null
    })

    it("should exclude replies", async function () {
      msgDoc = replyMsg.cloneNode(true)
      const m = new MdhrMangle(msgDoc)
      await m.excludeContent()

      expect(msgDoc.querySelector("body > div.moz-cite-prefix")).to.be.null
      expect(msgDoc.querySelector("body > blockquote[type='cite']")).to.be.null
    })

    it("should exclude forwards", async function () {
      msgDoc = fwdMsg.cloneNode(true)
      const m = new MdhrMangle(msgDoc)
      await m.excludeContent()

      expect(msgDoc.querySelector("body > div.moz-forward-container")).to.be.null
    })
  })

  // Fix for https://github.com/adam-p/markdown-here/issues/104
  it("should correctly handle pre-rendered links in inline code (fix for issue #104)", async function () {
    const html = 'aaa `<a href="bbb">ccc</a>`'

    // Real target
    const target = "aaa `ccc`"
    expect(await get(html)).to.equal(target)
  })

  // Fix for https://github.com/adam-p/markdown-here/issues/104
  it("should correctly handle pre-rendered links in code blocks (fix for issue #104)", async function () {
    const html = '```<br><a href="aaa">bbb</a><br>```'

    // Real target
    const target = "```\nbbb\n```"
    expect(await get(html)).to.equal(target)
  })

  // Busted due to https://github.com/adam-p/markdown-here/issues/104
  it("should NOT correctly handle pre-rendered links in code blocks (busted due to issue #104)", async function () {
    const html = '&nbsp;&nbsp;&nbsp;&nbsp;<a href="aaa">bbb</a><br>'

    // Real target
    // const target = '    bbb';
    const target = "    [bbb](aaa)"
    expect(await get(html)).to.equal(target)
  })

  // Test fix for bug https://github.com/adam-p/markdown-here/issues/251
  // <br> at the end of <div> should not add a newline
  it("should not add an extra newline for br at end of div", async function () {
    // HTML from issue
    const html = "<div><div>markdown | test<br>-- |---<br></div>1 | test<br></div>2 | test2<br>"
    const target = "markdown | test\n-- |---\n1 | test\n2 | test2"
    expect(await get(html)).to.equal(target)
  })
})
