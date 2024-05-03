# marked-extended-tables
Extends the standard [Github-Flavored tables](https://github.github.com/gfm/#tables-extension-) to support advanced features:

  - Column Spanning
  - Row Spanning
  - Multi-row headers

## Column Spanning
Easily denote cells that should span multiple columns by grouping multiple pipe `|` characters at the end of the cell:

```
| H1      | H2      | H3      |
|---------|---------|---------|
| This cell spans 3 columns |||
```

## Row Spanning
Easily denote cells that should span across the previous row by inserting a caret `^` character immediately before the closing pipes:

```
| H1           | H2      |
|--------------|---------|
| This cell    | Cell A  |
| spans three ^| Cell B  |
| rows        ^| Cell C  |
```

Cell contents across rows will be concatenated together with a single whitespace character ` `. Note that cells can only span multiple rows if they have the same column span.

## Multi-row headers
Headers can now follow the same structure as cells, to include multiple rows, and also support row and column spans.

```
| This header spans two   || Header A |
| columns *and* two rows ^|| Header B |
|-------------|------------|----------|
| Cell A      | Cell B     | Cell C   |
```

# Usage
<!-- Show most examples of how to use this extension -->

```js
const marked = require("marked");
const extendedTables = require("marked-extended-tables");

// or ES Module script
// import marked from "https://cdn.jsdelivr.net/gh/markedjs/marked/lib/marked.esm.js";
// import this extension from "https://cdn.jsdelivr.net/gh/calculuschild/marked-extended-tables/lib/index.mjs";

marked.use(extendedTables());

const html = marked.parse("| spanned header ||\n|----|----|\n|cell 1|cell 2|");
console.log(html);
// <table>
//   <thead>
//     <tr><th colspan="2">spanned header</th></tr>
//   </thead>
//   <tbody>
//     <tr><td>cell 1</td><td>cell 2</td></tr>
//   </tbody>
// </table>
```

## `options`

<!-- If there are no options you can delete this section -->
