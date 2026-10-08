#!/usr/bin/env node
// Top-level build orchestrator. Replaces the root Makefile.
// Usage: node tools/build.mjs <task>

import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

// Loaded lazily because vendor.mjs pulls in rollup from node_modules.
function loadVendor() {
  return import("./vendor.mjs")
}

function loadXpi() {
  return import("./xpi.mjs")
}

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, "..")

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts })
}

function npm(args) {
  run("npm", args, { shell: true })
}

function rmrf(...paths) {
  run(process.execPath, [path.join(HERE, "rm.js"), "--force", "--recursive", ...paths])
}

let pythonCmdCache
function pythonCmd() {
  if (pythonCmdCache) return pythonCmdCache

  for (const candidate of ["python", "python3"]) {
    try {
      execFileSync(candidate, ["--version"], { stdio: "ignore" })
      pythonCmdCache = candidate
      return candidate
    } catch {
      // try the next candidate
    }
  }
  throw new Error("Could not find a Python interpreter (tried: python, python3)")
}

const tasks = {
  install() {
    npm(["clean-install"])
  },

  async vendored() {
    const { vendorAll } = await loadVendor()
    await vendorAll()
  },

  async vendoredClean() {
    const { vendorClean } = await loadVendor()
    await vendorClean()
  },

  async xpi() {
    const { buildXpi } = await loadXpi()
    await buildXpi()
  },

  async build() {
    await tasks.xpi()
  },

  async all() {
    tasks.install()
    await tasks.vendored()
    await tasks.build()
  },

  async clean() {
    if (existsSync(path.join(ROOT, "node_modules"))) {
      await tasks.vendoredClean()
    }
    rmrf("node_modules", "mailext-options-sync/node_modules")
  },

  checkClean() {
    run(process.execPath, [path.join(HERE, "check-clean.js")])
  },

  async ci() {
    await tasks.clean()
    tasks.install()
    await tasks.vendored()
    await tasks.build()
    run(pythonCmd(), [path.join(HERE, "rel_notes.py")])
    run(pythonCmd(), [path.join(HERE, "version_env.py")])
  },
}

async function main() {
  const task = process.argv[2]
  if (!task || !tasks[task]) {
    console.error(`Usage: node tools/build.mjs <task>`)
    console.error(`Valid tasks: ${Object.keys(tasks).join(", ")}`)
    process.exit(1)
  }
  await tasks[task]()
}

await main()
