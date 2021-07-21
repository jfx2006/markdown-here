/*
 * Copyright JFX 2021
 * MIT License
 */
/* global describe, expect, it, before, beforeEach, after, afterEach */

import * as AsyncUtils from  '../async_utils.js'

describe('AsyncUtils', function() {
  it('should exist', function() {
    expect(AsyncUtils).to.exist
  })

  describe('fetchExtFile', function() {
    it('should return correct data', async function() {
      // We "know" our options.html file starts with this string
      const KNOWN_PREFIX = '<html lang="en">'
      let data = await AsyncUtils.fetchExtFile('/options/options.html')
      expect(data.slice(0, KNOWN_PREFIX.length)).to.equal(KNOWN_PREFIX)
    })

    it("should return correct JSON data", async function() {
      let styles_json = await AsyncUtils.fetchExtFile(`${AsyncUtils.HLJS_STYLES_PATH}/styles.json`, true)
      expect(Object.entries(styles_json).length).to.be.greaterThan(0)
    })
  })

  describe("getHljsStyles", function() {
    it("should return styles", async function() {
      const KNOWN_KEY = "A11y Dark"
      const KNOWN_VALUE = "a11y-dark.css"
      let styles_json = await AsyncUtils.fetchExtFile(`${AsyncUtils.HLJS_STYLES_PATH}/styles.json`, true)
      expect(Object.keys(styles_json)[0]).to.equal(KNOWN_KEY)
      expect(Object.values(styles_json)[0]).to.equal(KNOWN_VALUE)
    })
  })

  describe("getHljsStylesheet", function() {
    it("should return some css", async function() {
      const KNOWN_PREFIX = "/* a11y-dark theme */"
      let data = await AsyncUtils.getHljsStylesheet("a11y-dark.css")
      expect(data.slice(0, KNOWN_PREFIX.length)).to.equal(KNOWN_PREFIX)
    })
  })
})

