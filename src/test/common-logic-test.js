/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict";
/* jshint curly:true, noempty:true, newcap:true, eqeqeq:true, eqnull:true, undef:true, devel:true, browser:true, node:true, evil:false, latedef:false, nonew:true, trailing:false, immed:false, smarttabs:true, expr:true */
/* global describe, expect, it, before, beforeEach, after, afterEach */
/* global _, $, markdownRender, htmlToText, Utils, CommonLogic */


describe('CommonLogic', function() {
  it('should exist', function() {
    expect(CommonLogic).to.exist;
  });

  describe('probablyWritingMarkdown', function() {
    var prefs = {};

    it('should not detect an empty string', function() {
      expect(CommonLogic.probablyWritingMarkdown('')).to.equal(false);
    });

    it('should not detect non-MD text', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect bullets', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n* bullet 1\n  * sub-bullet\n* bullet 2\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect code', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nHere is `code`.\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n```javascript\nvar s = "code";\n```\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect math', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n`$\\delta$`\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect emphasis', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nSo **strong**!\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      // But not light emphasis.
      text = 'Hi friend,\n\nHow are you?\n\nSo _weak_!\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect headers', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n## IMAHEADER\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n###### IMAHEADER\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n  ## SPACES BEFORE HASHES AND AFTER TEXT  \n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n####### TOO MANY HASH MARKS\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(false);

      text = 'Hi friend,\n\nHow are you?\n\nUNDERLINE HEADER\n------\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\nUNDERLINE HEADER\n======\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\nSPACES BEFORE DASHES OKAY\n  ======\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n===== TEXT AFTER UNDERLINE\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect links', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n[The Goog](https://www.google.com)\n\nsincerely,\nme';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n[The Goog][1]\n\nsincerely,\nme\n\n[1]: https://www.google.com';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n[Not a nolink link].\n\nsincerely,\nme\n\n';
      expect(CommonLogic.probablyWritingMarkdown(text)).to.equal(false);
    });

  });

});
