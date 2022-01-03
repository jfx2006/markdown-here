/*
 * Copyright JFX 2021
 * MIT License
 */
/* global describe, expect, it, before, beforeEach, after, afterEach */

import {
  fetchExtFile,
  HLJS_STYLES_PATH,
  sha256Digest,
  getHljsStylesheet,
  getHljsStyles,
} from "../async_utils.js"

describe("AsyncUtils", function () {
  describe("fetchExtFile", function () {
    it("should return correct data", async function () {
      // We "know" our options.html file starts with this string
      const KNOWN_PREFIX = '<!DOCTYPE html>'
      let data = await fetchExtFile("/options/options.html")
      expect(data.slice(0, KNOWN_PREFIX.length)).to.equal(KNOWN_PREFIX)
    })

    it("should return correct JSON data", async function () {
      let styles_json = await fetchExtFile(
        `${HLJS_STYLES_PATH}/styles.json`,
        true
      )
      expect(Object.entries(styles_json).length).to.be.greaterThan(0)
    })
  })

  describe("getHljsStyles", function () {
    it("should return styles", async function () {
      const KNOWN_KEY = "A11y Dark"
      const KNOWN_VALUE = "a11y-dark.css"
      let styles_json = await getHljsStyles()
      expect(Object.keys(styles_json)[0]).to.equal(KNOWN_KEY)
      expect(Object.values(styles_json)[0]).to.equal(KNOWN_VALUE)
    })
  })

  describe("getHljsStylesheet", function () {
    it("should return some css", async function () {
      const KNOWN_PREFIX = "/*!\n  Theme: a11y-dark\n"
      let data = await getHljsStylesheet("a11y-dark.css")
      expect(data.slice(0, KNOWN_PREFIX.length)).to.equal(KNOWN_PREFIX)
    })
  })

  describe("sha256sum", function () {
    it("calculate sha256sum of text", async function () {
      const TEXT = "HELLO WORLD\n"
      const TEXT_SUM =
        "2949725604dd9eef82100f8ff39fcced9d3682700ee2fb5c4205e3e584defee6"
      let result = await sha256Digest(TEXT)
      expect(result).to.equal(TEXT_SUM)
    })
  })
})
