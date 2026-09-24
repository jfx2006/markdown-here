# <img src="extension/images/md_fucsia.svg" alt="MDHR Logo" height="24" width="24" align="bottom"> Markdown Here Revival

[![Latest Release](https://gitlab.com/jfx2006/markdown-here-revival/-/badges/release.svg)](https://gitlab.com/jfx2006/markdown-here-revival/-/releases)

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

This is a mail extension for [Mozilla Thunderbird](https://thunderbird.net/).
The current release, *Markdown Here Revival 4.0.17*, supports *Thunderbird 128*
up to *Thunderbird 156*. It is the last release supporting versions older than
*Thunderbird 153esr*: starting with 4.1.0, Thunderbird 153 or later is required.

| Markdown Here Revival | Thunderbird  | On ATN  |
|-----------------------|--------------|---------|
| 4.1.0 (upcoming)      | 153 – 156.x  |         |
| 4.0.17                | 128 – 156.x  | pending |
| 4.0.16                | 128 – 156.x  | no      |
| 4.0.15                | 128 – 155.x  | no      |
| 4.0.14                | 128 – 154.x  | no      |
| 4.0.13                | 128 – 153.x  | no      |
| 4.0.11 – 4.0.12       | 128 – 150.x  | no      |
| 4.0.10                | 128 – 149.x  | no      |
| 4.0.9 – 4.0.9.1       | 128 – 148.x  | yes     |
| 4.0.8                 | 128 – 147.x  | yes     |
| 4.0.6 – 4.0.7         | 128 – 140.x  | yes     |
| 4.0.5                 | 128 – 140.x  | no      |
| 4.0.4                 | 128 – 137.x  | yes     |
| 4.0.3.2 – 4.0.3.3     | 128 – 135.x  | yes     |
| 4.0.3.1               | 128 – 134.x  | yes     |
| 4.0.0 – 4.0.3         | 128.x        | yes     |

Releases not published on
[ATN](https://addons.thunderbird.net/en-US/thunderbird/addon/markdown-here-revival/)
can be downloaded from the
[GitLab releases](https://gitlab.com/mdhr-extension/markdown-here-revival/-/releases)
page.

<details>
<summary>Older releases</summary>

| Markdown Here Revival | Thunderbird   |
|-----------------------|---------------|
| 3.999.x (4.0 betas)   | 115 – 128.15  |
| 3.6.0                 | 115 – 128.x   |
| 3.4.6 – 3.5.0.1       | 91 – 118.0    |
| 3.4.0 – 3.4.5         | 91 – 113.0    |
| 3.0.1 – 3.3.1         | 78.5 – 102.0  |

</details>

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


## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Make sure to run `make all` to
download vendored dependencies.

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
