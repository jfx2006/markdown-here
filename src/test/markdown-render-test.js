/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

import markdownRender from "../markdown-render.js"

"use strict";
/* jshint curly:true, noempty:true, newcap:true, eqeqeq:true, eqnull:true, undef:true, devel:true, browser:true, node:true, evil:false, latedef:false, nonew:true, trailing:false, immed:false, smarttabs:true, expr:true */
/* global describe, expect, it, before, beforeEach, after, afterEach */
/* global _, $, MarkdownRender, htmlToText, Utils, MdhHtmlToText */


describe('Markdown-Render', function() {
  it('should exist', function() {
    expect(markdownRender).to.exist;
  });

  describe('markdownRender', function() {
    var userprefs = {};

    beforeEach(function() {
      userprefs = {
        'math-value': null,
        'math-enabled': false,
        'gfm-line-breaks-enabled': true,
        'smart-quotes-enabled': true,
      };
    });

    it('should be okay with an empty string', function() {
      expect(markdownRender('', userprefs)).to.equal('');
    });

    // Test the fix for https://github.com/adam-p/markdown-here/issues/51
    it('should correctly handle links with URL text', function() {
      var s = '[http://example1.com](http://example2.com)';
      var target = '<a href="http://example2.com">http://example1.com</a>';
      expect(markdownRender(s, userprefs)).to.contain(target);
    });

    // Test the fix for https://github.com/adam-p/markdown-here/issues/51
    it('should quite correctly handle pre-formatted links with URL text', function() {
      var s = '<a href="http://example1.com">http://example2.com</a>';
      var target = '<a href="http://example1.com">http://example2.com</a>';
      expect(markdownRender(s, userprefs)).to.contain(target);
    });

    it('should retain pre-formatted links', function() {
      var s = '<a href="http://example1.com">aaa</a>';
      expect(markdownRender(s, userprefs)).to.contain(s);
    });

    // Test issue #57: https://github.com/adam-p/markdown-here/issues/57
    it('should add the schema to links missing it', function() {
      var md = 'asdf [aaa](bbb) asdf [ccc](ftp://ddd) asdf';
      var target = '<p>asdf <a href="http://bbb">aaa</a> asdf <a href="ftp://ddd">ccc</a> asdf</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    it('should *not* add the schema to anchor links', function() {
      var md = 'asdf [aaa](#bbb) asdf [ccc](ftp://ddd) asdf';
      var target = '<p>asdf <a href="#bbb">aaa</a> asdf <a href="ftp://ddd">ccc</a> asdf</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #87: https://github.com/adam-p/markdown-here/issues/87
    it('should smartypants apostrophes properly', function() {
      var md = "Adam's parents' place";
      var target = '<p>Adam\u2019s parents\u2019 place</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #83: https://github.com/adam-p/markdown-here/issues/83
    it('should not alter MD-link-looking text in code blocks', function() {
      var md = '`[a](b)`';
      var target = '<p><code>[a](b)</code></p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);

      md = '```\n[a](b)\n```';
      target = '<pre><code>[a](b)\n</code></pre>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #84: Math: single-character formula won't render
    // https://github.com/adam-p/markdown-here/issues/84
    it('should render single-character math formulae', function() {
      userprefs = {
        'math-value': '<img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl={urlmathcode}" alt="{mathcode}">',
        'math-enabled': true
      };

      var md = '`$x$`';
      var target = '<p><img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl=x" alt="x"></p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);

      // Make sure we haven't broken multi-character forumlae
      md = '`$xx$`';
      target = '<p><img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl=xx" alt="xx"></p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #112: Syntax Highlighting crashing rendering on bad language name: https://github.com/adam-p/markdown-here/issues/112
    it('should properly render code with good language names', function() {
      var md = '```sql\nSELECT * FROM table WHERE id = 1\n```';
      var target = '<pre><code class="hljs language-sql"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> <span class="hljs-keyword">table</span> <span class="hljs-keyword">WHERE</span> id <span class="hljs-operator">=</span> <span class="hljs-number">1</span>\n</code></pre>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #112: Syntax Highlighting crashing rendering on bad language name: https://github.com/adam-p/markdown-here/issues/112
    it('should properly render code with good language names that are in the wrong (upper)case', function() {
      var md = '```SQL\nSELECT * FROM table WHERE id = 1\n```';
      var target = '<pre><code class="hljs language-SQL"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> <span class="hljs-keyword">table</span> <span class="hljs-keyword">WHERE</span> id <span class="hljs-operator">=</span> <span class="hljs-number">1</span>\n</code></pre>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #112: Syntax Highlighting crashing rendering on bad language name: https://github.com/adam-p/markdown-here/issues/112
    it('should properly render code with unsupported language names', function() {
      var md = '```badlang\nSELECT * FROM table WHERE id = 1\n```';
      var target = '<pre><code class="hljs language-badlang">SELECT * FROM table WHERE id = 1\n</code></pre>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #132: https://github.com/adam-p/markdown-here/issues/132
    // Smart arrow
    it('should render smart arrows', function() {
      var md = '--> <-- <--> ==> <== <==>';
      var target = '<p>→ ← ↔ ⇒ ⇐ ⇔</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);

      // And should not break headers or m-dashes
      md = 'Arrows\n==\nAnd friends\n--\n--> <-- <--> ==> <== <==> -- m-dash';
      target = '<h1 id="arrows">Arrows</h1>\n<h2 id="and-friends">And friends</h2>\n<p>→ ← ↔ ⇒ ⇐ ⇔ – m-dash</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #103: option to disable GFM line breaks
    it('should use GFM line breaks when enabled', function() {
      userprefs['gfm-line-breaks-enabled'] = true;

      var md = 'aaa\nbbb\nccc';
      var target = '<p>aaa<br>bbb<br>ccc</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

    // Test issue #103: option to disable GFM line breaks
    it('should not use GFM line breaks when disabled', function() {
      userprefs['gfm-line-breaks-enabled'] = false;

      var md = 'aaa\nbbb\nccc';
      var target = '<p>aaa\nbbb\nccc</p>\n';
      expect(markdownRender(md, userprefs)).to.equal(target);
    });

  });


  // This includes going from original HTML to MD to HTML and then postprocessing.
  describe('HTML to Markdown to HTML', function() {
    var userprefs = {};

    beforeEach(function() {
      userprefs = {
        'math-value': null,
        'math-enabled': false,
        'smart-quotes-enabled': true,
      };
    });

    var fullRender = function(mdHTML) {
      var elem = $('<div>').html(mdHTML).appendTo('body');
      var mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(elem.get(0));
      var renderedMarkdown = markdownRender(
        mdhHtmlToText.get(), userprefs);
      renderedMarkdown = mdhHtmlToText.postprocess(renderedMarkdown);
      $(elem).remove();
      return renderedMarkdown;
    };

    it('should be okay with an empty string', function() {
      expect(fullRender('')).to.equal('');
    });

    // Check fix for https://github.com/adam-p/markdown-here/issues/51, which
    it('should correctly handle links with URL text', function() {
      var s = '[http://example1.com](http://example2.com)';
      var target = '<a href="http://example2.com">http://example1.com</a>';
      expect(fullRender(s)).to.contain(target);
    });

    it('should quite correctly handle pre-formatted links with URL text', function() {
      var s = '<a href="http://example2.com">http://example1.com</a>';
      var target = '<a href="http://example2.com">http://example1.com</a>';
      expect(fullRender(s)).to.contain(target);
    });

    it('should retain pre-formatted links', function() {
      var s = '<a href="http://example1.com">aaa</a>';
      expect(fullRender(s)).to.contain(s);
    });

    // Test that issue #69 hasn't come back: https://github.com/adam-p/markdown-here/issues/69
    it('should properly render MD links that contain pre-formatted HTML links', function() {
      var tests = [], i;

      // NOTE: The expected results are affected by other content massaging,
      // such as adding missing links schemas.

      // Begin tests where the link should be converted

      tests.push(['asdf <a href="http://www.aaa.com">bbb</a> asdf',
                  '<p>asdf <a href="http://www.aaa.com">bbb</a> asdf</p>\n']);

      tests.push(['<a href="aaa">bbb</a>',
                  '<p><a href="http://aaa">bbb</a></p>\n']);

      tests.push(['[xxx](yyy) <a href="aaa">bbb</a>',
                  '<p><a href="http://yyy">xxx</a> <a href="http://aaa">bbb</a></p>\n']);

      tests.push(['asdf (<a href="aaa">bbb</a>)',
                  '<p>asdf (<a href="http://aaa">bbb</a>)</p>\n']);

      // Begin tests where the link should *not* be converted.
      // Note that some tests are affected by issue #57: MD links should automatically add scheme

      tests.push(['asdf [yyy](<a href="http://www.aaa.com">bbb</a>) asdf',
                  '<p>asdf <a href="http://bbb">yyy</a> asdf</p>\n']);

      tests.push(['asdf [<a href="http://www.aaa.com">bbb</a>](ccc) asdf',
                  '<p>asdf <a href="http://ccc">bbb</a> asdf</p>\n']);

      tests.push(['[yyy](<a href="http://www.aaa.com">bbb</a>)',
                  '<p><a href="http://bbb">yyy</a></p>\n']);

      tests.push(['[yyy]( <a href="http://www.aaa.com">bbb</a>)',
                  '<p><a href="http://bbb">yyy</a></p>\n']);

      tests.push(['asdf [qwer <a href="http://www.aaa.com">bbb</a>](ccc) asdf',
                  '<p>asdf <a href="http://ccc">qwer bbb</a> asdf</p>\n']);

      // Begin mixed tests

      tests.push(['asdf [aaa](bbb) asdf <a href="http://www.aaa.com">bbb</a> asdf [yyy](<a href="http://www.aaa.com">bbb</a>) asdf',
                  '<p>asdf <a href="http://bbb">aaa</a> asdf <a href="http://www.aaa.com">bbb</a> asdf <a href="http://bbb">yyy</a> asdf</p>\n']);

      // Begin tests that don't work quite right

      tests.push(['asdf [<a href="http://www.aaa.com">bbb</a>] asdf',
                  '<p>asdf [bbb] asdf</p>\n']);

      tests.push(['asdf ](<a href="http://www.aaa.com">bbb</a>) asdf',
                  '<p>asdf ](bbb) asdf</p>\n']);

      for (i = 0; i < tests.length; i++) {
        expect(fullRender(tests[i][0])).to.equal(tests[i][1]);
      }
    });

    // Test issue #57: https://github.com/adam-p/markdown-here/issues/57
    it('should add the schema to links missing it', function() {
      var md = 'asdf [aaa](bbb) asdf [ccc](ftp://ddd) asdf';
      var target = '<p>asdf <a href="http://bbb">aaa</a> asdf <a href="ftp://ddd">ccc</a> asdf</p>\n';
      expect(fullRender(md)).to.equal(target);
    });

    it('should *not* add the schema to anchor links', function() {
      var md = 'asdf [aaa](#bbb) asdf [ccc](ftp://ddd) asdf';
      var target = '<p>asdf <a href="#bbb">aaa</a> asdf <a href="ftp://ddd">ccc</a> asdf</p>\n';
      expect(fullRender(md)).to.equal(target);
    });

    // Test issue #87: https://github.com/adam-p/markdown-here/issues/87
    it('should smartypants apostrophes properly', function() {
      var md = "Adam's parents' place";
      var target = '<p>Adam\u2019s parents\u2019 place</p>\n';
      expect(fullRender(md)).to.equal(target);
    });

    // Test issue #83: https://github.com/adam-p/markdown-here/issues/83
    it('should not alter MD-link-looking text in code blocks', function() {
      var md = '`[a](b)`';
      var target = '<p><code>[a](b)</code></p>\n';
      expect(fullRender(md)).to.equal(target);

      md = '```<br>[a](b)<br>```';
      target = '<pre><code>[a](b)\n</code></pre>\n';
      expect(fullRender(md)).to.equal(target);
    });

    // Test issue #84: Math: single-character formula won't render
    // https://github.com/adam-p/markdown-here/issues/84
    it('should render single-character math formulae', function() {
      userprefs = {
        'math-value': '<img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl={urlmathcode}" alt="{mathcode}">',
        'math-enabled': true
      };

      var md = '`$x$`';
      var target = '<p><img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl=x" alt="x"></p>\n';
      expect(fullRender(md)).to.equal(target);

      // Make sure we haven't broken multi-character forumlae
      md = '`$xx$`';
      target = '<p><img class="mdh-math" src="https://chart.googleapis.com/chart?cht=tx&chl=xx" alt="xx"></p>\n';
      expect(fullRender(md)).to.equal(target);
    });

  });

});
