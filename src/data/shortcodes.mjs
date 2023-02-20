/*
 * Copyright JFX 2023
 * MIT License
 */

import { getEmojiShortcodes } from "../async_utils.mjs"

const emoji_shortcodes = getEmojiShortcodes().then((response) => response)
export default await emoji_shortcodes
