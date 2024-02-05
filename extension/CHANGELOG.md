## [4.0 beta 13]

### Fixed

- Fixed saving boolean (checkbox) options
- Fixed restoring preview width
- Resized images are resized in output as well
- Remove "save markdown source as attachment" option
- Force options preview to rerender when options change

## [4.0 beta 12]

### Fixed

- "Classic" mode now works (I hope)
- Compose Action icon is now purple when in preview (Classic) or if
  markdown mode is active (modern)
- QuickText workaround that may or may not work
- Save markdown source as attachment text/markdown

## [4.0 beta 11]

### Fixed

- Fix Settings page opening multiple tabs
- Save open compose windows as drafts when installing or switching UI modes
  to prevent lost messages - upgrades while messages are being composed may
  continue to be a problem

## [4.0 beta 10]

### Fixed

- Preview width was not saved [#67](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/67)

- Test code fixes

### Known Issues

- The new "classic" mode (pre 4.0) is not completely implemented [#69](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/69)
- Settings tab can open multiple times [#68](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/68)
- Conflict with QuickText extension [#70](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/70)

## [4.0]

- Live Preview (aka "modern") mode is the default
- "Classic" mode is a work in progress to restore the old behavior of the
  render button
- Many refactorings to bring dependencies up to date and use ESM syntax
- "Translate" page borrowed from FireMonkey to help with submitting translations

[HEAD]: https://gitlab.com/jfx2006/markdown-here-revival/-/tags/vHEAD

[//]: # (C3-2-DKAC:GGL:Rjfx2006/markdown-here-revival:Tv{t})

# About changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).