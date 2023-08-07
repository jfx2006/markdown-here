/*
 * Copyright JFX 2023
 * MIT License
 */

import { fetchExtFile } from "../async_utils.mjs";

const EMOJI_SHORTCODES = "/data/emoji_codes.json"

export async function getEmojiShortcodes() {
  return fetchExtFile(EMOJI_SHORTCODES, true)
}

const emoji_shortcodes = getEmojiShortcodes().then((response) => response)
export default await emoji_shortcodes
