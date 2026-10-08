#!/usr/bin/env node
// Fails if the git working tree has changes to tracked files.
// Replaces the Makefile's git_status target's inline POSIX shell.

import { execFileSync } from "node:child_process"

const status = execFileSync("git", ["status", "--porcelain=2", "-uno"], {
  encoding: "utf8",
})

if (status.trim().length > 0) {
  console.error("ERROR!! git status found changes to tracked files. This is not okay for release.")
  console.error(status)
  execFileSync("git", ["diff"], { stdio: "inherit" })
  process.exit(1)
}
