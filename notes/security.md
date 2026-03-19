# Markdown Here Revival - Security Audit

Audit date: 2026-03-19

## Executive Summary

The extension has a **sound security architecture** with defense-in-depth: all
rendered HTML passes through DOMPurify before DOM insertion, the preview iframe
has a restrictive CSP, and no dangerous APIs (`eval`, `executeScript`,
`document.write`) are used. No critical vulnerabilities were found. Several
medium and low-risk issues are documented below.

## Scope

Reviewed all files under `extension/`, `mailext-options-sync/`, and build
configuration. Focused on:
- HTML sanitization and XSS prevention
- Message passing and inter-component communication
- CSP and permissions
- Third-party dependency security
- Data leakage to external services

---

## Findings

### MEDIUM: CodeCogs Math Rendering Leaks Email Content to Third Party

**Files:** `marked-math.js:38-42`, `options-storage.js:38-39`,
`preview_iframe.html:18`

When users enable the CodeCogs math renderer, math formulas are sent as URL
query parameters to `https://latex.codecogs.com/`. This leaks formula content
to a third-party server. Email recipients also trigger requests to CodeCogs
when viewing the rendered email, exposing their IP addresses.

The CSP in `preview_iframe.html` explicitly allows this:
```
img-src data: imap: cid: mid: https://latex.codecogs.com/;
```

**Mitigating factors:**
- Default renderer is TeXZilla (fully local, no external requests).
- CodeCogs must be explicitly enabled by the user.
- The options page documents the data sharing clearly.
- `math-renderer-enabled` defaults to `false`.

**Recommendation:** Consider adding a warning banner in the options UI when
CodeCogs is selected, or removing CodeCogs entirely in favor of TeXZilla.

---

### MEDIUM: User-Configurable HTML Templates in Math and BugLink

**Files:** `marked-math.js:38-42`, `buglink.esm.js:40-44`,
`options-storage.js:38-39,49-50`

The `math-value` option is an HTML template with `{mathcode}` and
`{urlmathcode}` placeholders. The `buglink-url` and `buglink-text` options are
similarly user-configurable templates. In both cases, the template output is
raw HTML that becomes part of the marked.js render output.

**Math template (`marked-math.js:38-42`):**
```javascript
async function mathifyGChart(math_code) {
  return options.math_url
    .replace(/\{mathcode\}/gi, math_code)
    .replace(/\{urlmathcode\}/gi, encodeURIComponent(math_code))
}
```

**BugLink template (`buglink.esm.js:40-44`):**
```javascript
renderer(token) {
  const bug_url = options.url_template.replace("{bug_number}", bug_number)
  const bug_text = options.text_template.replace("{bug_number}", bug_number)
  return `<a href="${bug_url}">${bug_text}</a>`
}
```

A user (or anything that can write to `messenger.storage.sync`) could set a
malicious template like:
```
<img src=x onerror="alert(1)">
```

**Mitigating factors:**
- All marked.js output flows through `DOMPurify.sanitize()` before DOM
  insertion (`compose_preview.js:107`). DOMPurify strips event handlers,
  script tags, and `javascript:` URLs by default, so XSS payloads in
  templates would be neutralized.
- The preview iframe CSP has no `script-src`, preventing script execution
  even if sanitization were bypassed.
- Only the extension itself can write to its storage — no external page can
  modify these options.

**Recommendation:** Validate template values on save. For `math-value`,
ensure it matches an expected `<img>` pattern. For buglink URLs, validate the
scheme is `https:` or `http:`.

---

### MEDIUM: `open-tab` Message Handler Lacks URL Validation

**File:** `backgroundscript.js:113-117`

```javascript
} else if (request.action === "open-tab") {
  messenger.tabs.create({
    url: request.url,
  })
  return false
```

The URL from the message is passed directly to `messenger.tabs.create()`
without validation. While only same-extension scripts can send runtime
messages, a compromised content script could request opening arbitrary URLs.

**Mitigating factors:**
- `messenger.tabs.create()` in Thunderbird restricts URL schemes — it will
  reject `javascript:` and other dangerous schemes.
- Only extension-internal scripts can send `runtime.sendMessage()`.

**Recommendation:** Validate the URL scheme (allow only `https:`, `http:`,
and `moz-extension:`) before passing to `tabs.create()`.

---

### LOW: Preview Iframe CSP Contains `unsafe-eval` for Styles

**File:** `preview_iframe.html:12-19`

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
    style-src 'unsafe-inline' chrome://messagebody/skin/messageBody.css;
    style-src-elem 'unsafe-eval' 'unsafe-inline'
    style-src-attr 'unsafe-inline';
    img-src data: imap: cid: mid: https://latex.codecogs.com/;
    child-src 'none';" />
```

- `style-src-elem 'unsafe-eval'` is unusual. It allows `CSSOM.insertRule()`
  and similar dynamic style APIs. While this doesn't enable JavaScript
  execution (no `script-src`), it's broader than necessary.
- `style-src 'unsafe-inline'` and `style-src-attr 'unsafe-inline'` are
  required because the extension inlines CSS into email HTML for
  cross-client compatibility.
- `default-src 'none'` with no `script-src` means no JavaScript can execute
  in the iframe regardless.

**Recommendation:** Remove `'unsafe-eval'` from `style-src-elem` if the
extension doesn't use CSSOM APIs in the preview iframe. If it does, document
why.

---

### LOW: CSS Inliner Allows `content` Property Without Value Validation

**File:** `css-inliner.js:7-49`

The `ALLOW_CSS_PROPS` allowlist includes `/^content.*$/i`. The CSS `content`
property can reference external resources via `url()`. While the preview
iframe CSP blocks most resource loading (`default-src 'none'`), the inlined
styles survive into the final sent email where no CSP applies.

**Recommendation:** Either remove `content` from the allowlist or add value
validation to strip `url()` values.

---

### LOW: DOMPurify Uses Default Configuration

**Files:** `compose_preview.js:24-26`, `options.js:167-169`

```javascript
function escapeHTML(strings, html) {
  return `${DOMPurify.sanitize(html)}`
}
```

DOMPurify is called with no options, relying on defaults. This is safe (the
defaults are restrictive), but explicit configuration would make the security
posture more visible and guard against future DOMPurify default changes.

**Recommendation:** Consider explicit configuration:
```javascript
DOMPurify.sanitize(html, {
  FORBID_TAGS: ['style'],  // if not needed
  FORBID_ATTR: ['style'],  // if inline styles handled separately
})
```
Or at minimum, document that default configuration is intentional.

---

### INFO: SHA256 Hash Placeholders Are Collision-Resistant

**File:** `mdhr-mangle.js`

The preprocess/postprocess pipeline replaces excluded content (replies,
signatures, images) with `MDHR-${sha256hash}` placeholders, then restores
them after markdown rendering. SHA256 makes collision attacks infeasible.
Additionally, the restored HTML passes through DOMPurify before DOM insertion,
so even if a collision were achieved, XSS payloads would be stripped.

**Status:** No issue.

---

### INFO: Base64-Encoded Original Markdown in Sent Emails

**File:** `compose_preview.js:176-186`

The extension appends a hidden `.mdhr-raw` div to sent emails containing the
base64-encoded original markdown. This is used to enable future editing of
sent messages. The div uses inline CSS to hide it (`height:0; width:0;
overflow:hidden; font-size:0`).

- The base64 content is never decoded or executed by the extension in
  received emails.
- Reply handling (`compose_preview.js:71-74`) removes `.mdhr-raw` elements
  from quoted content to prevent size bloat.

**Status:** No issue. The hidden div is inert data.

---

## Positive Security Findings

### HTML Sanitization Chain

All rendered HTML follows this path before DOM insertion:
```
marked.parse(mdText)
  → MdhrMangle.postprocess() (restores excluded content)
  → DOMPurify.sanitize()       ← sanitization gate
  → parseHTMLFromString()       (DOM parsing, not innerHTML)
  → contentDiv.replaceChildren() (safe DOM node insertion)
```

No innerHTML is used with unsanitized content. The options page uses an
`escapeHTML` template tag that wraps DOMPurify.sanitize(). This is correct.

### Manifest Permissions Are Minimal

```json
"permissions": [
  "accountsRead", "compose", "compose.save",
  "menus", "messagesRead", "storage", "tabs"
]
```

All permissions are necessary for the extension's functionality. No overly
broad permissions like `<all_urls>` or `webRequest`.

### No Dangerous APIs

- No `eval()`, `new Function()`, `setTimeout(string)`, or `document.write()`
  in extension code.
- No `executeScript()` API usage.
- No inline scripts or event handlers in HTML files.

### Vendored Libraries Are Current

| Library | Version | Status |
|---------|---------|--------|
| DOMPurify | 3.2.6 | Current |
| marked | 15.0.12 | Current |
| highlight.js | 11.11.1 | Current |
| turndown | 7.2.0 | Current |
| Bootstrap | 5.3.8 | Current |

All libraries are vendored locally (not loaded from CDNs).

### Message Validation

- `compose_preview.js` validates `sender.tab.windowId` against
  `context.windowId` before processing `cp.render-preview`.
- The `cp.` prefix check ensures only compose-preview messages are handled.
- `composescript.js` uses a whitelist of known action names.

### No External Resource Loading (Except Opt-In CodeCogs)

All assets (JS, CSS, emoji data, highlight.js themes) are bundled locally.
The only external resource loading is CodeCogs math rendering, which is
disabled by default and requires explicit opt-in.

---

## Recommendations Summary

| Priority | Recommendation |
|----------|---------------|
| Medium | Validate `math-value` template on save to ensure safe HTML pattern |
| Medium | Validate `buglink-url` scheme on save (http/https only) |
| Medium | Validate URL scheme in `open-tab` handler before `tabs.create()` |
| Low | Remove `'unsafe-eval'` from preview iframe CSP if not needed |
| Low | Strip `url()` values from CSS `content` property in inliner |
| Low | Add explicit DOMPurify configuration options |
| Low | Consider deprecating CodeCogs in favor of TeXZilla-only math |
