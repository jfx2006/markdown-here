/*
 * Minimal environment to run the DOM-free unit tests of extension/test/
 * under Node (mocha CLI).
 *
 * Provides: window = globalThis, `expect` (vendored chai), an in-memory
 * `messenger`/`browser` stub, and a fetch that serves extension URLs from
 * the extension/ directory.
 */

import { readFile } from "node:fs/promises"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

const EXT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../extension")
const EXT_BASE = "moz-extension://mdhr-node-test/"

globalThis.window = globalThis

// Vendored chai is a UMD build: without `module`/`exports` it attaches to window.chai.
const chaiPath = path.join(EXT_DIR, "test/chai.js")
vm.runInThisContext(readFileSync(chaiPath, "utf8"), { filename: chaiPath })
globalThis.chai.config.truncateThreshold = 0
globalThis.expect = globalThis.chai.expect

const manifest = JSON.parse(readFileSync(path.join(EXT_DIR, "manifest.json"), "utf8"))
const messages = JSON.parse(readFileSync(path.join(EXT_DIR, "_locales/en/messages.json"), "utf8"))

function makeEvent() {
  const listeners = new Set()
  return {
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
    hasListener: (fn) => listeners.has(fn),
    _fire: (...args) => listeners.forEach((fn) => fn(...args)),
  }
}

const onChanged = makeEvent()

// In-memory storage area following WebExtensions get() semantics
// (null/undefined, string, array, or object of default values).
function makeStorageArea(areaName) {
  const data = new Map()
  const notify = (changes) => {
    if (Object.keys(changes).length) {
      onChanged._fire(changes, areaName)
    }
  }
  return {
    async get(keys) {
      const clone = (v) => structuredClone(v)
      if (keys === null || keys === undefined) {
        return Object.fromEntries([...data].map(([k, v]) => [k, clone(v)]))
      }
      if (typeof keys === "string") {
        keys = [keys]
      }
      const result = {}
      if (Array.isArray(keys)) {
        for (const k of keys) {
          if (data.has(k)) {
            result[k] = clone(data.get(k))
          }
        }
      } else {
        for (const [k, def] of Object.entries(keys)) {
          result[k] = data.has(k) ? clone(data.get(k)) : def
        }
      }
      return result
    },
    async set(items) {
      const changes = {}
      for (const [k, v] of Object.entries(items)) {
        changes[k] = { oldValue: data.get(k), newValue: structuredClone(v) }
        data.set(k, structuredClone(v))
      }
      notify(changes)
    },
    async remove(keys) {
      const changes = {}
      for (const k of [].concat(keys)) {
        if (data.has(k)) {
          changes[k] = { oldValue: data.get(k) }
          data.delete(k)
        }
      }
      notify(changes)
    },
    async clear() {
      const changes = {}
      for (const [k, v] of data) {
        changes[k] = { oldValue: v }
      }
      data.clear()
      notify(changes)
    },
  }
}

function getMessage(messageID, subs = null) {
  const entry = messages[messageID]
  if (!entry) {
    // Like the browser: empty string for an unknown message id.
    return ""
  }
  let message = entry.message
  const subsList = subs === null || subs === undefined ? [] : [].concat(subs)
  return message.replace(/\$(\d+)/g, (m, n) => subsList[n - 1] ?? "")
}

const messenger = {
  storage: {
    sync: makeStorageArea("sync"),
    local: makeStorageArea("local"),
    onChanged,
  },
  runtime: {
    id: "mdhr-node-test",
    getURL: (p) => new URL(p.replace(/^\//, ""), EXT_BASE).href,
    getManifest: () => structuredClone(manifest),
    getPlatformInfo: async () => ({ os: "linux", arch: "x86-64" }),
    sendMessage: async () => undefined,
    onInstalled: makeEvent(),
    onMessage: makeEvent(),
  },
  management: {
    getSelf: async () => ({ installType: "development" }),
  },
  i18n: {
    getMessage,
    getUILanguage: () => "en",
    getAcceptLanguages: async () => ["en"],
  },
}

globalThis.messenger = messenger
globalThis.browser = messenger

// Serve extension URLs from extension/, defer to the real fetch otherwise.
const realFetch = globalThis.fetch
globalThis.fetch = async function (input, init) {
  const url = typeof input === "string" ? input : input?.url || String(input)
  if (url.startsWith(EXT_BASE)) {
    const rel = decodeURIComponent(new URL(url).pathname).replace(/^\//, "")
    const filePath = path.join(EXT_DIR, rel)
    if (!filePath.startsWith(EXT_DIR + path.sep)) {
      return new Response("Forbidden", { status: 403 })
    }
    try {
      return new Response(await readFile(filePath), { status: 200 })
    } catch {
      return new Response("Not Found", { status: 404 })
    }
  }
  return realFetch(input, init)
}
