#!/usr/bin/env node

import fs from "fs"
import path from "path"
import process from "node:process"
import { fileURLToPath } from "url"

function error(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function main(file, append_text) {
  if (!file) {
    error("Usage: dos2unix.js <input_file>")
  }
  const file_path = path.resolve(file)
  if (!fs.existsSync(file_path)) {
    error(`File not found: ${file_path}`)
  }

  console.log(`Appending ${append_text} to ${file_path}...`)
  const write_text = "\n\n" + append_text
  fs.appendFileSync(file_path, write_text)
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  main(process.argv[2], process.argv[3])
}
