/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

// Removes any previously embedded "mdhr-raw" markdown-source dumps (see
// getMdhrRaw in compose_preview.js) found in a document, e.g. ones carried
// over from quoted/forwarded history. Without this, each reply in a thread
// re-embeds a fresh dump that still contains every prior dump nested inside
// its quoted content, so the hidden payload grows roughly quadratically with
// the number of replies (#82).
export function stripOldMdhrRaw(doc) {
  const rawElems = doc.querySelectorAll("div.mdhr-raw")
  for (const rawElem of rawElems) {
    rawElem.remove()
  }
  return doc
}
