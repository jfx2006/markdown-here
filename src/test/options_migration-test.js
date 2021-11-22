/*
 * Copyright JFX 2021
 * MIT License
 */
/* global describe, expect, it, before, beforeEach, after, afterEach */

import {
  migrate_badMathValue,
  migrate_MainCSS,
  migrate_setLastVersion, migrate_smartReplacements,
  migrate_syntaxCSS
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

describe("options_migrations tests", function () {
  describe("migrate_syntaxCSS", function () {
    it("should not modify a valid css style", async function () {
      let options = { "syntax-css": "two.css" }
      let changed = await migrate_syntaxCSS(options, DEFAULTS)
      expect(changed).to.be.null
    })
    it("should reset an invalid css style to the default", async function () {
      let options = { "syntax-css": "BOGUS" }
      let changed = await migrate_syntaxCSS(options, DEFAULTS)
      expect(changed["syntax-css"]).to.equal("three.css")
    })
  })

  describe("migrate_badMathValue", function () {
    const MATH_FIXED = "some math data"
    const J1_MATH = JSON.stringify(MATH_FIXED)
    const J2_MATH = JSON.stringify(J1_MATH)
    it("fix json encoded math value", async function () {
      let options = { "math-value": J1_MATH }
      let changed = await migrate_badMathValue(options)
      expect(changed["math-value"]).to.equal(MATH_FIXED)
    })
    it("fix 2x json encoded math value", async function () {
      let options = { "math-value": J2_MATH }
      let changed = await migrate_badMathValue(options)
      expect(changed["math-value"]).to.equal(MATH_FIXED)
    })
    it("ignore good math value", async function () {
      let options = { "math-value": MATH_FIXED }
      let changed = await migrate_badMathValue(options)
      expect(changed).to.be.null
    })
  })

  describe("migrate_MainCSS", function () {
    it("update an old default css", async function () {
      const EXPECTED = DEFAULTS["main-css"]
      let options = { "main-css": "/* some css code */" }
      let changed = await migrate_MainCSS(options, DEFAULTS)
      expect(changed["main-css"]).to.equal(EXPECTED)
    })
    it("NOT update a custom css", async function () {
      const CUSTOM_CSS = "/* custom css code */"
      let options = { "main-css": CUSTOM_CSS }
      let changed = await migrate_MainCSS(options, DEFAULTS)
      expect(changed).to.be.null
    })
  })

  describe("migrate_setLastVersion", function () {
    const thisVersion = messenger.runtime.getManifest().version
    it("should update the last run version", async function () {
      let options = { "last-version": "0.0.0" }
      let changed = await migrate_setLastVersion(options)
      expect(changed["last-version"]).to.equal(thisVersion)
    })

    it("should set the last run version", async function () {
      let options = {}
      let changed = await migrate_setLastVersion(options)
      expect(changed["last-version"]).to.equal(thisVersion)
    })
  })

  describe("migrate_smartReplacements", function () {
    it("should migrate 'smart-quotes' option", async function() {
      let options = { "smart-quotes-enabled": false }
      let changed = await migrate_smartReplacements(options)
      expect(changed["smart-replacements-enabled"]).to.equal(false)
    })
  })
})
