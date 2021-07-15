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
