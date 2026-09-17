/*
 * Copyright JFX 2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

import Papa from "./vendor/papaparse.esm.js"

const kLangRe = /^ {0,3}(?:`{3,}|~{3,})[^\n]*\b(csv|tsv)\b/m

const kEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

// Les cellules CSV sont des données, jamais du markdown : on échappe nous-mêmes
// plutôt que de compter sur DOMPurify en aval.
function escapeCell(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => kEscapes[c])
}

function isCsvLang(lang) {
  const word = String(lang ?? "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
  return word === "csv" || word === "tsv"
}

function csvTable() {
  return {
    name: "csvTable",
    level: "block",
    useNewRenderer: true,
    start(src) {
      return src.match(kLangRe)?.index
    },
    tokenizer(src) {
      // On réutilise le tokenizer de fence de marked plutôt que de reparser nous-mêmes
      const token = this.lexer.tokenizer.fences(src)
      if (!token || !isCsvLang(token.lang)) {
        return token
      }

      const result = Papa.parse(token.text, {
        delimiter: "",
        skipEmptyLines: "greedy",
        header: false,
        dynamicTyping: false,
        worker: false,
        download: false,
      })
      if (result.errors.length > 0 || result.data.length === 0) {
        // CSV mal formé : on retombe sur un bloc de code classique
        return token
      }

      return {
        type: "csvTable",
        raw: token.raw,
        rows: result.data,
      }
    },
    renderer(token) {
      const rows = token.rows
      const numCols = rows.reduce((max, row) => Math.max(max, row.length), 0)
      const renderRow = (row, tag) => {
        const cells = []
        for (let i = 0; i < numCols; i++) {
          cells.push(`<${tag}>${escapeCell(row[i])}</${tag}>`)
        }
        return `<tr>${cells.join("")}</tr>`
      }

      const head = `<thead>${renderRow(rows[0], "th")}</thead>`
      const body = rows
        .slice(1)
        .map((row) => renderRow(row, "td"))
        .join("")
      return `<table>${head}<tbody>${body}</tbody></table>\n`
    },
  }
}

export function markedCsv() {
  return {
    extensions: [csvTable()],
  }
}
