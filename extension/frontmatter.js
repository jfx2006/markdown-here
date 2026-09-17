/*
 * Copyright JFX 2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

// Removes a leading YAML frontmatter block (Jekyll/Hugo style) from markdown
// source. Such a block is not meaningful markdown content in an email, and a
// leading "---" line is otherwise misparsed by the markdown parser as a
// thematic break or a setext heading underline (#80).
//
// The block is only matched at the very start of the text, and only when a
// matching closing "---" delimiter line exists; otherwise the text is returned
// unchanged. The YAML itself is never parsed or interpreted.
const FRONTMATTER_RE = /^---[ \t]*\r?\n[\s\S]*?^---[ \t]*(?:\r?\n|$)/m

export function stripFrontmatter(mdText) {
  if (!mdText) {
    return mdText
  }
  const match = FRONTMATTER_RE.exec(mdText)
  if (!match || match.index !== 0) {
    return mdText
  }
  return mdText.slice(match[0].length)
}
