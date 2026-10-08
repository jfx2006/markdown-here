# degausser (vendored local package)

Unmodified source of [degausser](https://github.com/flowpub/degausser)
2.4.4, as published on npm (`npm pack degausser@2.4.4`). Upstream repository:
`git+ssh://git@github.com/flowpub/degausser.git` (JS package in the `js/`
directory), MIT licence (see `LICENSE`).

Why it is here: Thunderbird Add-ons (ATN) review policy requires
dependencies that are not widely used to be shipped as non-minified source in
the submitted archive and declared as a local package, so the reviewer can
read them. The root `package.json` declares it as
`"degausser": "file:./local_packages/degausser"`.

Only the files needed for the build are kept: `src/` (non-minified ES
modules), `package.json`, `LICENSE` and the upstream `README.md`. The
prebuilt `dist/` bundle from the npm tarball is omitted, so the `main` field
of `package.json` points to a file that is not shipped; the build does not
use it.

The source files are byte-identical to the npm tarball. The only change is
in `package.json`: the upstream `scripts` and `devDependencies` (rollup 2,
jest 26, babel, used to build and test degausser itself) were removed,
because npm installs the devDependencies of `file:` packages and those old
versions fail `npm audit`. `tools/vendor.mjs` bundles `src/degausser.js` with rollup into
`extension/vendor/degausser.esm.js`.

The extension uses it as the HTML-to-plain-text fallback on Thunderbird
versions where `messengerUtilities.convertToPlainText` is unavailable (TB 128).
