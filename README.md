# <img src="extension/images/md_fucsia.svg" alt="MDHR Logo" height="24" width="24" align="bottom"> Markdown Here Revival

*Markdown Here Revival* is a fork of [Markdown Here](https://markdown-here.com/), 
the popular browser extension in order to specifically target modern Thunderbird versions.

It lets you write email in Markdown and render it as HTML before sending. It also
supports syntax highlighting (just specify the language in a fenced code block).

Unfortunately, attempts by a few members of the user community to contact
the author of Markdown Here have been unsuccessful.

---
**Thank you to @GregoryK for the wonderful new icons for MDHR 4.0!**

---

## Compatibility

This is a mail extension for [Mozilla Thunderbird](https://thunderbird.net/). *Markdown Here Revival 4.0.0* and higher require *Thunderbird 102.0* or *Thunderbird 115.0*. 

Support for browser-based email such as GMail, Outlook, or Yahoo Mail was
removed to reduce the necessary ongoing maintenace burden from these platforms.

# Table of Contents

**[Installation Instructions](#installation-instructions)**<br>
**[Usage Instructions](#usage-instructions)**<br>
**[Troubleshooting](#troubleshooting)**<br>
**[Notes and Miscellaneous](#notes-and-miscellaneous)**<br>
**[Building](#building)**<br>
**[Feedback](#feedback)**<br>
**[License](#license)**<br>

## Installation Instructions

Download from [addons.thunderbird.net](https://addons.thunderbird.net/en-US/thunderbird/addon/markdown-here-revival/)

## Usage Instructions

Install it, and then…

1. Make sure you've set "Compose messages in HTML format"
4. Compose an email in Markdown. For example:

   <pre>
   **Hello** `world`.

   ```javascript
   alert('Hello syntax highlighting.');
   ```
   </pre>

5. Click the button that appears in the format toolbar.
6. You should see your email rendered correctly from Markdown into rich HTML.
7. Send your awesome email to everyone you know. It will appear to them the same way it looks to you.

### Revert to Markdown

After rendering your Markdown to pretty HTML, you can still get back to your original Markdown.
Just click that toggle button again.

Note that any changes you make to the pretty HTML will be lost when you revert to Markdown.

### Replies

Just reply as normal, any quoted replies will be ignored.
(Technically: Existing `blockquote` blocks will be left intact.)


### Options

The Options page can be accessed via Thunderbird extensions list. The available options include:

* Styling modifications for the rendered Markdown.
* Syntax highlighting theme selection and modification.
* TeX math formulae processing enabling and customization.
* What the hotkey should be.


## Troubleshooting

Coming soon!

## Notes and Miscellaneous

* *Markdown Here Revival* uses [Github Flavored Markdown](http://github.github.com/github-flavored-markdown/).

* Available languages for syntax highlighting will soon be listed on the options
  page.

* Email signatures are automatically excluded from conversion.

* Styling:
  * The use of browser-specific styles (-moz-, -webkit-) should be avoided.
    If used, they may not render correctly for people reading the email
    in a different browser from the one where the email was sent.
  * The use of state-dependent styles (like `a:hover`) don't work because
    they don't match at the time the styles are made explicit. (In email,
    styles must be explicitly applied to all elements -- stylesheets get stripped.)


## Building

Use [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/),
mostly the same as you would for Firefox. A config file is included to make it
use Thunderbird.


## Feedback

See the [issues list](https://gitlab.com/jfx2006/markdown-here-revival/-/issues)
and the [Wiki](https://gitlab.com/jfx2006/markdown-here-revival/-/wikis/home).
All ideas, bugs, plans, complaints, and dreams will end up in one of those two places.

## License

### Code

MIT License: See [the LICENSE file](LICENSE).

### Icons

@GregoryK's new icons in MDHR 4.0 are licensed [Mozilla Public License v2](LICENSE.images)

### Other images

[Creative Commons Attribution 3.0 Unported (CC BY 3.0) License](https://creativecommons.org/licenses/by/3.0/)

---

[logo]: extension/images/md_fucsia.svg
