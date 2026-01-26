#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

/**
 * Converts a filename into a pretty name.
 * e.g., "dark-mode.css" -> "Dark Mode"
 * @param {string} n
 * @returns {string}
 */
function mkname(n) {
  let name = path.parse(n).name
  name = name.replace(/-/g, " ")
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Copies CSS files from source to destination and generates a styles.json mapping.
 * @param {string} sourceDir
 * @param {string} destDir
 */
function main(sourceDir, destDir) {
  if (!sourceDir || !destDir) {
    console.error("Usage: highlightjs_styles.js <source_dir> <dest_dir>")
    process.exit(1)
  }

  const sourcePath = path.resolve(sourceDir)
  const destPath = path.resolve(destDir)

  // Ensure destDir exists
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true })
  }

  // Remove existing CSS files in destDir
  const existingFiles = fs.readdirSync(destPath)
  for (const file of existingFiles) {
    if (file.endsWith(".css")) {
      fs.unlinkSync(path.join(destPath, file))
    }
  }

  // Ensure .gitkeep exists
  const gitkeepPath = path.join(destPath, ".gitkeep")
  if (!fs.existsSync(gitkeepPath)) {
    fs.closeSync(fs.openSync(gitkeepPath, "w"))
  }

  const cssFiles = fs.readdirSync(sourcePath).filter((file) => {
    return file.endsWith(".css") && !file.endsWith(".min.css")
  })

  const res = {}
  for (const file of cssFiles) {
    fs.copyFileSync(path.join(sourcePath, file), path.join(destPath, file))
    const name = mkname(file)
    res[name] = file
  }

  // Write styles.json
  const stylesJsonPath = path.join(destPath, "styles.json")
  const sortedRes = Object.keys(res)
    .sort()
    .reduce((obj, key) => {
      obj[key] = res[key]
      return obj
    }, {})

  fs.writeFileSync(stylesJsonPath, JSON.stringify(sortedRes, null, 2))
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  main(process.argv[2], process.argv[3])
}
