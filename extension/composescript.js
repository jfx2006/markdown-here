/*
 * Copyright Adam Pritchard 2013
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict"
/*global MdhHtmlToText:false */

function requestHandler(request, sender, sendResponse) {
  if (request.action === "request-preview") {
    return doRenderPreview()
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

messenger.runtime.sendMessage({ action: "compose-ready" }).then((response) => {
  if (response) {
    if (response.reply_position === "bottom") {
      let mailBody = window.document.body
      let firstChild = mailBody.firstElementChild
      if (firstChild.nodeName === "DIV" && firstChild.classList.contains("moz-cite-prefix")) {
        let insertElem
        if (response.use_paragraph) {
          insertElem = window.document.createElement("p")
          insertElem.appendChild(window.document.createElement("br"))
        } else {
          insertElem = window.document.createElement("br")
        }
        mailBody.insertAdjacentElement("afterbegin", insertElem)
      }
    }
  }
  doRenderPreview()
})

function elementCanBeRendered(elem) {
  // See here for more info about what we're checking:
  // http://stackoverflow.com/a/3333679/729729
  return (
    elem.contentEditable === true || (elem.ownerDocument && elem.ownerDocument.designMode === "on")
  )
}

function looksLikeMarkdown(body_copy) {
  // Selectors to find quoted content and signatures
  // Only look for elements directly below <body> to avoid problems with
  // nested quotes
  for (let selector of [
    "body > .moz-signature",
    "body > blockquote[type=cite]",
    "body > div.moz-cite-prefix",
    "body > div.moz-forward-container",
  ]) {
    let match_nodes = body_copy.querySelectorAll(selector)
    for (let node of match_nodes) {
      node.remove()
    }
  }
  let mdMaybe = new MdhHtmlToText.MdhHtmlToText(body_copy, null, true).get()
  return probablyWritingMarkdown(mdMaybe)
}

function probablyWritingMarkdown(mdMaybe) {
  /*
    This is going to be tricky and fraught with danger. Challenges:
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
    const log =
      "Markdown Here detected unrendered " +
      type +
      (typeof match.index !== "undefined"
        ? ': "' + mdMaybe.slice(match.index, match.index + 10) + '"'
        : "")

    if (log !== probablyWritingMarkdown.lastLog) {
      console.log(log)
      probablyWritingMarkdown.lastLog = log
    }
  }

  // At least two bullet points
  const bulletList = mdMaybe.match(/^[*+-] /gm)
  if (bulletList && bulletList.length > 1) {
    logMatch("bullet list", bulletList)
    return true
  }

  // Backticks == code. Does anyone use backticks for anything else?
  const backticks = mdMaybe.match(/`/)
  if (backticks) {
    logMatch("code", backticks)
    return true
  }

  // Math
  const math = mdMaybe.match(/`\$([^ \t\n$]([^$]*[^ \t\n$])?)\$`/)
  if (math) {
    logMatch("math", math)
    return true
  }

  // We're going to look for strong emphasis (e.g., double asterisk), but not
  // light emphasis (e.g., single asterisk). Rationale: people use surrounding
  // single asterisks pretty often in ordinary, non-MD text, and we don't want
  // to be annoying.
  // TODO: If we ever get really fancy with MD detection, the presence of light
  // emphasis should still contribute towards the determination.
  const emphasis = mdMaybe.match(/__([\s\S]+?)__(?!_)|\*\*([\s\S]+?)\*\*(?!\*)/)
  if (emphasis) {
    logMatch("emphasis", emphasis)
    return true
  }

  // Headers. (But not hash-mark-H1, since that seems more likely to false-positive, and
  // less likely to be used. And underlines of at least length 5.)
  const header = mdMaybe.match(/(^\s{0,3}#{2,6}[^#])|(^\s*[-=]{5,}\s*$)/m)
  if (header) {
    logMatch("header", header)
    return true
  }

  // Links
  // I'm worried about incorrectly catching square brackets in rendered code
  // blocks, so we're only going to look for '](' and '][' (which still aren't
  // immune to the problem, but a little better). This means we won't match
  // reference links (where the text in the square brackets is used elsewhere for
  // for the link).
  const link = mdMaybe.match(/\]\(|\]\[/)
  if (link) {
    logMatch("link", link)
    return true
  }

  return false
}

async function doRenderPreview() {
  try {
    const mdhHtmlToText = new MdhHtmlToText.MdhHtmlToText(window.document.body)
    const result_html = await messenger.runtime.sendMessage({
      action: "render-md",
      mdText: mdhHtmlToText.get(),
    })
    const renderedMarkdown = mdhHtmlToText.postprocess(result_html)
    const rv = await messenger.runtime.sendMessage({
      action: "cp.render-preview",
      payload: renderedMarkdown,
    })
    return rv
  } catch (reason) {
    console.log(`Error rendering preview. ${reason}`)
  }
}

let MsgMutationObserver
async function editorMutationCb(mutationList, observer) {
  return await doRenderPreview()
}

;(async () => {
  const mutation_config = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: true,
  }
  MsgMutationObserver = new MutationObserver(editorMutationCb)
  MsgMutationObserver.observe(window.document.body, mutation_config)
})()
