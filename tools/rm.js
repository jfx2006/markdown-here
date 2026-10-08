#!/usr/bin/env node
// Very simple rm replacement

import { parseArgs } from "node:util"
import { rm, glob } from "node:fs/promises"

const GLOB_CHARS = /[*?[\]{}]/

async function expandPath(p) {
  if (!GLOB_CHARS.test(p)) {
    return [p]
  }
  const matches = []
  for await (const match of glob(p)) {
    matches.push(match)
  }
  return matches.length > 0 ? matches : [p]
}

async function main(args) {
  const optionsDefinitions = {
    recursive: {
      type: "boolean",
      default: false,
    },
    force: {
      type: "boolean",
      default: false,
    },
  }

  const { values, positionals } = parseArgs({
    args: process.argv,
    options: optionsDefinitions,
    allowPositionals: true,
  })
  const rmPathsRaw = positionals.slice(2)
  const rmPaths = (await Promise.all(rmPathsRaw.map(expandPath))).flat()

  console.log(`recursive: ${values.recursive}  force: ${values.force}  paths: ${rmPaths}`)
  for (let path of rmPaths) {
    try {
      await rm(path, values)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err
      } else if (err.code === "ENOENT" && !values.force) {
        throw err
      }
    }
  }
}

await main()
