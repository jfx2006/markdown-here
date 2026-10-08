// Vendors third-party packages from node_modules/ into extension/.
// The VENDORED list below is the complete list of vendored libraries and how
// each one is produced.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import { rollup } from "rollup"
import nodeResolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, "..")
const EXTENSION = path.join(ROOT, "extension")

// A vendored library.
//   name          label used in build output
//   paths         { destination file name: source path inside the package }
//   nodePkg       package directory under node_modules/ (default: name)
//   vendorPrefix  directory under extension/ to write into (default: "vendor")
class VendoredPackage {
  constructor(name, paths, { nodePkg = name, vendorPrefix = "vendor" } = {}) {
    this.name = name
    this.paths = paths
    this.nodePkg = nodePkg
    this.vendorPrefix = vendorPrefix
  }

  srcPath(rel) {
    return path.join(ROOT, "node_modules", this.nodePkg, rel)
  }

  destPath(name) {
    return path.join(EXTENSION, this.vendorPrefix, name)
  }

  // The single [destination name, source path] pair, for one-file packages.
  get onlyPath() {
    const entries = Object.entries(this.paths)
    if (entries.length !== 1) {
      throw new Error(`${this.name}: expected exactly one path, got ${entries.length}`)
    }
    return entries[0]
  }

  async build() {
    throw new Error("Method build() must be implemented by subclasses")
  }

  // Removes outputs that live outside extension/vendor/, which vendorClean()
  // otherwise wipes wholesale. Subclasses that write extra files beyond
  // `paths` should call super.clean() and remove those too.
  async clean() {
    if (this.vendorPrefix === "vendor") return
    rm(...Object.keys(this.paths).map((name) => this.destPath(name)))
  }
}

// Copies each file as-is.
class CopyPackage extends VendoredPackage {
  async build() {
    for (const [name, rel] of Object.entries(this.paths)) {
      copyFile(this.srcPath(rel), this.destPath(name))
    }
  }
}

// Bundles each source as an ES module with an inline source map.
class RollupPackage extends VendoredPackage {
  async build() {
    for (const [name, rel] of Object.entries(this.paths)) {
      await rollupBuild(this.srcPath(rel), this.destPath(name), { sourcemap: "inline" })
    }
  }
}

class MarkedExtendedTables extends VendoredPackage {
  async build() {
    const [name, rel] = this.onlyPath
    const dest = this.destPath(name)
    copyFile(this.srcPath(rel), dest)
    runNode("dos2unix.js", [dest])
  }
}

class PapaParse extends VendoredPackage {
  async build() {
    // PapaParse's Node Duplex-stream mode does a lazy `require('stream')`
    // that we never exercise (we only parse strings). A plain rollup build
    // would hoist it into a static `import ... from 'stream'`, which doesn't
    // resolve in a WebExtension context, so tell commonjs to leave it as a
    // runtime require instead (dead code for us).
    // No source map: commonjs puts the absolute build path in it, which would
    // leak into the XPI and make the file differ between build directories.
    const [name, rel] = this.onlyPath
    await rollupBuild(this.srcPath(rel), this.destPath(name), {
      commonjsOptions: { ignore: ["stream"] },
    })
  }
}

class HighlightJs extends VendoredPackage {
  async build() {
    const [name, rel] = this.onlyPath
    await rollupBuild(this.srcPath(rel), this.destPath(name))
    runNode("highlightjs_styles.js", [
      path.join("node_modules", this.nodePkg, "styles"),
      path.join("extension", this.vendorPrefix, "styles"),
    ])
  }

  async clean() {
    await super.clean()
    rm(path.join("extension", this.vendorPrefix, "styles", "*.css"))
  }
}

class TextComplete extends VendoredPackage {
  async build() {
    // bundle-textcomplete.mjs locates its own sources.
    const [name] = this.onlyPath
    runNode("bundle-textcomplete.mjs", [this.destPath(name)])
  }
}

class EmojiCodes extends VendoredPackage {
  async build() {
    const [name, rel] = this.onlyPath
    runNode("emoji-grab.js", [this.srcPath(rel), this.destPath(name)])
  }
}

class TeXZilla extends VendoredPackage {
  async build() {
    const [name, rel] = this.onlyPath
    const dest = this.destPath(name)
    copyFile(this.srcPath(rel), dest)
    runNode("fileappend.js", [dest, "export default TeXZilla"])
  }
}

// Built from the in-repo ./mailext-options-sync package (which package.json
// installs as @jfx2006/mailext-options-sync) rather than from node_modules/.
class MailextOptionsSync extends VendoredPackage {
  static PKG_DIR = "mailext-options-sync"

  async build() {
    const [name] = this.onlyPath
    rollupCli(["-c", path.join(MailextOptionsSync.PKG_DIR, "rollup.config.js")])
    copyFile(path.join(ROOT, MailextOptionsSync.PKG_DIR, "index.js"), this.destPath(name))
  }

  async clean() {
    await super.clean()
    rm(path.join(MailextOptionsSync.PKG_DIR, "index.js"))
  }
}

const VENDORED = [
  new CopyPackage("marked", { "marked.esm.js": "lib/marked.esm.js" }),
  new RollupPackage("marked-linkify-it", { "marked-linkify-it.esm.js": "src/index.js" }),
  new CopyPackage("marked-highlight", { "marked-highlight.esm.js": "src/index.js" }),
  new MarkedExtendedTables("marked-extended-tables", {
    "marked-extended-tables.esm.js": "src/index.js",
  }),
  new CopyPackage("marked-emoji", { "marked-emoji.esm.js": "src/index.js" }),
  new RollupPackage("degausser", { "degausser.esm.js": "src/degausser.js" }),
  new PapaParse("papaparse", { "papaparse.esm.js": "papaparse.js" }),
  new HighlightJs(
    "highlightjs",
    { "highlightjs.esm.js": "es/common.js" },
    { nodePkg: "highlight.js", vendorPrefix: "highlightjs" },
  ),
  new CopyPackage("turndown", { "turndown.esm.js": "lib/turndown.browser.es.js" }),
  new TextComplete(
    "textcomplete",
    { "textcomplete.js": "contenteditable/src/index.ts" },
    { nodePkg: "@textcomplete" },
  ),
  new EmojiCodes(
    "emoji_codes",
    { "emoji_codes.json": "en/shortcodes/github.json" },
    { nodePkg: "emojibase-data", vendorPrefix: "data" },
  ),
  new CopyPackage("dompurify", { "purify.es.mjs": "dist/purify.es.mjs" }),
  new CopyPackage("bootstrap", { "bootstrap.bundle.js": "dist/js/bootstrap.bundle.js" }),
  new CopyPackage("bootswatch", { "bootswatch.css": "dist/darkly/bootstrap.css" }),
  new TeXZilla("texzilla", { "TeXZilla.js": "TeXZilla.js" }),
  new MailextOptionsSync(
    "mailext-options-sync",
    { "mailext-options-sync.js": "index.ts" },
    { vendorPrefix: "options" },
  ),
]

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

async function rollupBuild(src, dest, { sourcemap = false, commonjsOptions } = {}) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  const bundle = await rollup({
    input: src,
    plugins: [nodeResolve(), commonjs(commonjsOptions)],
  })
  await bundle.write({ format: "es", file: dest, sourcemap })
  await bundle.close()
}

function runNode(scriptRel, args) {
  execFileSync(process.execPath, [path.join(HERE, scriptRel), ...args], {
    cwd: ROOT,
    stdio: "inherit",
  })
}

function rollupCli(args) {
  const rollupBin = path.join(ROOT, "node_modules", "rollup", "dist", "bin", "rollup")
  execFileSync(process.execPath, [rollupBin, ...args], { cwd: ROOT, stdio: "inherit" })
}

function rm(...paths) {
  execFileSync(process.execPath, [path.join(HERE, "rm.js"), "--force", ...paths], {
    cwd: ROOT,
    stdio: "inherit",
  })
}

export async function vendorAll() {
  for (const pkg of VENDORED) {
    console.log(`vendoring ${pkg.name}...`)
    await pkg.build()
  }
}

export async function vendorClean() {
  rm(path.join("extension", "vendor", "*"))
  for (const pkg of VENDORED) {
    await pkg.clean()
  }
}
