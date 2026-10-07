#!/usr/bin/env node
/*
 * Pre-release consistency checks (plain Node, no dependencies).
 * Usage: npm run check:build. Exits non-zero if any check fails.
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const EXT = path.join(ROOT, "extension")

const errors = []
const rel = (p) => path.relative(ROOT, p)
const read = (p) => readFileSync(p, "utf8")

// 1. Both CHANGELOG copies must be identical.
function checkChangelogCopies() {
  const top = path.join(ROOT, "CHANGELOG.md")
  const copy = path.join(EXT, "CHANGELOG.md")
  if (read(top) !== read(copy)) {
    errors.push(`${rel(top)} and ${rel(copy)} differ (copy CHANGELOG.md into extension/).`)
  }
}

// 2. The manifest version must have a CHANGELOG section.
function checkChangelogVersion(manifest) {
  const version = manifest.version
  const changelog = read(path.join(ROOT, "CHANGELOG.md"))
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  if (!new RegExp(`^## \\[${escaped}\\]`, "m").test(changelog)) {
    errors.push(`manifest version ${version} has no "## [${version}]" heading in CHANGELOG.md.`)
  }
}

// 3. strict_min_version must not exceed strict_max_version (major version).
function checkGeckoVersions(manifest) {
  const gecko = manifest.browser_specific_settings?.gecko || manifest.applications?.gecko || {}
  const { strict_min_version: min, strict_max_version: max } = gecko
  if (!min || !max) {
    return
  }
  const minMajor = parseInt(min, 10)
  const maxMajor = parseInt(max, 10)
  if (Number.isNaN(minMajor) || Number.isNaN(maxMajor)) {
    errors.push(`cannot parse strict_min_version "${min}" / strict_max_version "${max}".`)
  } else if (minMajor > maxMajor) {
    errors.push(
      `strict_min_version ${min} (major ${minMajor}) is greater than strict_max_version ${max} (major ${maxMajor}).`,
    )
  }
}

// 4. No inline source map embedding an absolute build machine path.
// A drive letter must stand alone (so "links:\n" in a comment does not match).
const ABS_PATH_RE = /(\/home\/|\/media\/|\/tmp\/|\/builds\/|(?<![A-Za-z0-9])[A-Za-z]:\\)/
const INLINE_MAP_RE = /sourceMappingURL=data:([^,\s]*),([^\s*'"]+)/g

function listFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    if (statSync(p).isDirectory()) {
      out.push(...listFiles(p))
    } else {
      out.push(p)
    }
  }
  return out
}

function decodeInlineMap(meta, payload) {
  try {
    if (meta.split(";").includes("base64")) {
      return Buffer.from(payload, "base64").toString("utf8")
    }
    return decodeURIComponent(payload)
  } catch {
    return ""
  }
}

function checkInlineSourceMaps() {
  const files = [
    ...listFiles(path.join(EXT, "vendor")),
    ...readdirSync(path.join(EXT, "highlightjs"))
      .filter((n) => n.endsWith(".esm.js"))
      .map((n) => path.join(EXT, "highlightjs", n)),
  ]
  for (const file of files) {
    const text = read(file)
    if (!text.includes("sourceMappingURL=data:")) {
      continue
    }
    for (const [, meta, payload] of text.matchAll(INLINE_MAP_RE)) {
      // The path may be plain or base64-encoded in the map.
      const decoded = decodeInlineMap(meta, payload)
      const match = decoded.match(ABS_PATH_RE) || payload.match(ABS_PATH_RE)
      if (match) {
        const idx = decoded.indexOf(match[0])
        const sample = idx >= 0 ? decoded.slice(idx, idx + 80).split('"')[0] : match[0]
        errors.push(
          `${rel(file)} embeds an inline source map with an absolute path (e.g. "${sample}"). Rebuild it without inline source maps.`,
        )
        break
      }
    }
  }
}

const manifest = JSON.parse(read(path.join(EXT, "manifest.json")))
checkChangelogCopies()
checkChangelogVersion(manifest)
checkGeckoVersions(manifest)
checkInlineSourceMaps()

if (errors.length) {
  console.error(`check:build: ${errors.length} problem(s) found`)
  for (const e of errors) {
    console.error(`  - ${e}`)
  }
  process.exit(1)
}
console.log("check:build: OK")
