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
})
