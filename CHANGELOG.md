## [4.0 beta 21]

## New

- Restore ability to edit the markdown of a sent email via "Edit as New Message"
  [#73](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/73)

## Fixed

- Exclude signature from Markdown CSS. [#95](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/95)

## [4.0 beta 20]

## Fixed

- Update default CSS to handle GFM tasklists like Github does (no bullets) #87
- Show error message when using GChart Image API for Math Rendering
  [#91](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/91)
- Updated translations
- Fixed issue with spaces in emoji picker
  [#93](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/93)

## [4.0 beta 19]

## Fixed

- Preview toggle issues

## [4.0 beta 18]

## New

- Emoji autocomplete popup thingy

## [4.0 beta 17]

### Changed

- Update Marked to 12.0.2, update Marked extensions, Turndown, Highlightjs

### Fixed

- Disable MDHR for plain text messages. Fixes #84.

## [4.0 beta 16]

### Fixed

- Replying to plain text or "body text" formatted emails lost inline reply content #85.
- Suppress quirks mode warnings in console log

## [4.0 beta 15]

### Fixed

- Fix up modern mode after using classic mode. #77
- Add a "Reset Preview" item to the compose action context menu. 
- Automate release workflow as much as possible.

## [4.0 beta 14]

### Fixed

- Fix handling of multiple images.  #76.
- Custom CSS styles did not apply to emails. #83.

### Changed

- Live preview: Move external (reply quotes and forwards) content into a shadow
  root'd div to prevent CSS style collision. The shadow root is removed after
  markdown CSS is inlined prior to sending.
- CSS Inliner now operates off a blank document when setting up the default
  styles.
- The CSP `<meta>` element used in the preview pane was previously left in-tact
  when the message was finally sent. It is now removed prior to sending. The
  CSP is intentionally restrictive; among other things it prevents loading
  remote images and CSS. I may create a way to loosen this up a bit for users
  who want remote images and such. In any case, the CSP really does not need to
  be applied in the recipient's email client. I'm not even sure it would be in
  most cases anyway.
- Removed some other miscellaneous stylesheets applied to the preview pane that
  are not needed when the recipient reads an email.
- Live preview iframe now loads from a srcdoc: string. This allows setting the
  default markdown and highlighter CSS as `<style>` elements right away. This
  should reduce cases of unstyled or unrendered messages in the preview.

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
