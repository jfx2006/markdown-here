/*
 * Copyright JFX 2024
 * MIT License
 */

export function BugDirective(url_template, text_template) {
  return {
    level: "inline",
    marker: ":",
    renderer(token) {
      if (token.meta.name === "bug" || token.meta.name === "issue") {
        const bug_number = token.text
        const bug_url = url_template.replace("{bug_number}", bug_number)
        const bug_text = text_template.replace("{bug_number}", bug_number)
        return `<a href="${bug_url}">${bug_text}</a>`
      }
    },
  }
}
