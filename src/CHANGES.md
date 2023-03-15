#### v3.4.5
* Add emoji shortcode (Github style) support
  eg. `:smiley:` becomes 😃

#### v3.4.3
* Don't run onInstalled callback for unnecessary reasons
* Fix excluded content having random spaces and other things disappearing
  [#48](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/48)
* Do not store hljs stylesheets file list in extension storage.
  [#49](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/49)
* Make options page #hash links go to right page on load.
* Don't check forwarded messages for unrendered Markdown; Don't render forwarded
  content either. [#53](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/53)
* Fix dismiss button (x) in forgot-to-render notification bar.
  [#52](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/52)
* Update DOMPurify and Markedjs vendored libs.

#### v3.4.2
* Update markedjs and DOMPurify

#### v3.4.1
* Deal with TB bug 1778889.
* Update DOMPurify and Markedjs vendored libs.

#### v3.4.0
* Don't include quote citation div when rendering markdown

#### 2022-03-27 v3.3.1
* Options page CSS fixes  [#39](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/39)
* Updated default.css  [#40](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/40)

#### 2022-02-22: v3.3.0
* i18n strings files are now uniform. Patches accepted. Use WET. More to come.
* Previewer initial content can be localized by editing "preview.md" itself.
* Lots of code cleanup
* TexZilla/Canvas math rendering now available as an alternative to GChart. See
  Options for details. Syntax is different! (no more backticks)
  [#6](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/6)

#### 2022-01-03: v3.2.11
* Add Markdown preview to Options->Theme.
* Allow screen readers to ignore the "hidden div" holding unrendered content.
  [#33](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/33)
* Remove extra blank line at beginning of code blocks.
  [#24](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/24)
* Smart arrow replacements to go with smart quotes.
  [#10](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/10)
* Updated Marked-JS and DOMPurify to latest versions.

#### 2021-11-15: v3.2.10
* Fix [#31](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/31), bad
  CSS style on Options checkboxes with Thunderbird 78.x
* Fix for broken compose window notification boxes in Thunderbird 93.0beta and up.
  [#32](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/32)
* Do not check signatures and quoted content for markdown when check-forgot-render
  is enabled. [#30](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/30)
* Update to marked.js 4.0.3
* Update to highlightjs 11.3.1
* Fix indicator arrow on syntax theme &lt;select&gt; element in options

#### 2021-10-04: v3.2.9
* Fix incorrect text on Options page regarding Math rendering. There is
  **only** GCharts support in this version. Canvas rendering is coming!
  [#28](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/28)
* Add an option to disable "smart" quotes. [#25](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/25)
* Update to marked.js 3.0.4
* Fix everything rendered as indented code blocks when editing a saved draft.
  [#27](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/27)

#### 2021-09-08: v3.2.8
* Context menu in compose window is back!

#### 2021-08-15: v3.2.7
* Async migrations work moved to mailext-options-sync
* Some tests written to verify migrations work

#### 2021-07-23: v3.2.6
* Options migration fixes (rewrite to handle async)
* Fixes the issues with 3.2.5 not rendering

#### 2021-07-16: v3.2.5
* Fix notification bar error with Thunderbird 90+ [#20](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/20)
* Fix options UI with light-color themes [#19](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/19)
* Do not render plain text emails [#18]([#14](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/18))
* Fix code syntax highlighting [#21](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/21)

#### 2021-06-13: v3.2.4
* Fix the test link in the options page
* Fix some broken tests
* Update mailext-options-sync to 2.1.2 (fix issue with detecting background page
  in nodejs/ava environment vs the browser/extension environment)

#### 2021-06-11: v3.2.3
* Update mailext-options-sync.js to 2.1.1 (its internal tests pass again)

#### 2021-05-19: v3.2.2
* ATN review comments addressed

#### 2021-05-07: v3.2.1
* Fix issue with syntax highlighting CSS when upgrading
* Add default.css sha256 sum from v3.0.1
* Misc update migration fixes

#### 2021-05-07: v3.2.0
* Fix accessibility issue in code blocks with default CSS
  [#14](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/14)
* Redesigned preferences UI. Previously selected options are migrated.
* Show current hotkey as tooltip when hovering over render button
  [#11](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/11)

#### 2021-02-28: v3.1.1
* marked.js -> v2.0.1
* Fix nested list rendering when composing with "body text" format
  [#8](https://gitlab.com/jfx2006/markdown-here-revival/-/issues/8)

#### 2021-02-21: v3.1.0
* highlightjs -> 10.6.0
* updated default CSS styles for Thunderbird in either light or dark mode
* Math rendering works #1, syntax change! Enclose in backtick & dollar
  `$x=y^2$` or `$$x=y^3$$`
* Remove JQuery dependency
* Notifications work - warning about unrendering modified html, forgot to
  render on send #3 & #5.
* Use MailExtension commands API for hotkey support; remove tons of legacy code
* Use compose.onBeforeSend when checking for sending unrendered markdown;
  remove more legacy code
* **New permissions** - The extension will prompt for "unrestricted access"
  due to the use of the NotificationBar API experiment.

#### 2021-02-05: v3.0.2
* Update highlightjs and marked to current versions
* Rip out browser variants of Markdown Here, rebrand as Markdown Here Revival.
* Port Thunderbird support to mail extensions to support Thunderbird 78.5+
