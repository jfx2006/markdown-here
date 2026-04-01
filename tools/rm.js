#!/usr/bin/env node
// Very simple rm replacement

import { parseArgs } from "node:util"
import { rm } from "node:fs/promises"

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
  const rmPaths = positionals.slice(2)

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
