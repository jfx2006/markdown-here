# Markdown Here Revival - Architecture

## Overview

Markdown Here Revival (MDHR) is a Thunderbird mail extension that lets users
write emails in Markdown and render them as styled HTML before sending. It
supports GFM, syntax highlighting (highlight.js), math formulas (TeXZilla or
CodeCogs), smart replacements, and emoji shortcodes. Requires Thunderbird
128.0+.

## Two Rendering Modes

- **Modern (default):** Split-view live preview pane injected alongside the
  compose editor. Preview updates on every keystroke (debounced). The rendered
  HTML is extracted at send time.
- **Classic:** No live preview. User clicks the toolbar button (or
  Ctrl+Alt+M) to toggle between raw markdown and rendered HTML in the compose
  editor itself.

## Directory Layout

```
extension/
├── manifest.json                  # Extension manifest (v2)
├── backgroundscript.js            # Background script — orchestrates everything
├── composescript.js               # Content script injected into compose windows
├── markdown-render.js             # Core marked.js rendering pipeline
├── mdhr-mangle.js                 # HTML ↔ Markdown conversion (uses turndown/degausser)
├── async_utils.mjs                # Utility functions
├── auto-emoji.js                  # Emoji autocomplete (textcomplete)
├── marked-*.js                    # Custom marked.js extensions (math, links, smart stuff)
│
├── compose_preview/               # Modern mode preview pane
│   ├── compose_preview.html       # Preview container registered with ex_customui
│   ├── compose_preview.js         # Preview rendering and scroll sync
│   ├── preview_iframe.html        # Sandboxed iframe for rendered output
│   └── css-inliner.js             # Inlines CSS into email HTML for portability
│
├── experiments/                   # Thunderbird Experiment APIs (privileged)
│   ├── customui/                  # ex_customui — injects UI into compose editor
│   │   ├── parent.js              # XUL/native side
│   │   ├── child.js               # WebExtension bridge
│   │   └── api.json               # API schema
│   ├── notificationbar/           # Alert bar (forgot-to-render warnings, etc.)
│   └── preferences.js             # Access to Thunderbird prefs (reply position, etc.)
│
├── options/                       # Settings page
│   ├── options.html               # Bootstrap 5 options UI
│   ├── options.js                 # Options page logic
│   ├── options-storage.js         # Options persistence via mailext-options-sync
│   ├── options_migration.js       # Version upgrade migrations
│   └── mailext-options-sync.js    # Compiled OptionsSync library
│
├── vendor/                        # Vendored third-party libraries
│   ├── marked.esm.js             # Markdown parser
│   ├── turndown.esm.js           # HTML-to-Markdown
│   ├── degausser.esm.js          # HTML-to-text
│   ├── purify.es.mjs             # DOMPurify (sanitization)
│   ├── TeXZilla.js               # TeX rendering
│   ├── textcomplete.js           # Autocomplete
│   └── bootstrap.bundle.js       # Bootstrap
│
├── highlightjs/                   # Bundled highlight.js + language definitions
├── data/                          # Emoji codes and shortcode data
├── _locales/                      # i18n (13 languages)
└── images/                        # Extension icons (SVG)
```

## Key Components

### Background Script (`backgroundscript.js`)

The central coordinator. Responsibilities:

- **Compose window management:** Detects new compose windows via
  `tabs.onCreated`, checks if HTML or plain-text, injects preview pane via
  `ex_customui.add()`.
- **Toolbar button / hotkey routing:** `composeAction.onClicked` and
  `commands.onCommand` dispatch to modern (toggle preview) or classic
  (toggle render) handlers.
- **Pre-send hook (`compose.onBeforeSend`):** Extracts rendered HTML from
  the preview pane, appends a hidden `.mdhr-raw` div with the base64-encoded
  original markdown (for future editing), and replaces the message body.
  Also implements the "forgot to render" warning.
- **Message bus:** Handles messages from compose scripts and preview pane
  (options retrieval, emoji loading, icon updates, SHA256, tab opening).

### Compose Script (`composescript.js`)

Injected into every compose window's DOM. Runs in the editor's content context.

- **MutationObserver** watches the editor (contenteditable) for changes to
  `childList`, `attributes`, and `characterData`.
- On change (debounced 500ms), sends the editor's full HTML to the preview
  pane via `cp.render-preview` message.
- Handles scroll sync between editor and preview.

### Markdown Rendering Pipeline (`markdown-render.js`)

Sets up and configures the `marked` parser with extensions:

1. `urlSchemify` — adds `http://` to bare URLs
2. `markedExtendedTables` — GFM table support
3. `markedLinkifyIt` — auto-link detection
4. `markedSmartStuff` — smart quotes, dashes (if enabled)
5. `markedHighlight` — syntax highlighting via highlight.js
6. `markedMath` — TeX math rendering (if enabled)
7. `markedEmoji` — `:emoji:` shortcode replacement (if enabled)
8. `BugLinker` — bug number auto-linking (if enabled)

Called with `marked.parse(mdText)` which is async.

### HTML ↔ Markdown Conversion (`mdhr-mangle.js`)

Bridges the gap between the HTML compose editor and the markdown parser:

- **`preprocess()`**: Takes raw editor HTML, excludes external content
  (replies, signatures, images) by replacing them with hash placeholders,
  converts HTML formatting to markdown via turndown, strips remaining HTML
  to plain text.
- **`postprocess()`**: Restores excluded content by replacing hash
  placeholders with the original HTML.

### Preview Pane (`compose_preview/`)

The modern mode's split-view panel:

- Registered at `LOCATION_COMPOSE_EDITOR` via `ex_customui`.
- `compose_preview.js` receives `cp.render-preview` messages, runs the
  full render pipeline (preprocess → marked.parse → postprocess →
  DOMPurify sanitize → CSS inline), and inserts the result into a
  sandboxed iframe (`preview_iframe.html`).
- `css-inliner.js` computes and inlines all CSS styles into elements so
  the email renders consistently across mail clients.

### Options System (`options/`)

- Uses `mailext-options-sync` (fork of `webext-options-sync` for
  Thunderbird) to two-way sync an HTML form with `messenger.storage.sync`.
- `options-storage.js` defines all defaults (`kOptDefaults`): CSS themes,
  hotkey, GFM settings, math renderer, emoji, preview width, mode, etc.
- Migration functions in `options_migration.js` transform options on
  extension install/update.

### Experiment APIs (`experiments/`)

Custom privileged APIs needed for deep Thunderbird integration:

- **`ex_customui`**: Injects the preview pane HTML into the compose editor
  window. Provides `add()`, `remove()`, `getContext()`,
  `setLocalOptions()` and an `onEvent` listener for context changes.
- **`notificationbar`**: Shows notification bars (update notices,
  forgot-to-render warnings) with buttons.
- **`reply_prefs`**: Reads Thunderbird's reply position and paragraph
  formatting preferences.

## End-to-End Data Flow

```
User types markdown in compose editor
        │
        ▼
composescript.js MutationObserver detects change (debounced 500ms)
        │
        ▼
Sends cp.render-preview with editor HTML to preview pane
        │
        ▼
compose_preview.js receives message
        │
        ▼
MdhrMangle.preprocess()
  - Excludes replies/signatures/images (hash placeholders)
  - Converts HTML formatting → markdown (turndown)
  - Strips remaining HTML → plain text
        │
        ▼
marked.parse(mdText) with all extensions
        │
        ▼
MdhrMangle.postprocess()
  - Restores excluded content from placeholders
        │
        ▼
DOMPurify sanitizes HTML
        │
        ▼
CSSInliner inlines computed styles
        │
        ▼
Rendered HTML inserted into preview iframe
        │
        ▼
User clicks Send
        │
        ▼
compose.onBeforeSend fires in background script
        │
        ▼
cp.get-content retrieves final HTML from preview pane
        │
        ▼
Appends hidden .mdhr-raw div (base64 original markdown)
        │
        ▼
Replaces message body with rendered HTML → message sent
```

## Messaging Protocol

All inter-component communication uses `messenger.runtime.sendMessage()`.
Messages are objects with an `action` field. Preview-related messages are
prefixed with `cp.` (compose preview).

| Message | Direction | Purpose |
|---------|-----------|---------|
| `cp.render-preview` | compose → preview | Send editor HTML for rendering |
| `cp.get-content` | background → preview | Get final rendered HTML at send time |
| `cp.scroll-to` | compose → preview | Sync scroll position |
| `cp.toggle-preview` | background → preview | Show/hide preview pane |
| `cp.renderer-reset` | background → preview | Reload marked config after settings change |
| `cp.disableForPlainText` | background → preview | Disable preview for plain-text compose |
| `get-options` / `get-option` | any → background | Retrieve settings |
| `fetch-emojis` | compose → background | Load emoji mappings |
| `check-forgot-render` | background → compose | Check if content looks like markdown |
| `set-composeaction-purple/bw` | preview → background | Update toolbar icon state |

## Build System

```
make all          # Full build: deps + vendored libs + mailext-options-sync + XPI
make build        # npm run build (web-ext package)
make vendored     # Download and bundle third-party libs into extension/vendor/
make clean        # Remove build artifacts
```

- `vendored.mk` + `tools/mk-vendored.py` handle extracting specific files
  from npm packages into `extension/vendor/` and `extension/highlightjs/`.
- `web-ext-config.js` configures the `web-ext` tool for Thunderbird.
- The `mailext-options-sync/` directory is a git subrepo from
  `https://gitlab.com/jfx2006/mailext-options-sync` — its TypeScript source
  is compiled via rollup into the JS file used by the extension.

## Key Third-Party Libraries

| Library | Purpose |
|---------|---------|
| marked | Markdown parsing and rendering |
| highlight.js | Syntax highlighting for code blocks |
| turndown | HTML-to-Markdown conversion |
| degausser | HTML-to-text fallback |
| DOMPurify | HTML sanitization |
| TeXZilla | TeX formula → MathML/PNG |
| textcomplete | Emoji autocomplete popup |
| Bootstrap 5 | Options page UI framework |
