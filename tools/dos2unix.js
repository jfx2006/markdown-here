#!/usr/bin/env node

import fs from "fs"
import path from "path"
import process from "node:process"
import { fileURLToPath } from "url"

function error(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function main(file) {
  if (!file) {
    error("Usage: dos2unix.js <input_file>")
  }
  const file_path = path.resolve(file)
  if (!fs.existsSync(file_path)) {
    error(`File not found: ${file_path}`)
  }

  const content = fs.readFileSync(file, "utf8")
  console.log(`Converting ${file_path} to Unix line endings...`)
  fs.writeFileSync(file, Buffer.from(content.replace(/\r\n/g, "\n"), "utf8"))
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  main(process.argv[2])
}
