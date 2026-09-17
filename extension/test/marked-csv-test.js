/*
 * Copyright JFX 2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

/* global describe, expect, it */

import { marked } from "../vendor/marked.esm.js"
import { markedCsv } from "../marked-csv.esm.js"

marked.use(markedCsv())

function render(md) {
  return marked.parse(md).replace(/\n/g, "")
}

describe("markedCsv", function () {
  it("should exist", function () {
    expect(markedCsv).to.exist
  })

  it("renders a simple comma separated block as a table", function () {
    const html = render("```csv\nName,Age\nAlice,30\nBob,41\n```")
    expect(html).to.contain("<table>")
    expect(html).to.contain("<thead><tr><th>Name</th><th>Age</th></tr></thead>")
    expect(html).to.contain("<tr><td>Alice</td><td>30</td></tr>")
    expect(html).to.contain("<tr><td>Bob</td><td>41</td></tr>")
    expect(html).to.not.contain("<pre>")
  })

  it("auto-detects semicolon delimiters (French Excel style)", function () {
    const html = render("```csv\nNom;Ville\nAlice;Nantes\n```")
    expect(html).to.contain("<thead><tr><th>Nom</th><th>Ville</th></tr></thead>")
    expect(html).to.contain("<tr><td>Alice</td><td>Nantes</td></tr>")
  })

  it("handles tsv blocks", function () {
    const html = render("```tsv\nA\tB\n1\t2\n```")
    expect(html).to.contain("<thead><tr><th>A</th><th>B</th></tr></thead>")
    expect(html).to.contain("<tr><td>1</td><td>2</td></tr>")
  })

  it("keeps quoted commas and quotes inside a single cell", function () {
    const html = render('```csv\na,b\n"x, y","say ""hi"""\n```')
    expect(html).to.contain("<tr><td>x, y</td><td>say &quot;hi&quot;</td></tr>")
  })

  it("pads unequal row lengths to a rectangular table", function () {
    const html = render("```csv\na,b,c\n1,2\n3\n```")
    expect(html).to.contain("<thead><tr><th>a</th><th>b</th><th>c</th></tr></thead>")
    expect(html).to.contain("<tr><td>1</td><td>2</td><td></td></tr>")
    expect(html).to.contain("<tr><td>3</td><td></td><td></td></tr>")
  })

  it("falls back to a plain code block on malformed CSV", function () {
    const html = render('```csv\na,b\n"unterminated,2\n```')
    expect(html).to.not.contain("<table>")
    expect(html).to.contain("<pre>")
    expect(html).to.contain("<code")
  })

  it("escapes cell content and does not interpret markdown", function () {
    const html = render("```csv\na,b,c\n<script>alert(1)</script>,**bold**,#123\n```")
    expect(html).to.not.contain("<script>")
    expect(html).to.contain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(html).to.contain("<td>**bold**</td>")
    expect(html).to.contain("<td>#123</td>")
    expect(html).to.not.contain("<strong>")
  })

  it("leaves other fenced languages alone", function () {
    const html = render("```js\nlet a = 1, b = 2\n```")
    expect(html).to.not.contain("<table>")
    expect(html).to.contain("<pre>")
    expect(html).to.contain("let a = 1, b = 2")
  })

  it("leaves a fence without an info string alone", function () {
    const html = render("```\na,b\n1,2\n```")
    expect(html).to.not.contain("<table>")
    expect(html).to.contain("<pre>")
  })
})
