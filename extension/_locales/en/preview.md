This is just a sample. You can play around with your own text right here. If you change any options, the preview will update.

# Markdown

...is really just ordinary text, *plain and simple*. You **type naturally**, the result looks good, and you don't have to click formatting buttons. Some features below depend on an option: they are marked *(option)*.

## Text

*Italic*, **bold**, ***bold italic***, ~~strikethrough~~ and `inline code`.
A single line break
is kept as is *(option, enabled by default)*.

Smart typography *(option, enabled by default)*: "double quotes", 'single quotes', en dash -- em dash --- ellipsis... and arrows --> <-- ==>.

Emoji shortcodes *(option, enabled by default)*: :wave: :+1: :tada: :rocket:

## Links

Links can be [explicit](https://www.thunderbird.net), [by reference][cheatsheet] or automatic, such as https://en.wikipedia.org/wiki/Invader_Zim.

Bug links *(option, disabled by default)*: #123

[cheatsheet]: https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet

## Lists

* Bulleted lists
  * with nested bullets
    * are fun!
  * and super easy
* More more more!

1. Numbered lists too!
1. You don't even need to use
1. the right numbers

- [ ] Task lists
- [x] with checkboxes

## Quotes

> A block quote.
> *With* **some** `markdown`.
>
> > A nested quote
> >
> > > and another level.

## Code

```javascript
// All the code you will ever need
var hw = "Hello World!"
alert(hw);
```

```
Plain code block
without syntax highlighting
```

## Tables

| Name  | Lunch order | Spicy  | Owes |
|-------|-------------|:------:|-----:|
| Joan  | saag paneer | medium | 11 € |
| Sally | vindaloo    | mild   | 14 € |
| Erin  | lamb madras | HOT    |  5 € |

Merged cells and column widths: `||` merges a cell with the next column, a cell ending with `^|` merges with the cell above, and a percentage in the separator row sets the column width.

| Team         |  Q1 |  Q2 |
|:-----40%-----|----:|----:|
| Total        ||  42 |
| Mail         |  12 |  18 |
|             ^|   7 |   5 |

CSV and TSV blocks *(option, disabled by default; otherwise shown as code)*:

```csv
Fruit;Color;Price
Apple;red;1.20
Banana;yellow;0.80
```

## Math formulae

*(option, disabled by default)* My math is so rusty that I barely remember the _quadratic equation_: ${-b \pm \sqrt{b^2 - 4ac} \over 2a}$

$$e^{i\pi} + 1 = 0$$

## Images and inline HTML

An image: ![Markdown Here logo](/images/icon24.png)

Raw HTML works too: <span style="color: red">red text</span>.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Here's a horizontal rule

---

el fin.
