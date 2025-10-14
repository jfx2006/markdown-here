/*
 * Copyright JFX 2024
 * MIT License
 */

const defaultOptions = {
  url_template: "https://example.com/{bug_number}",
  text_template: "Bug {bug_number}",
}

export function BugLinker(options) {
  options = {
    ...defaultOptions,
    ...options,
  }
  if (!options.url_template || !options.text_template) {
    throw new Error("url_template or text_template not set")
  }

  return {
    extensions: [
      {
        name: "buglink",
        level: "inline",
        start(src) {
          return src.match(/#[0-9a-zA-Z]/)?.index
        },
        tokenizer(src, tokens) {
          const match = src.match(/^#([\w\-]+)/)
          if (!match) {
            return
          }
          const bug_number = match[1]
          return {
            type: "buglink",
            raw: match[0],
            bug_number,
          }
        },
        renderer(token) {
          const bug_number = token.bug_number
          const bug_url = options.url_template.replace("{bug_number}", bug_number)
          const bug_text = options.text_template.replace("{bug_number}", bug_number)
          return `<a href="${bug_url}">${bug_text}</a>`
        },
      },
    ],
  }
}

export default BugLinker
