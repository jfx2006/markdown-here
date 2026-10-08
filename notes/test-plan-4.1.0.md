# Test plan 4.1.0

Manual checks for the changes specific to 4.1.0. Unless stated otherwise,
test with a **packed XPI** installed in a test profile (see below): the
unpacked install from `web-ext run` breaks the Experiment APIs.

## Setup

1. Build the XPI from `release/4.1.0`:
   `npx web-ext build -n markdown-here-revival-4.1.0.xpi`
2. Install it in a test profile by copying it to
   `mdhr_test_profiles/<profile>/extensions/markdown-here-revival@xul.calypsoblue.org.xpi`
   (the profile's `user.js` must set `extensions.autoDisableScopes` to 0).
3. Start Thunderbird on that profile:
   `thunderbird --new-instance --profile mdhr_test_profiles/<profile>`

## 1. Minimum version (Thunderbird 153)

- [ ] On Thunderbird 153 or later, the add-on installs and is enabled.
- [ ] On a Thunderbird older than 153 (e.g. 140esr), installing is refused as
      incompatible.

## 2. Nested quote colors (default.css)

Compose a new HTML message with the following content, then render it:

```
> level 1
>> level 2
>>> level 3
>>>> level 4
>>>>> level 5
>>>>>> level 6
```

- [ ] In the preview, the left border of each level has its own color:
      1 blue, 2 purple, 3 green, 4 orange, 5 tan; level 6 stays tan.
- [ ] Same result as 4.0.17 on the same content: the rendering must not change.
- [ ] Send the message to yourself and open its source (Ctrl+U): each
      `<blockquote>` carries its border color inline, with the same colors.
      Level 1 has it in the `border-inline-start` shorthand, levels 2-5 in
      `border-inline-start-color`.

### Migration of the stored CSS

- [ ] **Default CSS untouched**: with 4.0.17 installed and the "Primary
      styling CSS" option never edited, upgrade to 4.1.0. The option now shows
      the new rules (`:is(blockquote, q) :is(blockquote, q) { … }`) and no
      longer contains `& &`.
- [ ] **Custom CSS**: with 4.0.17, edit the "Primary styling CSS" option (add a
      comment, for example), then upgrade to 4.1.0. The custom CSS is kept
      as is.
- [ ] **Fresh install** on a new profile: the option shows the new rules.

## 3. setHTML() on the options page

Options page, preview tab:

- [ ] Highlighted code blocks keep their colors.
- [ ] Table column alignment (`:---:`, `---:`) is kept.
- [ ] Images are displayed: add a line such as
      `![logo](https://…/image.png)` (any reachable image) to the preview
      text. Use an absolute URL: relative links get `https://`
      prepended (urlSchemify), as in a real email.
- [ ] GFM task lists (`- [ ]`, `- [x]`) show their checkboxes.
- [ ] Inline raw HTML styles (`<span style="color: red">`) are kept.
- [ ] TeX formulas are rendered.

Other tabs:

- [ ] "About" tab: the changelog is rendered (headings, lists, code).
- [ ] Translated labels containing links (CodeCogs, support): the links are
      clickable.
- [ ] The Error Console shows no errors from the options page.

## 4. Plain text conversion (degausser removed)

- [ ] Reply to an HTML message while in markdown mode: the quoted text is
      handled as before.
- [ ] Content excluded from rendering (signature, quoted reply) is kept
      identical after rendering.

## 5. Unit tests (optional)

The tests are not in the XPI: load the add-on unpacked (`web-ext run`), open
the options page and follow the "Run Tests" link. The `options_migration`
suite checks that `DEFAULT_CSS_SUM` matches the checksum of `default.css`.
