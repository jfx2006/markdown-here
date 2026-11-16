# Contributing

* Project page: https://gitlab.com/mdhr-extension/markdown-here-revival

## Code contributions

Markdown Here Revival (for Thunderbird) will use GitLab and whatever tools
that make sense. At the moment that is just the Git repository.

I plan to use the Wiki for documentation.

Bug reports and feature requests can go in the issue tracker, and pull requests
are encouraged!

## Contributor Conduct

I would think that in 2021 wr can be adults and respect one another regardless
of whatever.

### Contributor license agreement

All contributions must be somehow MIT compatible for now; I intend to look at
relicensing so that we don't need to maintain who has the copyright on what where.
It's open source, that sort of thing is silly.

## Translation

Translations live in the extension itself, one folder per locale in
`extension/_locales/` (WebExtension locale codes, e.g. `pt_BR`):

* `messages.json`: interface strings, in the
  [WebExtension i18n format](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization);
* `preview.md`: the Markdown sample shown in the options page preview.

English (`en`) is the reference. To add or fix a translation:

1. For a new locale, copy both files from `extension/_locales/en/`.
2. Translate the `message` values and the text of `preview.md`. Keep the keys,
   the `description` fields and the `$PLACEHOLDER$` tokens unchanged. Leave the
   `hash` fields as they are: maintainers update them.
3. Open a merge request, or open an issue and attach the files.

## Supporting a new Thunderbird version

`strict_max_version` in the manifest declares the last Thunderbird version the
add-on supports, so each Thunderbird release needs a bump. Merge requests for
it are welcome (see commit 374d4bc for an example). Such a merge request
changes:

* `strict_max_version` in `extension/manifest.json`, e.g. `"161.*"`;
* the changelog: an entry under `## [Unreleased]` / `### Fixed`, e.g.
  `- Bump strict_max_version to support Thunderbird 161.`, in both
  `CHANGELOG.md` and `extension/CHANGELOG.md`. The two files must stay
  identical, or the `check:build` CI job fails.

Leave `README.md` alone: it describes the published releases, and maintainers
update it when releasing.

To test, build the XPI (Node 22) and install it from the Add-ons Manager of the
new Thunderbird version:

```sh
npm ci
npm run vendor
npm run build   # web-ext-artifacts/markdown-here-revival.xpi
```

Test the packed XPI: `web-ext run` alone once reported a compatibility problem
that did not exist with the packed XPI. Then check that:

* the preview renders while typing, in a new message and in a reply;
* sending works, and the received message is formatted;
* the options page opens and its preview works.

Say in the merge request what you tested and on which Thunderbird version. If
something else breaks, the merge request is still useful as an early warning:
breakage usually comes from the experiment APIs the preview relies on, and
shows up as a preview that does not appear. A merged bump is published with
the next release, which is also reviewed on ATN.

## Conthributors

* [JFX](https://gitlab.com/jfx2006) - Fork owner and Thunderbird core developer

See [the old CONTRIBUTING file](_prefork/CONTRIBUTING.md) for historical contributors.

### Translators

See [the old CONTRIBUTING file](_prefork/CONTRIBUTING.md) for historical translators.
