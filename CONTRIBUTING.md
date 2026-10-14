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

## Conthributors

* [JFX](https://gitlab.com/jfx2006) - Fork owner and Thunderbird core developer

See [the old CONTRIBUTING file](_prefork/CONTRIBUTING.md) for historical contributors.

### Translators

See [the old CONTRIBUTING file](_prefork/CONTRIBUTING.md) for historical translators.
