Changes in 4.1.3 addressing the review of 4.1.2:

- Finding 1 (known vulnerabilities): DOMPurify is updated from 3.4.16 to
  3.4.18 (package.json, package-lock.json). `npm audit --omit=dev` reports
  no vulnerability in the bundled dependencies.
- Finding 2 (data sent over http): the CodeCogs math template (math-value
  option) is an HTML snippet whose image URL receives the formula. Any
  http:// URL in it is now upgraded to https://:
  - in options/options.js, when the user enters the template (the field is
    rewritten and saved with https://);
  - in marked-math.js (upgradeInsecureUrls, called by mathifyGChart) every
    time a formula is rendered, which also covers templates saved by
    earlier versions.
  A unit test covers it (extension/test/markdown-render-test.js).
- Finding 3 (texzilla): unchanged on purpose. TeXZilla 1.0.2 is shipped in
  local_packages/texzilla so that it is reviewed as part of the add-on
  source; local_packages/texzilla/VENDORED.md documents its origin (npm
  tarball of texzilla@1.0.2, unmodified TeXZilla.js).

Other changes since 4.1.2: Thunderbird 160 support (strict_max_version
160.*), and two bug fixes in the compose preview (see CHANGELOG.md).

Build instructions are unchanged (see notes/atn-review-notes.md).
