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

### Local package: degausser

`degausser` (MIT, HTML to plain text, used as fallback on Thunderbird
versions without `messengerUtilities.convertToPlainText`) is not widely used,
so its unmodified, non-minified source (version 2.4.4,
https://github.com/flowpub/degausser) is included in the source archive under
`local_packages/degausser/` and declared in `package.json` as
`"degausser": "file:./local_packages/degausser"`. `npm ci` links it into
`node_modules/`, and `npm run vendor` bundles `src/degausser.js` into
`extension/vendor/degausser.esm.js`. Only its `package.json` differs from the
npm tarball (upstream build/test `scripts` and `devDependencies` removed); see
`local_packages/degausser/VENDORED.md`.

Running `npm run clean` removes the vendored code (along with `node_modules`).
