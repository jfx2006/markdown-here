# Changelog

## [4.0.10]

### Fixed
- MDHR was not working with Thunderbird 148.0 and up. Thank you Cliff Brake for
  tracking down the problems and providing fixes.

## [4.0.9.1]

### New
- Add option to use Body Text format in composer. Body Text is the preferred
  format to ensure all features work properly. Tables and code blocks do
  not render correctly with Paragraph mode.

### [4.0.9] (unreleased)

### Fixed
- Math rendering was always enabled (Thanks Sarke!)
- Disable preview update prior to sending to prevent flash of double-rendered
  content in the preview pane
- Remove `mdhr-raw` elements from quoted or forwarded content. This will keep
  the overall message size down in long threads and improve performance.
- Improve markdown rendering when composing in "paragraph mode" to reduce
  empty vertical space

### Changed
- Refactored dynamic imports out of the composescript.
- Remove fuse.js dependency

## [4.0.8]

### New

- Add support for CodeCogs math rendering (real replacement for GChart Image API)
  Based on Adam P's work in the original Markdown Here extension
- Match issue numbers with dashes as used in Jira (thanks @koug44)

### Fixed

- Table rows with fewer columns than head did not insert empty cells
  [#137](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/137)
- Remove support for Markdown directives
  [#138](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/138)

## [4.0.7]

### Fixed
- Some sent messages had overlapping text blocks
  [#129](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/129)
  [#132](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/132)
- CSS and display element from Emoji autocomplete feature was included in
  sent messages with MDHR Live Preview disabled
  [#125](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/125)
  [#130](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/130)
  [#131](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/131)
- CHANGELOG panel in MDHR Options did not scroll, cutting off content
- Build and stability fixes contributed by Luc Bennett

## [4.0.6]

### Fixed
- Thunderbird's dark mode interfered with MDHR CSS-inlining causing unreadable
  text in the sent message

### Unresolved
- "textcomplete.css" appears as a linked stylesheet in messages sent with
  Markdown rendering disabled [#125](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/125)

## [4.0.5] (not released on ATN)

### Fixed
- Fix problems with options not saving in the last couple versions.
  [#120](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/120)
  [#119](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/119)
- Support up to Thunderbird 140.
  [#116](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/116)
  [#117](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/117)
- Improve performance of the preview rendering.
  [#121](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/121)

## [4.0.4]

- Emoji autocomplete background in dark mode was white

## [4.0.3.3]

### Changed
- Syntax for Bug/Issue links changed to `#bugno` to align with what Github/Gitlab
  use
- Generic directive syntax `:span[text]{.classname attr="foo"}` enabled

### Fixed
- Vertical lines left adjacent to block quotes not present (default css fix)
  [#104](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/104)
- Update popup could open in compose window
  [#101](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/101)
- Emojis did not render due to conflicting Marked extension
  [#107](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/107)
- Debounce live preview rendering and enable async rendering.
  [#102](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/102)
- textcomplete.css was included in sent messages.
  [#112](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/112)

## [4.0.2]

### New
- Issue or Bug linking directive. :issue[34] or :bug[123445]. The URL and link
  text are configurable in Options.

### Fixed
- Disable excessive logging of options changes
- Fix locale-maker save data issue

## [4.0.1]

- Unreleased

## [4.0]

### New

- Restore ability to edit the markdown of a sent email via "Edit as New Message"
  [#73](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/73)

### Fixed

- Exclude signature from Markdown CSS. [#95](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/95)

## [4.0 beta 20]

### Fixed

- Update default CSS to handle GFM tasklists like Github does (no bullets) #87
- Show error message when using GChart Image API for Math Rendering
  [#91](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/91)
- Updated translations
- Fixed issue with spaces in emoji picker
  [#93](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/93)

### [4.0 beta 19]

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
