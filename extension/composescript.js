/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

"use strict"

let previewHidden = null
let MdhrMangle

function requestHandler(request, sender, sendResponse) {
  if (request.action === "request-preview") {
    return doRenderPreview()
  } else if (request.action === "md-preview-toggle") {
    previewHidden = request.value
    if (!previewHidden) {
      const scrolled = window.document.scrollingElement
      composeScroll(scrolled).then(() => {})
    }
  } else if (request.action === "check-forgot-render") {
    const body_copy = window.document.cloneNode(true)
    return Promise.resolve(looksLikeMarkdown(body_copy))
  } else if (request.action === "get-md-source") {
    return getMdText()
  }
}
messenger.runtime.onMessage.addListener(requestHandler)

function base64ToStr(base64) {
  const binString = atob(base64)
  const arr = Uint8Array.from(binString, (m) => m.codePointAt(0))
  return new TextDecoder().decode(arr)
}

async function loadOldMarkdown() {
  const DOMPurify = await import(messenger.runtime.getURL("../vendor/purify.es.js"))

  function escapeHTML(strings, html) {
    return `${DOMPurify.default.sanitize(html)}`
  }

  const mailBody = window.document.body
  const rawMDHR = mailBody.querySelectorAll(".mdhr-raw")
  for (const raw of rawMDHR) {
    const data = raw.title.substring(4)
    const origMD = base64ToStr(data)
    mailBody.innerHTML = escapeHTML`${origMD}`
  }
}

messenger.runtime.sendMessage({ action: "compose-data" }).then((response) => {
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
  return doRenderPreview()
})

async function looksLikeMarkdown(msgDocument) {
  const mdHtmlToText = new MdhrMangle.MdhrMangle(msgDocument)
  let mdMaybe = await mdHtmlToText.preprocess()
  // Ensure that we're not checking on enormous amounts of text.
  if (mdMaybe.length > 10000) {
    mdMaybe = mdMaybe.slice(0, 10000)
  }
  // At least two bullet points
  const bulletList = mdMaybe.match(/^[*+-] /gm)
  if (bulletList && bulletList.length > 1) {
    return true
  }

  // Backticks == code. Does anyone use backticks for anything else?
  const backticks = mdMaybe.match(/`/)
  if (backticks) {
    return true
  }

  // Math
  const math = mdMaybe.match(/\$([^ \t\n$]([^$]*[^ \t\n$])?)\$/)
  if (math) {
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
    return true
  }

  // Headers. (But not hash-mark-H1, since that seems more likely to false-positive, and
  // less likely to be used. And underlines of at least length 5.)
  const header = mdMaybe.match(/(^\s{0,3}#{2,6}[^#])|(^\s*[-=]{5,}\s*$)/m)
  if (header) {
    return true
  }

  // Links
  // I'm worried about incorrectly catching square brackets in rendered code
  // blocks, so we're only going to look for '](' and '][' (which still aren't
  // immune to the problem, but a little better). This means we won't match
  // reference links (where the text in the square brackes is used elsewhere for
  // for the link).
  const link = mdMaybe.match(/\]\(|\]\[/)
  if (link) {
    return true
  }

  return false
}

async function getMdText() {
  const body_copy = window.document.cloneNode(true)
  const mdHtmlToText = new MdhrMangle.MdhrMangle(body_copy)
  const pre_process = await mdHtmlToText.preprocess()
  return mdHtmlToText.postprocess(pre_process)
}

async function doRenderPreview() {
  const msgDocument = window.document.cloneNode(true)

  let finalHTML
  try {
    const mdHtmlToText = new MdhrMangle.MdhrMangle(msgDocument)
    const mdText = await mdHtmlToText.preprocess()
    const result_html = await messenger.runtime.sendMessage({
      action: "render-md",
      mdText: mdText,
    })
    finalHTML = mdHtmlToText.postprocess(result_html)
  } catch (reason) {
    console.log(`Error rendering markdown. ${reason}`)
    return
  }
  await sendToPreview(finalHTML)
}

async function sendToPreview(finalHTML, attempts = 1) {
  // Called by doRenderPreview
  try {
    return await messenger.runtime.sendMessage({
      action: "cp.render-preview",
      payload: finalHTML,
    })
  } catch (reason) {
    if (!reason.message.includes("contentDiv") && attempts > 0) {
      // Not sure about this error. Throw
      throw new Error(reason)
    }
    console.log(`Error sending HTML to preview. ${reason}. Retrying`)
    await sendToPreview(finalHTML, 0)
  }
}

let currentlyScrolling = null

function calculateScrollPercentage(elem) {
  const scrolledAvbSpace = elem.scrollHeight - elem.clientHeight
  const scrolledAmount = elem.scrollTop * (1 + elem.clientHeight / scrolledAvbSpace)
  return scrolledAmount / elem.scrollHeight
}

function debounce(cb, wait = 1000) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => cb(...args), wait)
  }
}

const clearCurrentlyScrolling = debounce(() => {
  currentlyScrolling = null
}, 1000)

async function composeScroll(scrolled) {
  const percentage = calculateScrollPercentage(scrolled)
  if (currentlyScrolling && currentlyScrolling !== scrolled) {
    return
  }
  currentlyScrolling = scrolled
  await messenger.runtime.sendMessage({
    action: "cp.scroll-to",
    payload: { percentage: percentage },
  })
  clearCurrentlyScrolling()
}

window.addEventListener(
  "scroll",
  async function (e) {
    if (previewHidden) {
      return
    }
    const scrolled = e.target.scrollingElement
    await composeScroll(scrolled)
  },
  { capture: true, passive: true },
)

let MsgMutationObserver
async function editorMutationCb(mutationList, observer) {
  if (previewHidden) {
    return
  }
  if (mutationList.type === "attributes" && mutationList.target.nodeName !== "IMG") {
    return
  }
  return await doRenderPreview()
}

async function loadEmojiCompleter() {
  const Oimport = await import(messenger.runtime.getURL("/options/options-storage.js"))
  const OptionsStore = Oimport.OptionsStore
  const emojiCompleterEnabled = await OptionsStore.get("emoji-autocomplete-enabled")
  if (
    emojiCompleterEnabled["emoji-autocomplete-enabled"] === "true" ||
    emojiCompleterEnabled["emoji-autocomplete-enabled"] === true
  ) {
    const autoEmoji = await import(messenger.runtime.getURL("./auto-emoji.js"))
    return autoEmoji.init()
  }
  return null
}

// eslint-disable-next-line no-unused-vars
let emojiDestroy
;(async () => {
  await loadOldMarkdown()
  MdhrMangle = await import(messenger.runtime.getURL("/mdhr-mangle.js"))
  const mutation_config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  }
  MsgMutationObserver = new MutationObserver(editorMutationCb)
  MsgMutationObserver.observe(window.document.body, mutation_config)
  emojiDestroy = await loadEmojiCompleter()
})()
