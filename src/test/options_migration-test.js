/*
 * Copyright JFX 2021
 * MIT License
 */
/* global describe, expect, it, before, beforeEach, after, afterEach */

import {
  migrate_badMathValue,
  migrate_MainCSS,
  migrate_setLastVersion,
  migrate_syntaxCSS,
} from "../options/options_migration.js"

const DEFAULTS = {
  "main-css": "/* MAIN.CSS */",
  "syntax-css": "three.css",
  "math-enabled": false,
  "math-value": "MATH_VALUE",
  "hotkey-input": "HOTKEY_INPUT",
  "forgot-to-render-check-enabled": true,
  "gfm-line-breaks-enabled": true,
  "last-version": "0",
  hljs_styles: { one: "one.css", two: "two.css", three: "three.css" },
}

describe("migrate_syntaxCSS", function () {
  it("should not modify a valid css style", function () {
    let options = { "syntax-css": "two.css" }
    migrate_syntaxCSS(options, DEFAULTS)
    expect(options["syntax-css"]).to.equal("two.css")
  })
  it("should reset an invalid css style to the default", function () {
    let options = { "syntax-css": "BOGUS" }
    migrate_syntaxCSS(options, DEFAULTS)
    expect(options["syntax-css"]).to.be.undefined
  })
})

describe("migrate_badMathValue", function () {
  const MATH_FIXED = "some math data"
  const J1_MATH = JSON.stringify(MATH_FIXED)
  const J2_MATH = JSON.stringify(J1_MATH)
  it("fix json encoded math value", function () {
    let options = { "math-value": J1_MATH }
    migrate_badMathValue(options)
    expect(options["math-value"]).to.equal(MATH_FIXED)
  })
  it("fix 2x json encoded math value", function () {
    let options = { "math-value": J2_MATH }
    migrate_badMathValue(options)
    expect(options["math-value"]).to.equal(MATH_FIXED)
  })
  it("ignore good math value", function () {
    let options = { "math-value": MATH_FIXED }
    migrate_badMathValue(options)
    expect(options["math-value"]).to.equal(MATH_FIXED)
  })
})

describe("migrate_MainCSS", function () {
  it("update an old default css", async function () {
    const EXPECTED = DEFAULTS["main-css"]
    let options = { "main-css": "/* some css code */" }
    await migrate_MainCSS(options, DEFAULTS)
    expect(options["main-css"]).to.be.undefined
  })
  it("NOT update a custom css", async function () {
    const CUSTOM_CSS = "/* custom css code */"
    let options = { "main-css": CUSTOM_CSS }
    await migrate_MainCSS(options, DEFAULTS)
    expect(options["main-css"]).to.equal(CUSTOM_CSS)
  })
})

describe("options_migrations tests", function () {
  describe("migrate_setLastVersion", function () {
    const thisVersion = messenger.runtime.getManifest().version
    it("should update the last run version", function () {
      let options = { "last-version": "0.0.0" }
      migrate_setLastVersion(options)
      expect(options["last-version"]).to.equal(thisVersion)
    })

    it("should set the last run version", function () {
      let options = {}
      migrate_setLastVersion(options)
      expect(options["last-version"]).to.equal(thisVersion)
    })
  })
})
