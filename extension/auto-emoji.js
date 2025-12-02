/*
 * Copyright JFX 2024-2025
 * MIT License
 */

/* global Textcomplete */

// eslint-disable-next-line no-unused-vars
const autoEmoji = (function () {
  let _emojis = null

  async function loadEmoji() {
    if (_emojis === null) {
      _emojis = await messenger.runtime.sendMessage({ action: "fetch-emojis" })
    }
    return _emojis
  }

  async function gatherCandidates(term, limit = 10) {
    const emojis = await loadEmoji()
    term = term.toLowerCase()
    const results = emojis.filter((k) => k[0].includes(term))
    return results.slice(0, limit)
  }

  const CODEBLOCK = /`{3}/g
  const INLINECODE = /`/g

  const EMOJI_STRATEGY = {
    id: "emoji",
    match: /\B:([-+\w]*)$/,
    search: async (term, callback) => {
      callback(await gatherCandidates(term))
    },
    replace: ([key]) => `:${key}: `,
    template: ([key, emoji_unicode]) =>
      `${emoji_unicode}&nbsp;<small>${key.replaceAll("_", " ")}</small>`,
    context: (text) => {
      const blockmatch = text.match(CODEBLOCK)
      if (blockmatch && blockmatch.length % 2) {
        // Cursor is in a code block
        return false
      }
      const inlinematch = text.match(INLINECODE)
      if (inlinematch && inlinematch.length % 2) {
        // Cursor is in a inline code
        return false
      }
      return true
    },
  }

  let textcomplete

  function init() {
    if (!textcomplete) {
      const editor = new Textcomplete.ContenteditableEditor(document.body)
      textcomplete = new Textcomplete.Textcomplete(editor, [EMOJI_STRATEGY])

      textcomplete.dropdown.el.contentEditable = false
      textcomplete.dropdown.el.setAttribute("_moz_resizing", false)
      textcomplete.dropdown.el.popover = "auto"
    }

    const domElem = document.querySelector("ul.dropdown-menu.textcomplete-dropdown")
    if (!domElem) {
      document.body.appendChild(textcomplete.el)
    }
    const destroy = function () {
      textcomplete.destroy()
    }

    return destroy
  }

  return {
    init: init,
  }
})()
