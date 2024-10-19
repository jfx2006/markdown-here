This extension allows composing emails in Markdown and renders them to HTML
automatically. It only works when composing in HTML mode.

This is a near total re-write of Markdown Here Revival 3.x. The big new
feature is the split editing pane that's common in Markdown editors.

The split screen editor is handled in two pieces, a modified "customui"
experiment that adds a new "compose_editor" location. This limits the
injected browser to the contentArea rather than using the entire window
height like the "compose" location sidebar.

Within this browser, compose_preview/compose_preview.html is loaded and
its content is kept in sync with the editor via messages.

Other new features are listed in the changelog.

## Reproducing the build

### Requirements
- Node 20
- pnPm
- GNU Make
- Bash
- Python 3.12 (earlier versions may work)

The extension code is not minified or bundled, however vendored libraries
are mostly from NPM packages. Part of the build process described below
is to copy and possibly esmify them. Libraries included in this manner
are listed in tools/vendored.yml. This file is used to generate vendored.mk,
which is all handled from Makefile.

### Building

`make clean` will clear out node_modules and some other files to
force a rebuild.

Running `make all` will do the following:

- Run `pnpm install`
- Copy mailext-options-sync.js from the subrepo to extension/options.
  - If a full rebuild of this is needed, `make clean` will reset the
    subrepo and force a rebuild.
- Regenerate vendored.mk
- Copy the vendored NPM packages to extension/vendor (mostly)
- Copy CHANGELOG.md from the repository root to the extension/ directory
- Build the XPI file using web-ext
- Build a source tarball as well

## Other vendored code 
#### not handled by vendored.mk

https://raw.githubusercontent.com/twbs/bootstrap/v5.2.2/dist/js/bootstrap.bundle.js
https://raw.githubusercontent.com/thomaspark/bootswatch/v5.2.2/dist/darkly/bootstrap.css
Parts of shortcuts.js from Firefox source code:
    https://hg.mozilla.org/mozilla-central/file/9d0d26dacd7f8d76a7805cffb98faec5cd6aa7fa/toolkit/mozapps/extensions/content/shortcuts.js

https://github.com/krisk/Fuse/raw/refs/tags/v7.0.0/dist/fuse.basic.mjs

https://github.com/cure53/DOMPurify/blob/3.1.7/dist/purify.es.mjs

https://raw.githubusercontent.com/fred-wang/TeXZilla/v1.0.2.0/TeXZilla.js
(modified to be importable as an esm module)