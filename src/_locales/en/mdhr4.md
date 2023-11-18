# Markdown Here Revival 4.0 Beta

**Beta builds of Markdown Here Revival 4.0 are now available.**

MDHR 4.0 is the result of many hours of work to make writing Markdown emails
in Thunderbird a more pleasant experience.

## The big change - _LIVE PREVIEW_

MDHR 4.0 features a split screen compose window. You write your email in Markdown
on the left, and a live preview updates on the right. You do not have to toggle
back and forth to see what your changes.

<div id="video"></div>

The old "Render" button now hides or shows the Markdown preview. If the preview
is hidden, no processing is done.

**MDHR 4.0 cannot be downloaded from the Thunderbird Addons website yet.**
Go to the [GitLab Releases](https://gitlab.com/jfx2006/markdown-here-revival/-/releases)
and download the latest 4.0beta.

This beta will replace older versions of the addon. You can go back to an older
version, but you may lose some settings.

The beta builds will update automatically from GitLab until I release it on
ATN. I hope to do that early in 2024.

**Only Thunderbird 115.x is supported.** Thunderbird Beta support will come prior
to ATN release. **Thunderbird 102 will not be supported.**

Any bugs can be reported [on the issues page](https://gitlab.com/jfx2006/markdown-here-revival/-/issues).
The **MDHR-4** label should be assigned to these bugs.

## Known issues

- <strike>The live preview content is not scroll-sync'd with the editor</strike>
- <strike>The state of "Markdown" mode doesn't persist, and there needs to be
  an option in MDHR Settings to either start the composer in regular or Markdown
  mode.</strike>
- <strike>HTML signatures are not ignored during rendering as in previous 
  version (regression)</strike>
- Live preview position doesn't always stay in perfect sync with the editor side