#!/usr/bin/env node
/**
 * Build emoji_codes.json file for the marked-emoji plugin.
 * Uses emojibase-data to get the Github shortcodes.
 */

import fs from "node:fs";
import process from "node:process";

/**
 * 2764 --> \u2764
 * 1F1F7-1F1FC --> \u{1f1f7}\u{1f1fc}
 * @param {string} code
 * @returns {string}
 */
function ghUni2Char(code) {
  const codes = code.split("-");
  const char = codes
    .map((c) => String.fromCodePoint(parseInt(c, 16)))
    .join("");
  return char;
}

/**
 * @param {string} source
 * @param {string} dest
 */
function main(source, dest) {
  const rawData = fs.readFileSync(source, "utf8");
  const emojiData = JSON.parse(rawData);
  const emojiShortcuts = {};

  for (let [ghCode, shortcuts] of Object.entries(emojiData)) {
    if (typeof shortcuts === "string") {
      shortcuts = [shortcuts];
    }
    const entities = ghUni2Char(ghCode);
    for (const s of shortcuts) {
      emojiShortcuts[s] = entities;
    }
  }

  const sortedKeys = Object.keys(emojiShortcuts).sort((a, b) => {
    return a.localeCompare(b);
  });

  const sortedShortcuts = sortedKeys.reduce((acc, key) => {
    acc[key] = emojiShortcuts[key];
    return acc;
  }, {});

  fs.writeFileSync(dest, JSON.stringify(sortedShortcuts, null, 0), "utf8");
}

if (process.argv.length < 4) {
  console.error("Usage: node emoji-grab.js <source> <dest>");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);
