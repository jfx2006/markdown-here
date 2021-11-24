/*
 * Copyright Adam Pritchard 2014
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict";
/* jshint curly:true, noempty:true, newcap:true, eqeqeq:true, eqnull:true, es5:true, undef:true, devel:true, browser:true, node:true, evil:false, latedef:false, nonew:true, trailing:false, immed:false, smarttabs:true, expr:true */
/* global describe, expect, it, before, beforeEach, after, afterEach */
/* global _, $, markdownRender, htmlToText, Utils */


// This function wraps `htmlString` in a `<div>` to make life easier for us.
// It should affect the testing behaviour, though -- good/bad elements in a
// `<div>` are still good/bad.
function createDocFrag(htmlString) {
  var docFrag = document.createDocumentFragment();
  var elem = document.createElement('div');
  // eslint-disable-next-line no-unsanitized/property
  elem.innerHTML = htmlString;
  docFrag.appendChild(elem);
  return docFrag;
}


describe('Utils', function() {
  it('should exist', function() {
    expect(Utils).to.exist;
  });

  describe('sanitizeDocumentFragment', function() {
    it('should not alter safe doc-frags', function() {
      var origFrag = createDocFrag('<div>hi');
      var sanFrag = Utils.sanitizeDocumentFragment(origFrag);
      expect(origFrag.isEqualNode(sanFrag)).to.be.true;
    });

    it('should remove <script> elements', function() {
      var origFrag = createDocFrag('<b>hi</b><script>alert("oops")</script>there<script>alert("derp")</script>');
      var sanFrag = Utils.sanitizeDocumentFragment(origFrag);
      expect(origFrag.isEqualNode(sanFrag)).to.be.false;

      var cleanFrag = createDocFrag('<b>hi</b>there');
      expect(cleanFrag.isEqualNode(sanFrag)).to.be.true;
    });

    it('should not remove safe attributes', function() {
      var origFrag = createDocFrag('<div id="rad" style="color:red">hi</div>');
      // Make sure the attributes are sticking in the original
      expect(origFrag.querySelector('#rad').style.color).to.equal('red');

      var sanFrag = Utils.sanitizeDocumentFragment(origFrag);
      expect(origFrag.isEqualNode(sanFrag)).to.be.true;
    });

    it('should remove event handler attributes', function() {
      var origFrag = createDocFrag('<div id="rad" style="color:red" onclick="javascript:alert(\'derp\')">hi</div>');
      // Make sure the attributes are sticking in the original
      expect(origFrag.querySelector('#rad').attributes.onclick).to.exist;

      var sanFrag = Utils.sanitizeDocumentFragment(origFrag);
      expect(origFrag.isEqualNode(sanFrag)).to.be.false;

      var cleanFrag = createDocFrag('<div id="rad" style="color:red">hi</div>');
      expect(cleanFrag.isEqualNode(sanFrag)).to.be.true;
    });
  });

  describe('saferSetInnerHTML', function() {
    it('should set safe HTML without alteration', function() {
      var testElem = document.createElement('div');
      Utils.saferSetInnerHTML(testElem, '<p>hi</p>');

      var checkElem = document.createElement('div');
      checkElem.innerHTML = '<p>hi</p>';

      expect(testElem.isEqualNode(checkElem)).to.be.true;
    });

    it('should remove <script> elements', function() {
      var testElem = document.createElement('div');
      Utils.saferSetInnerHTML(testElem, '<b>hi</b><script>alert("oops")</script>there<script>alert("derp")</script>');

      var checkElem = document.createElement('div');
      checkElem.innerHTML = '<b>hi</b><script>alert("oops")</script>there<script>alert("derp")</script>';

      expect(testElem.isEqualNode(checkElem)).to.be.false;

      var safeElem = document.createElement('div');
      safeElem.innerHTML = '<b>hi</b>there';

      expect(testElem.isEqualNode(safeElem)).to.be.true;
    });

    it('should not remove safe attributes', function() {
      var testElem = document.createElement('div');
      Utils.saferSetInnerHTML(testElem, '<div id="rad" style="color:red">hi</div>');

      var checkElem = document.createElement('div');
      checkElem.innerHTML = '<div id="rad" style="color:red">hi</div>';

      expect(testElem.isEqualNode(checkElem)).to.be.true;

      expect(testElem.querySelector('#rad').style.color).to.equal('red');
    });

    it('should remove event handler attributes', function() {
      var testElem = document.createElement('div');
      Utils.saferSetInnerHTML(testElem, '<div id="rad" style="color:red" onclick="javascript:alert(\'derp\')">hi</div>');

      var checkElem = document.createElement('div');
      checkElem.innerHTML = '<div id="rad" style="color:red">hi</div>';

      expect(testElem.isEqualNode(checkElem)).to.be.true;

      expect(testElem.querySelector('#rad').style.color).to.equal('red');
      expect(testElem.querySelector('#rad').attributes.onclick).to.not.exist;
    });

  });

  describe('saferSetOuterHTML', function() {
    beforeEach(function() {
      // Our test container element, which will not be modified
      $('body').append($('<div id="test-container" style="display:none"><div id="test-elem"></div></div>'));
    });

    afterEach(function() {
      $('#test-container').remove();
    });

    it('should throw exception if element not in DOM', function() {
      var testElem = $('<div><b>bye</b></div>').get(0);

      var fn = _.partial(Utils.saferSetOuterHTML, '<p></p>');

      expect(fn).to.throw(Error);
    });

    it('should set safe HTML without alteration', function() {
      Utils.saferSetOuterHTML($('#test-container').children(':first').get(0), '<p>hi</p>');

      expect($('#test-container').html()).to.equal('<p>hi</p>');
    });

    it('should remove <script> elements', function() {
      Utils.saferSetOuterHTML($('#test-container').children(':first').get(0), '<b>hi</b><script>alert("oops")</script>there<script>alert("derp")</script>');

      expect($('#test-container').html()).to.equal('<b>hi</b>there');
    });

    it('should not remove safe attributes', function() {
      Utils.saferSetOuterHTML($('#test-container').children(':first').get(0), '<div id="rad" style="color:red">hi</div>');

      expect($('#test-container').html()).to.equal('<div id="rad" style="color:red">hi</div>');
    });

    it('should remove event handler attributes', function() {
      Utils.saferSetOuterHTML($('#test-container').children(':first').get(0), '<div id="rad" style="color:red" onclick="javascript:alert(\'derp\')">hi</div>');

      expect($('#test-container').html()).to.equal('<div id="rad" style="color:red">hi</div>');
    });
  });


  describe('getDocumentFragmentHTML', function() {
    var makeFragment = function(htmlArray) {
      var docFrag = document.createDocumentFragment();
      htmlArray.forEach(function(html) {
        docFrag.appendChild($(html).get(0));
      });

      return docFrag;
    };

    var makeTextFragment = function(text) {
      var docFrag = document.createDocumentFragment();
      var textNode = document.createTextNode(text);
      docFrag.appendChild(textNode);
      return docFrag;
    };

    it('should be okay with an empty fragment', function() {
      expect(Utils.getDocumentFragmentHTML(makeFragment([]))).to.equal('');
    });

    it('should return correct html', function() {
      var htmlArray = [
        '<div>aaa</div>',
        '<span><b>bbb</b></span>'
      ];

      var expectedHTML = htmlArray.join('');

      expect(Utils.getDocumentFragmentHTML(makeFragment(htmlArray))).to.equal(expectedHTML);
    });

    // Test issue #133: https://github.com/adam-p/markdown-here/issues/133
    // Thunderbird: raw HTML not rendering properly.
    // HTML text nodes were not being escaped properly.
    it('should escape HTML in a text node', function() {
      var docFrag = makeTextFragment('<span style="color:blue">im&blue</span>');
      var expectedHTML = '&lt;span style="color:blue"&gt;im&amp;blue&lt;/span&gt;';
      expect(Utils.getDocumentFragmentHTML(docFrag)).to.equal(expectedHTML);
    });
  });


  describe('isElementDescendant', function() {
    var $testOuter;

    before(function() {
      $testOuter = $('<div id="isElementDescendant-0"></div>')
        .appendTo('body')
        .append('<div id="isElementDescendant-1"><div id="isElementDescendant-1-1"></div></div>')
        .append('<div id="isElementDescendant-2"><div id="isElementDescendant-2-1"></div></div>');
    });

    after(function() {
      $testOuter.remove();
    });

    it('should correctly detect descendency', function() {
      expect(Utils.isElementDescendant(
        document.querySelector('#isElementDescendant-2'),
        document.querySelector('#isElementDescendant-2-1'))).to.equal(true);

      expect(Utils.isElementDescendant(
        document.querySelector('#isElementDescendant-0'),
        document.querySelector('#isElementDescendant-2-1'))).to.equal(true);
    });

    it('should correctly detect non-descendency', function() {
      expect(Utils.isElementDescendant(
        document.querySelector('#isElementDescendant-2-1'),
        document.querySelector('#isElementDescendant-2'))).to.equal(false);

      expect(Utils.isElementDescendant(
        document.querySelector('#isElementDescendant-2-1'),
        document.querySelector('#isElementDescendant-0'))).to.equal(false);

      expect(Utils.isElementDescendant(
        document.querySelector('#isElementDescendant-1'),
        document.querySelector('#isElementDescendant-2'))).to.equal(false);
    });
  });

  describe('makeRequestToPrivilegedScript', function() {
    it('should communicate with privileged script', function(done) {
      Utils.makeRequestToPrivilegedScript(
        document,
        { action: 'test-request' },
        function(response) {
          expect(response).to.equal('test-request-good');
          done();
        });
    });
  });

  describe('makeRequestToBGScript', function() {
    it('should communicate with background script (no args)', function(done) {
      Utils.makeRequestToBGScript(
        "test-bg-request")
        .then((response) => {
          expect(response[0]).to.equal('test-bg-request');
          expect(response[1]).to.equal('test-bg-request-ok');
          done();
      })
    })

    it('should communicate with background script (with arg)', function(done) {
      const args = { "argument": "value1" }
      Utils.makeRequestToBGScript(
        "test-bg-request", args)
        .then((response) => {
          expect(response[0]).to.equal('test-bg-request');
          expect(response[1]).to.equal('test-bg-request-ok');
          expect(response[2]).to.equal("value1");
          done();
        })
    })
  });

  describe('getTopURL', function() {
    it('should get the URL in a simple case', function() {
      expect(Utils.getTopURL(window)).to.equal(location.href);
    });

    it('should get the URL from an iframe', function() {
      var $iframe = $('<iframe>').appendTo('body');
      expect(Utils.getTopURL($iframe.get(0).contentWindow)).to.equal(location.href);
      $iframe.remove();
    });

    it('should get the hostname', function() {
      expect(Utils.getTopURL(window, true)).to.equal(location.hostname);
    });
  });

  describe('getMessage', function() {
    it('should return a string', function() {
      // Since the exact string retuned depends on the current browser locale,
      // we'll just check that some string is returned.
      expect(Utils.getMessage('options_page__page_title')).to.be.a('string');
    });

    it('should throw on bad message ID', function() {
      var fn = _.partial(Utils.getMessage, 'BAADF00D');
      expect(fn).to.throw(Error);
    });
  });

  describe('walkDOM', function() {
    beforeEach(function() {
      $('body').append($('<div id="test-container" style="display:none"><div id="test-elem"></div></div>'));
    });

    afterEach(function() {
      $('#test-container').remove();
    });

    it('should find an element in the DOM', function() {
      var found = false;
      Utils.walkDOM($('body')[0], function(node) {
        found = found || node.id === 'test-elem';
      });
      expect(found).to.be.true;
    });
  });

  describe('utf8StringToBase64', function() {
    it('should correctly encode a foreign-character string', function() {
      var str = 'hello, こんにちは';
      var base64 = 'aGVsbG8sIOOBk+OCk+OBq+OBoeOBrw==';
      expect(Utils.utf8StringToBase64(str)).to.equal(base64);
    });
  });

  describe('base64ToUTF8String', function() {
    it('should correctly encode a foreign-character string', function() {
      var str = 'این یک جمله آزمون است.';
      var base64 = '2KfbjNmGINuM2qkg2KzZhdmE2Ycg2KLYstmF2YjZhiDYp9iz2Kou';
      expect(Utils.base64ToUTF8String(base64)).to.equal(str);
    });
  });

  describe('rangeIntersectsNode', function() {
    beforeEach(function() {
      $('body').append($('<div id="test-container" style="display:none"><div id="test-elem-1"></div><div id="test-elem-2"></div></div>'));
    });

    afterEach(function() {
      $('#test-container').remove();
    });

    it('should detect a node in a range', function() {
      var range = document.createRange();
      range.selectNode($('#test-container')[0]);

      // Check the node that is selected.
      expect(Utils.rangeIntersectsNode(range, $('#test-container')[0])).to.be.true;

      // Check a node that is within the node that is selected.
      expect(Utils.rangeIntersectsNode(range, $('#test-elem-2')[0])).to.be.true;
    });

    it('should not detect a node not in a range', function() {
      var range = document.createRange();
      range.selectNode($('#test-elem-1')[0]);

      // The parent of the selected node *is* intersected.
      expect(Utils.rangeIntersectsNode(range, $('#test-container')[0])).to.be.true;

      // The sibling of the selected node *is not* intersected.
      expect(Utils.rangeIntersectsNode(range, $('#test-elem-2')[0])).to.be.false;
    });

    // I have found that Range.intersectsNode is broken on Chrome. I'm adding
    // test to see if/when it gets fixed.
    it('Range.intersectsNode is broken on Chrome', function() {
      var range = document.createRange();
      range.selectNode($('#test-elem-1')[0]);

      if (typeof(window.chrome) !== 'undefined' && navigator.userAgent.indexOf('Chrome') >= 0) {
        expect(range.intersectsNode($('#test-elem-2')[0])).to.be.true;
      }
    });
  });

  describe('probablyWritingMarkdown', function() {
    var prefs = {};

    it('should not detect an empty string', function() {
      expect(Utils.probablyWritingMarkdown('')).to.equal(false);
    });

    it('should not detect non-MD text', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect bullets', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n* bullet 1\n  * sub-bullet\n* bullet 2\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect code', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nHere is `code`.\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n```javascript\nvar s = "code";\n```\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect math', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n`$\\delta$`\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);
    });

    it('should detect emphasis', function() {
      var text = 'Hi friend,\n\nHow are you?\n\nSo **strong**!\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      // But not light emphasis.
      text = 'Hi friend,\n\nHow are you?\n\nSo _weak_!\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect headers', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n## IMAHEADER\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n###### IMAHEADER\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n  ## SPACES BEFORE HASHES AND AFTER TEXT  \n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n####### TOO MANY HASH MARKS\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(false);

      text = 'Hi friend,\n\nHow are you?\n\nUNDERLINE HEADER\n------\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\nUNDERLINE HEADER\n======\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\nSPACES BEFORE DASHES OKAY\n  ======\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n===== TEXT AFTER UNDERLINE\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(false);
    });

    it('should detect links', function() {
      var text = 'Hi friend,\n\nHow are you?\n\n[The Goog](https://www.google.com)\n\nsincerely,\nme';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n[The Goog][1]\n\nsincerely,\nme\n\n[1]: https://www.google.com';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(true);

      text = 'Hi friend,\n\nHow are you?\n\n[Not a nolink link].\n\nsincerely,\nme\n\n';
      expect(Utils.probablyWritingMarkdown(text)).to.equal(false);
    });

  });

});
