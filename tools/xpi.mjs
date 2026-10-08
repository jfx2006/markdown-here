// Packages extension/ into web-ext-artifacts/markdown-here-revival.xpi.
// Replaces `web-ext build` (dropped from devDependencies: its dependency tree
// carries unfixed high-severity npm audit findings that ATN rejects).
// Reproduces web-ext's file selection: `ignoreFiles` from web-ext-config.mjs
// plus web-ext's default ignores. The archive is deterministic: entries in
// sorted order with a fixed timestamp, so the same tree gives the same bytes.
// Requires Node >= 22.2 for zlib.crc32.

import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, "..")
const SOURCE = path.join(ROOT, "extension")
const ARTIFACTS = path.join(ROOT, "web-ext-artifacts")
const XPI_NAME = "markdown-here-revival.xpi"

// web-ext's built-in ignores (dotfiles, archives, node_modules, artifacts)
// plus editor backup files.
const DEFAULT_IGNORES = [
  "**/.*",
  "**/.*/**",
  "**/*.xpi",
  "**/*.zip",
  "**/*~",
  "**/node_modules",
  "**/node_modules/**",
  "**/web-ext-artifacts",
  "**/web-ext-artifacts/**",
]

// Minimal glob -> RegExp: "**/" any leading dirs, "/**" anything below,
// "*" any run of characters except "/". Enough for web-ext ignoreFiles.
function globToRegExp(glob) {
  let re = ""
  for (let i = 0; i < glob.length; i++) {
    if (glob.startsWith("**/", i)) {
      re += "(?:.*/)?"
      i += 2
    } else if (glob.startsWith("/**", i) && i + 3 === glob.length) {
      re += "(?:/.*)?"
      i += 2
    } else if (glob.startsWith("**", i)) {
      re += ".*"
      i += 1
    } else if (glob[i] === "*") {
      re += "[^/]*"
    } else if (glob[i] === "?") {
      re += "[^/]"
    } else {
      re += glob[i].replace(/[.+^${}()|[\]\\]/g, "\\$&")
    }
  }
  return new RegExp(`^${re}$`)
}

async function loadIgnorePatterns() {
  const configFile = path.join(ROOT, "web-ext-config.mjs")
  const { default: config } = await import(pathToFileURL(configFile).href)
  return [...DEFAULT_IGNORES, ...(config.ignoreFiles ?? [])].map(globToRegExp)
}

// Walks `dir` and returns archive-relative paths (forward slashes), with
// directories suffixed by "/". Ignored directories are not descended into.
function collectEntries(dir, ignores, prefix = "") {
  const entries = []
  const names = fs.readdirSync(dir, { withFileTypes: true })
  for (const dirent of names) {
    const rel = prefix + dirent.name
    if (ignores.some((re) => re.test(rel))) continue
    if (dirent.isDirectory()) {
      entries.push(`${rel}/`)
      entries.push(...collectEntries(path.join(dir, dirent.name), ignores, `${rel}/`))
    } else if (dirent.isFile()) {
      entries.push(rel)
    }
  }
  return entries
}

// Fixed DOS timestamp: 1980-01-01 00:00:00.
const DOS_TIME = 0
const DOS_DATE = (1 << 5) | 1
const FLAG_UTF8 = 0x0800
const METHOD_STORED = 0
const METHOD_DEFLATE = 8

// Builds a ZIP archive (no ZIP64; fine for an extension-sized tree).
function buildZip(entries, sourceDir) {
  const chunks = []
  const central = []
  let offset = 0

  for (const name of entries) {
    const isDir = name.endsWith("/")
    const data = isDir ? Buffer.alloc(0) : fs.readFileSync(path.join(sourceDir, name))
    const deflated = isDir ? data : zlib.deflateRawSync(data, { level: 9 })
    // Keep the stored form when compression does not help (images, empty files).
    const useDeflate = deflated.length < data.length
    const body = useDeflate ? deflated : data
    const method = useDeflate ? METHOD_DEFLATE : METHOD_STORED
    const crc = zlib.crc32(data)
    const nameBuf = Buffer.from(name, "utf8")

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // version needed
    local.writeUInt16LE(FLAG_UTF8, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28) // extra length
    chunks.push(local, nameBuf, body)

    const header = Buffer.alloc(46)
    header.writeUInt32LE(0x02014b50, 0)
    header.writeUInt16LE(20, 4) // version made by
    header.writeUInt16LE(20, 6) // version needed
    header.writeUInt16LE(FLAG_UTF8, 8)
    header.writeUInt16LE(method, 10)
    header.writeUInt16LE(DOS_TIME, 12)
    header.writeUInt16LE(DOS_DATE, 14)
    header.writeUInt32LE(crc, 16)
    header.writeUInt32LE(body.length, 20)
    header.writeUInt32LE(data.length, 24)
    header.writeUInt16LE(nameBuf.length, 28)
    // extra length, comment length, disk number, internal attributes: 0
    header.writeUInt32LE(isDir ? 0x10 : 0, 38) // MS-DOS directory attribute
    header.writeUInt32LE(offset, 42)
    central.push(header, nameBuf)

    offset += local.length + nameBuf.length + body.length
  }

  const centralBuf = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, centralBuf, end])
}

export async function buildXpi() {
  const ignores = await loadIgnorePatterns()
  const entries = collectEntries(SOURCE, ignores).sort()
  if (!entries.includes("manifest.json")) {
    throw new Error(`manifest.json not found in ${SOURCE}`)
  }
  fs.mkdirSync(ARTIFACTS, { recursive: true })
  const dest = path.join(ARTIFACTS, XPI_NAME)
  fs.writeFileSync(dest, buildZip(entries, SOURCE))
  console.log(`Built ${path.relative(ROOT, dest)} (${entries.length} entries)`)
}
