/*
 * Copyright JFX 2024
 * MIT License
 */

import { Textcomplete, ContenteditableEditor } from "./vendor/textcomplete.esm.js"
import Fuse from "./vendor/fuse.basic.mjs"

let _fuse = null

const loadEmoji = async () => {
  if (_fuse == null) {
    const _emojis = await messenger.runtime.sendMessage({ action: "fetch-emojis" })
    _fuse = new Fuse(_emojis, { keys: ["key"], includeMatches: true, includeScore: true })
  }
  return _fuse
}

async function gatherCandidates(term, limit = 10) {
  const fuse = await loadEmoji()
  const results = fuse.search(term)
  return results.slice(0, limit).map((obj) => [obj.item.key, obj.item.value])
}

const CODEBLOCK = /`{3}/g
const INLINECODE = /`/g

const EMOJI_STRATEGY = {
  id: "emoji",
  match: /\B:([-+\w]*)$/,
  search: async (term, callback) => {
    callback(await gatherCandidates(term))
  },
  replace: ([key]) => `:${key.replaceAll(" ", "_")}: `,
  template: ([key, emoji_unicode]) => `${emoji_unicode}&nbsp;<small>${key}</small>`,
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

export function init() {
  const editor = new ContenteditableEditor(document.body)
  const textcomplete = new Textcomplete(editor, [EMOJI_STRATEGY])

  textcomplete.dropdown.el.contentEditable = false
  textcomplete.dropdown.el.setAttribute("_moz_resizing", false)
  textcomplete.dropdown.el.popover = "auto"

  const destroy = function () {
    textcomplete.destroy()
  }

  return destroy
}
