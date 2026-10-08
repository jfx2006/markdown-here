# texzilla (local package)

TeXZilla 1.0.2 as published on npm (`npm pack texzilla@1.0.2`), by Frédéric
Wang and Raniere Silva, MPL-2.0: https://github.com/fred-wang/TeXZilla

It is shipped here so that it is reviewed as part of the add-on source, as ATN
requires for dependencies that are not widely used. `TeXZilla.js` and
`README.md` are unmodified. TeXZilla.js is not minified: it is the readable
parser that upstream generates with jison from its grammar, and it is the file
upstream publishes.

Only `package.json` differs from the npm tarball: the `bin` entry (a shell
wrapper for the command line tool, `npmbin.sh`, not included) is removed.

`tools/vendor.mjs` copies `TeXZilla.js` to `extension/vendor/TeXZilla.js` and
appends an ES module export.
