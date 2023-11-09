/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */
/*
  Prepends https:// to Markdown links that are missing a schema.

  https://github.com/adam-p/markdown-here/issues/57#issuecomment-23575132

  This feature/fix makes a lot of sense for in an email environment,
  where relative links make no sense, and where the writer doesn't control
  the scheme at the time the reader views the rendered result.

  However, it does not make sense for more web-page-like uses (like blog posts),
  where the writer might want/expect relative links or to leave the scheme blank
  so that it matches the scheme that the reader is using to view the site.
 */

export function urlSchemify() {
  const hasScheme = /^[\w+]+:\/\//
  const dummyBaseUrl = new URL("https://__dummy__")

  return {
    walkTokens(token) {
      if (!["link", "image"].includes(token.type)) {
        return
      }

      if (hasScheme.test(token.href)) {
        // the URL has a scheme, do not touch it
        return
      }

      if (token.href.startsWith("#")) {
        // the URL is an anchor link, leave it
        return
      }

      try {
        const temp = new URL(token.href, dummyBaseUrl)
        if (temp.host === "__dummy__") {
          token.href = temp.href.replace("__dummy__/", "")
        } else {
          token.href = temp.href
        }
      } catch (e) {
        // ignore
      }
    },
  }
}
