/*
 * Copyright Adam Pritchard 2015
 * MIT License : http://adampritchard.mit-license.org/
 */

/*
 * Utilities and helpers that are needed in multiple places.
 *
 * This module assumes that a global `window` is available.
 */

;(function() {

"use strict"
/*global module:false, chrome:false, safari:false*/


function consoleLog(logString) {
  if (typeof(console) !== 'undefined') {
    console.log(logString)
  }
  else {
    var consoleService = Components.classes['@mozilla.org/consoleservice;1']
                                   .getService(Components.interfaces.nsIConsoleService)
    consoleService.logStringMessage(String(logString))
  }
}

// TODO: Try to use `insertAdjacentHTML` for the inner and outer HTML functions.
// https://developer.mozilla.org/en-US/docs/Web/API/Element.insertAdjacentHTML

// Assigning a string directly to `element.innerHTML` is potentially dangerous:
// e.g., the string can contain harmful script elements. (Additionally, Mozilla
// won't let us pass validation with `innerHTML` assignments in place.)
// This function provides a safer way to append a HTML string into an element.
function saferSetInnerHTML(parentElem, htmlString) {
  // Jump through some hoops to avoid using innerHTML...

  var range = parentElem.ownerDocument.createRange()
  range.selectNodeContents(parentElem)

  var docFrag = range.createContextualFragment(htmlString)
  docFrag = sanitizeDocumentFragment(docFrag)

  range.deleteContents()
  range.insertNode(docFrag)
  range.detach()
}


// Approximating equivalent to assigning to `outerHTML` -- completely replaces
// the target element with `htmlString`.
// Note that some caveats apply that also apply to `outerHTML`:
// - The element must be in the DOM. Otherwise an exception will be thrown.
// - The original element has been removed from the DOM, but continues to exist.
//   Any references to it (such as the one passed into this function) will be
//   references to the original.
function saferSetOuterHTML(elem, htmlString) {
  if (!isElementinDocument(elem)) {
    throw new Error('Element must be in document')
  }

  var range = elem.ownerDocument.createRange()
  range.selectNode(elem)

  var docFrag = range.createContextualFragment(htmlString)
  docFrag = sanitizeDocumentFragment(docFrag)

  range.deleteContents()
  range.insertNode(docFrag)
  range.detach()
}


// Removes potentially harmful elements and attributes from `docFrag`.
// Returns a santized copy.
function sanitizeDocumentFragment(docFrag) {
  var i

  // Don't modify the original
  docFrag = docFrag.cloneNode(true)

  var scriptTagElems = docFrag.querySelectorAll('script')
  for (i = 0; i < scriptTagElems.length; i++) {
    scriptTagElems[i].parentNode.removeChild(scriptTagElems[i])
  }

  function cleanAttributes(node) {
    var i

    if (typeof(node.removeAttribute) === 'undefined') {
      // We can't operate on this node
      return
    }

    // Remove event handler attributes
    for (i = node.attributes.length-1; i >= 0; i--) {
      if (node.attributes[i].name.match(/^on/)) {
        node.removeAttribute(node.attributes[i].name)
      }
    }
  }

  walkDOM(docFrag.firstChild, cleanAttributes)

  return docFrag
}


// Walk the DOM, executing `func` on each element.
// From Crockford.
function walkDOM(node, func) {
  func(node)
  node = node.firstChild
  while(node) {
    walkDOM(node, func)
    node = node.nextSibling
  }
}


// Next three functions from: http://stackoverflow.com/a/1483487/729729
// Returns true if `node` is in `range`.
// NOTE: This function is broken in Postbox: https://github.com/adam-p/markdown-here/issues/179
function rangeIntersectsNode(range, node) {
  var nodeRange

  // adam-p: I have found that Range.intersectsNode gives incorrect results in
  // Chrome (but not Firefox). So we're going to use the fail-back code always,
  // regardless of whether the current platform implements Range.intersectsNode.
  /*
  if (range.intersectsNode) {
    return range.intersectsNode(node);
  }
  else {
    ...
  */

  nodeRange = node.ownerDocument.createRange()
  try {
    nodeRange.selectNode(node)
  }
  catch (e) {
    nodeRange.selectNodeContents(node)
  }

  // Workaround for this old Mozilla bug, which is still present in Postbox:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=665279
  var END_TO_START = node.ownerDocument.defaultView.Range.END_TO_START || window.Range.END_TO_START
  var START_TO_END = node.ownerDocument.defaultView.Range.START_TO_END || window.Range.START_TO_END

  return range.compareBoundaryPoints(
            END_TO_START,
            nodeRange) === -1 &&
         range.compareBoundaryPoints(
            START_TO_END,
            nodeRange) === 1
}


// Returns array of elements in selection.
function getSelectedElementsInDocument(doc) {
  var range, sel, containerElement
  sel = doc.getSelection()
  if (sel.rangeCount > 0) {
    range = sel.getRangeAt(0)
  }

  if (!range) {
    return []
  }

  return getSelectedElementsInRange(range)
}


// Returns array of elements in range
function getSelectedElementsInRange(range) {
  var elems = [], treeWalker, containerElement

  if (range) {
    containerElement = range.commonAncestorContainer
    if (containerElement.nodeType !== 1) {
      containerElement = containerElement.parentNode
    }

    elems = [treeWalker.currentNode]

    walkDOM(
      containerElement,
        function(node) {
          if (rangeIntersectsNode(range, node)) {
            elems.push(node)
          }
      })

    /*? if(platform!=='firefox' && platform!=='thunderbird'){ */
    /*
    // This code is probably superior, but TreeWalker is not supported by Postbox.
    // If this ends up getting used, it should probably be moved into walkDOM
    // (or walkDOM should be removed).

    treeWalker = doc.createTreeWalker(
        containerElement,
        range.commonAncestorContainerownerDocument.defaultView.NodeFilter.SHOW_ELEMENT,
        function(node) { return rangeIntersectsNode(range, node) ? range.commonAncestorContainerownerDocument.defaultView.NodeFilter.FILTER_ACCEPT : range.commonAncestorContainerownerDocument.defaultView.NodeFilter.FILTER_REJECT; },
        false
    );

    elems = [treeWalker.currentNode];
    while (treeWalker.nextNode()) {
      elems.push(treeWalker.currentNode);
    }
    */
    /*? } */
  }

  return elems
}


function isElementinDocument(element) {
  var doc = element.ownerDocument
  while (!!(element = element.parentNode)) {
    if (element === doc) {
      return true
    }
  }
  return false
}


// From: http://stackoverflow.com/a/3819589/729729
// Postbox doesn't support `node.outerHTML`.
function outerHTML(node, doc) {
  // if IE, Chrome take the internal method otherwise build one
  return node.outerHTML || (
    function(n){
        var div = doc.createElement('div'), h
        div.appendChild(n.cloneNode(true))
        h = div.innerHTML
        div = null
        return h
    })(node)
}


// From: http://stackoverflow.com/a/5499821/729729
var charsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}

function replaceChar(char) {
  return charsToReplace[char] || char
}

// An approximate equivalent to outerHTML for document fragments.
function getDocumentFragmentHTML(docFrag) {
  var html = '', i
  for (i = 0; i < docFrag.childNodes.length; i++) {
    var node = docFrag.childNodes[i]
    if (node.nodeType === node.TEXT_NODE) {
      html += node.nodeValue.replace(/[&<>]/g, replaceChar)
    }
    else { // going to assume ELEMENT_NODE
      html += outerHTML(node, docFrag.ownerDocument)
    }
  }

  return html
}


function isElementDescendant(parent, descendant) {
  var ancestor = descendant
  while (!!(ancestor = ancestor.parentNode)) {
    if (ancestor === parent) {
      return true
    }
  }

  return false
}

function makeRequestToPrivilegedScript(doc, requestObj, callback) {
  // If `callback` is undefined and we pass it anyway, Chrome complains with this:
  // Uncaught Error: Invocation of form extension.sendMessage(object, undefined, null) doesn't match definition extension.sendMessage(optional string extensionId, any message, optional function responseCallback)
  if (callback) {
    chrome.runtime.sendMessage(requestObj, callback)
  }
  else {
    chrome.runtime.sendMessage(requestObj)
  }
}

function makeRequestToBGScript(action, args) {
  /* Improved version of makeRequestToPrivilegedScript that doesn't know about
     callbacks and other stuff, just promises and some arguments.
   */
  if (args === undefined) {
    args = {}
  }
  let requestObj = {"action": action}
  try {
    Object.assign(requestObj, args)
  } catch(error) {
    console.log(error)
    return
  }
  return messenger.runtime.sendMessage(requestObj)
}

// Gets the URL of the top window that elem belongs to.
// May recurse up through iframes.
function getTopURL(win, justHostname) {
  if (win.frameElement) {
    // This is the window of an iframe
    return getTopURL(win.frameElement.ownerDocument.defaultView)
  }
  let url
  if (justHostname) {
    url = win.location.hostname
  }
  else {
    url = win.location.href
  }
  return url
}


/*
 * i18n/l10n
 */
// Get the translated string indicated by `messageID` with placeholder substitution.
// If the messageID is invalid, return null
function getMessage(messageID, subs=null) {
  let message = messenger.i18n.getMessage(messageID, subs)
  if (!message) {
    console.error('Could not find message ID: ' + messageID)
    return null
  }
  return message
}

// Returns true if `text` looks like raw Markdown, false otherwise.
function probablyWritingMarkdown(mdMaybe) {
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
    mdMaybe = mdMaybe.slice(0, 10000)
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
        '')

    if (log !== probablyWritingMarkdown.lastLog) {
      Utils.consoleLog(log)
      probablyWritingMarkdown.lastLog = log
    }
  }

  // At least two bullet points
  var bulletList = mdMaybe.match(/^[*+-] /mg)
  if (bulletList && bulletList.length > 1) {
    logMatch('bullet list', bulletList)
    return true
  }

  // Backticks == code. Does anyone use backticks for anything else?
  var backticks = mdMaybe.match(/`/)
  if (backticks) {
    logMatch('code', backticks)
    return true
  }

  // Math
  var math = mdMaybe.match(/`\$([^ \t\n\$]([^\$]*[^ \t\n\$])?)\$`/)
  if (math) {
    logMatch('math', math)
    return true
  }

  // We're going to look for strong emphasis (e.g., double asterisk), but not
  // light emphasis (e.g., single asterisk). Rationale: people use surrounding
  // single asterisks pretty often in ordinary, non-MD text, and we don't want
  // to be annoying.
  // TODO: If we ever get really fancy with MD detection, the presence of light
  // emphasis should still contribute towards the determination.
  var emphasis = mdMaybe.match(/__([\s\S]+?)__(?!_)|\*\*([\s\S]+?)\*\*(?!\*)/)
  if (emphasis) {
    logMatch('emphasis', emphasis)
    return true
  }

  // Headers. (But not hash-mark-H1, since that seems more likely to false-positive, and
  // less likely to be used. And underlines of at least length 5.)
  var header = mdMaybe.match(/(^\s{0,3}#{2,6}[^#])|(^\s*[-=]{5,}\s*$)/m)
  if (header) {
    logMatch('header', header)
    return true
  }

  // Links
  // I'm worried about incorrectly catching square brackets in rendered code
  // blocks, so we're only going to look for '](' and '][' (which still aren't
  // immune to the problem, but a little better). This means we won't match
  // reference links (where the text in the square brackes is used elsewhere for
  // for the link).
  var link = mdMaybe.match(/\]\(|\]\[/)
  if (link) {
    logMatch('link', link)
    return true
  }

  return false
}


/*****************************************************************************/
/*\
|*|
|*|  Base64 / binary data / UTF-8 strings utilities
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
|*|
\*/

/* Array of bytes to base64 string decoding */

function b64ToUint6 (nChr) {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0

}

function base64DecToArr (sBase64, nBlocksSize) {

  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen)

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
      }
      nUint24 = 0

    }
  }

  return taBytes
}

/* Base64 string to array encoding */

function uint6ToB64 (nUint6) {

  return nUint6 < 26 ?
      nUint6 + 65
    : nUint6 < 52 ?
      nUint6 + 71
    : nUint6 < 62 ?
      nUint6 - 4
    : nUint6 === 62 ?
      43
    : nUint6 === 63 ?
      47
    :
      65

}

function base64EncArr (aBytes) {

  var nMod3 = 2, sB64Enc = ""

  for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3
    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n" }
    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24)
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63))
      nUint24 = 0
    }
  }

  return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==')

}

/* UTF-8 array to DOMString and vice versa */

function utf8ArrToStr (aBytes) {

  var sView = ""

  for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
    nPart = aBytes[nIdx]
    sView += String.fromCharCode(
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
        /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
        (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
        (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
        (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
        (nPart - 192 << 6) + aBytes[++nIdx] - 128
      : /* nPart < 127 ? */ /* one byte */
        nPart
    )
  }

  return sView

}

function strToUTF8Arr (sDOMStr) {

  var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0

  /* mapping... */

  for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
    nChr = sDOMStr.charCodeAt(nMapIdx)
    nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6
  }

  aBytes = new Uint8Array(nArrLen)

  /* transcription... */

  for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
    nChr = sDOMStr.charCodeAt(nChrIdx)
    if (nChr < 128) {
      /* one byte */
      aBytes[nIdx++] = nChr
    } else if (nChr < 0x800) {
      /* two bytes */
      aBytes[nIdx++] = 192 + (nChr >>> 6)
      aBytes[nIdx++] = 128 + (nChr & 63)
    } else if (nChr < 0x10000) {
      /* three bytes */
      aBytes[nIdx++] = 224 + (nChr >>> 12)
      aBytes[nIdx++] = 128 + (nChr >>> 6 & 63)
      aBytes[nIdx++] = 128 + (nChr & 63)
    } else if (nChr < 0x200000) {
      /* four bytes */
      aBytes[nIdx++] = 240 + (nChr >>> 18)
      aBytes[nIdx++] = 128 + (nChr >>> 12 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 6 & 63)
      aBytes[nIdx++] = 128 + (nChr & 63)
    } else if (nChr < 0x4000000) {
      /* five bytes */
      aBytes[nIdx++] = 248 + (nChr >>> 24)
      aBytes[nIdx++] = 128 + (nChr >>> 18 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 12 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 6 & 63)
      aBytes[nIdx++] = 128 + (nChr & 63)
    } else /* if (nChr <= 0x7fffffff) */ {
      /* six bytes */
      aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824)
      aBytes[nIdx++] = 128 + (nChr >>> 24 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 18 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 12 & 63)
      aBytes[nIdx++] = 128 + (nChr >>> 6 & 63)
      aBytes[nIdx++] = 128 + (nChr & 63)
    }
  }

  return aBytes

}
/*****************************************************************************/
function utf8StringToBase64(str) {
  return base64EncArr(strToUTF8Arr(str))
}
function base64ToUTF8String(str) {
  return utf8ArrToStr(base64DecToArr(str))
}

/**
 * Trim a canvas. Based on
 * https://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
 *
 * @author Arjan Haverkamp (arjan at avoid dot org)
 * @param {CanvasRenderingContext2D} ctx A canvas context element to trim. This element will be trimmed (reference)
 * @returns {Object} Width and height of trimmed canvas and left-top coordinate of trimmed area. Example: {width:400, height:300, x:65, y:104}
 */
function trimCanvas(ctx) {
  let canvas = ctx.canvas,
      w = canvas.width, h = canvas.height,
      imageData = ctx.getImageData(0, 0, w, h),
      tlCorner = { x:w+1, y:h+1 },
      brCorner = { x:-1, y:-1 }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let pixel = (y * w + x) * 4
      let pixel_value = imageData.data[pixel] + imageData.data[pixel+1] + imageData.data[pixel+2] + imageData.data[pixel+3]
      if (pixel_value !== 1020) {
        tlCorner.x = Math.min(x, tlCorner.x)
        tlCorner.y = Math.min(y, tlCorner.y)
        brCorner.x = Math.max(x, brCorner.x)
        brCorner.y = Math.max(y, brCorner.y)
      }
    }
  }
  const width = brCorner.x - tlCorner.x + 6
  const height = brCorner.y - tlCorner.y + 6

  const cut = ctx.getImageData(tlCorner.x-3, tlCorner.y-3, width, height)

  canvas.width = width
  canvas.height = height

  ctx.putImageData(cut, 0, 0)

  return {width: width, height: height, x:tlCorner.x-3, y:tlCorner.y-3}
}

function SVG2PNG(svgImg, imgClass) {
  // Converts an SVG <img> to a PNG using the browser canvas
  svgImg.addEventListener("load", function(e) {
    let canvas = document.createElement("canvas")
    canvas.width = svgImg.width
    canvas.height = svgImg.height
    let ctx = canvas.getContext("2d")
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(svgImg, 0, 0)
    // The images produced by TeXZilla tend to have a lot of whitespace
    // around the actual formula, so trim it down like GCharts was
    const ctx_trim = trimCanvas(ctx)

    let pngDataURL = canvas.toDataURL("image/png")
    let pngImg = new Image()
    pngImg.width = ctx_trim.width
    pngImg.height = ctx_trim.height
    pngImg.alt = svgImg.alt
    pngImg.src = pngDataURL
    pngImg.classList.add(imgClass)
    svgImg.replaceWith(pngImg)
  })
}

function convertMathSVGs(wrapper_elem, selector="img.math_texzilla_svg",
    imgClass="math_texzilla") {
  const mathSVGs = wrapper_elem.querySelectorAll(selector)
  for (let svgImg of mathSVGs) {
    SVG2PNG(svgImg, imgClass)
  }
}

// Expose these functions

var Utils = {}

Utils.saferSetInnerHTML = saferSetInnerHTML
Utils.saferSetOuterHTML = saferSetOuterHTML
Utils.walkDOM = walkDOM
Utils.sanitizeDocumentFragment = sanitizeDocumentFragment
Utils.rangeIntersectsNode = rangeIntersectsNode
Utils.getDocumentFragmentHTML = getDocumentFragmentHTML
Utils.isElementDescendant = isElementDescendant
Utils.makeRequestToPrivilegedScript = makeRequestToPrivilegedScript
Utils.makeRequestToBGScript = makeRequestToBGScript
Utils.consoleLog = consoleLog
Utils.getTopURL = getTopURL
Utils.getMessage = getMessage
Utils.probablyWritingMarkdown = probablyWritingMarkdown
Utils.utf8StringToBase64 = utf8StringToBase64
Utils.base64ToUTF8String = base64ToUTF8String
Utils.SVG2PNG = SVG2PNG
Utils.convertMathSVGs = convertMathSVGs

var EXPORTED_SYMBOLS = ['Utils']

if (typeof module !== 'undefined') {
  module.exports = Utils
} else {
  this.Utils = Utils
  this.EXPORTED_SYMBOLS = EXPORTED_SYMBOLS
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global)
}())
