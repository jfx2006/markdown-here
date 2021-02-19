/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

/*
 * Application logic that is common to all (or some) platforms.
 * (And isn't generic enough for utils.js or render-y enough for markdown-render.js,
 * etc.)
 *
 * This module assumes that a global `window` is available.
 */

;(function() {

"use strict";
/*global module:false, chrome:false, Utils:false*/


var DEBUG = false;
function debugLog() {
  var i, log = '';
  if (!DEBUG) {
    return;
  }
  for (i = 0; i < arguments.length; i++) {
    log += String(arguments[i]) + ' // ';
  }
  Utils.consoleLog(log);
}


//
// Begin content script code
//

var WATCHED_PROPERTY = 'markdownHereForgotToRenderWatched';

// Returns true if `text` looks like raw Markdown, false otherwise.
function probablyWritingMarkdown(mdMaybe, marked, prefs) {
  /*
  This is going to be tricksy and fraught with danger. Challenges:
    * If it's not sensitive enough, it's useless.
    * If it's too sensitive, users will be super annoyed.
    * Different people write different kinds of Markdown: coders use backticks,
      mathies use dollar signs, normal people don't use either.
    * Being slow would be bad.

  Ways I considered doing this, but discarded:
    * Use Highlight.js's relevance score.
    * Use the size of the array returned by Marked.js's lexer/parser.
    * Render the contents, replace `<p>` tags with newlines, do string distance.

  But I think there are some simple heuristics that will probably be more
  accurate and/or faster.
  */

  // Ensure that we're not checking on enormous amounts of text.
  if (mdMaybe.length > 10000) {
    mdMaybe = mdMaybe.slice(0, 10000);
  }

  // TODO: Export regexes from Marked.js instead of copying them. Except...
  // Marked's rules use /^.../, which breaks our matching.

  // NOTE: It's going to be tempting to use a ton of fancy regexes, but remember
  // that this check is getting run every few seconds, and we don't want to
  // slow down the user's browser.
  // To that end, we're going to stop checking when we find a match.

  function logMatch(type, match) {
    var log =
      'Markdown Here detected unrendered ' + type +
      (typeof(match.index) !== 'undefined' ?
        (': "' + mdMaybe.slice(match.index, match.index+10) + '"') :
        '');

    if (log !== probablyWritingMarkdown.lastLog) {
      Utils.consoleLog(log);
      probablyWritingMarkdown.lastLog = log;
    }
  }

  // At least two bullet points
  var bulletList = mdMaybe.match(/^[*+-] /mg);
  if (bulletList && bulletList.length > 1) {
    logMatch('bullet list', bulletList);
    return true;
  }

  // Backticks == code. Does anyone use backticks for anything else?
  var backticks = mdMaybe.match(/`/);
  if (backticks) {
    logMatch('code', backticks);
    return true;
  }

  // Math
  var math = mdMaybe.match(/`\$([^ \t\n\$]([^\$]*[^ \t\n\$])?)\$`/);
  if (math) {
    logMatch('math', math);
    return true;
  }

  // We're going to look for strong emphasis (e.g., double asterisk), but not
  // light emphasis (e.g., single asterisk). Rationale: people use surrounding
  // single asterisks pretty often in ordinary, non-MD text, and we don't want
  // to be annoying.
  // TODO: If we ever get really fancy with MD detection, the presence of light
  // emphasis should still contribute towards the determination.
  var emphasis = mdMaybe.match(/__([\s\S]+?)__(?!_)|\*\*([\s\S]+?)\*\*(?!\*)/);
  if (emphasis) {
    logMatch('emphasis', emphasis);
    return true;
  }

  // Headers. (But not hash-mark-H1, since that seems more likely to false-positive, and
  // less likely to be used. And underlines of at least length 5.)
  var header = mdMaybe.match(/(^\s{0,3}#{2,6}[^#])|(^\s*[-=]{5,}\s*$)/m);
  if (header) {
    logMatch('header', header);
    return true;
  }

  // Links
  // I'm worried about incorrectly catching square brackets in rendered code
  // blocks, so we're only going to look for '](' and '][' (which still aren't
  // immune to the problem, but a little better). This means we won't match
  // reference links (where the text in the square brackes is used elsewhere for
  // for the link).
  var link = mdMaybe.match(/\]\(|\]\[/);
  if (link) {
    logMatch('link', link);
    return true;
  }

  return false;
}


// Expose these functions
var CommonLogic = {};
CommonLogic.probablyWritingMarkdown = probablyWritingMarkdown;


var EXPORTED_SYMBOLS = ['CommonLogic'];

if (typeof module !== 'undefined') {
  module.exports = CommonLogic;
} else {
  this.CommonLogic = CommonLogic;
  this.EXPORTED_SYMBOLS = EXPORTED_SYMBOLS;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
