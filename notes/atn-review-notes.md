This extension allows composing emails in Markdown and renders them to HTML
automatically. It only works when composing in HTML mode.

## Reproducing the build

### Requirements

(Python should not be needed for reproducing build with "npm run prepare-all")

- Node 22.x (22.2 or later)
- npm 10.x

or build in Docker using CI/Dockerfile

The extension code is not minified or bundled, however vendored libraries
are mostly from NPM packages. Part of the build process described below
is to copy and possibly esmify them. Libraries included in this manner
are listed in the VENDORED table at the top of tools/vendor.mjs, which is
invoked from tools/build.mjs.

### Building

The build is managed by a small Node.js task runner (`tools/build.mjs`),
invoked via npm scripts — no GNU Make or Bash required, so this works
identically on Linux, macOS, and Windows.

- Extract the source code from the uploaded tarball

Install NPM dependencies

- npm ci

Copy vendored dependencies into the extension directory

- npm run vendor

Build the extension XPI file.

- npm run build

The XPI file will be `web-ext-artifacts/markdown-here-revival.xpi`. It is
packaged by `tools/xpi.mjs` using only Node built-ins; the archive is
reproducible (sorted entries, fixed timestamps).

The above steps can be run with a single command if desired:

- npm run prepare-all

## About vendored code

Per the suggestion from the ATN review team, vendored code is no longer
kept in the repository. Running `npm run vendor` will download the
required libraries and copy them where they need to go. Note that
vendored code is now ignored by git.

Running `npm run prepare-all` will also run `npm run vendor`.

Running `npm run clean` removes the vendored code (along with `node_modules`).

### Local package: texzilla

`texzilla` (TeXZilla 1.0.2, MPL-2.0, https://github.com/fred-wang/TeXZilla) is
not widely used, so its unmodified source is included under
`local_packages/texzilla/` and declared in `package.json` as
`"texzilla": "file:./local_packages/texzilla"`. See
`local_packages/texzilla/VENDORED.md`.
