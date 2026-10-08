# degausser

[![JS](https://github.com/flowpub/degausser/workflows/JS/badge.svg)](https://github.com/flowpub/degausser/actions?query=workflow%3AJS)

HTML to plain text conversion.

_For when you want to eliminate HTML tags from a document and leave reasonably rendered text behind._

The target algorithm is similar to the [`HTMLElement.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) property of the HTML5 DOM.
With the limitation of not taking into account layout or styling.

## Usage

Example:

```js
import { degausser } from 'degausser'

const template = document.createElement('template')

template.innerHTML = `
<h3>For example:</h3>
<p id="source">
  <style>#source { color: red; }</style>
  Take a look at
  <br>
  <strong>how</strong>
  <em>this</em>
  text<br>is
  <mark>inter</mark>preted
  below.
  <span style="display:none">HIDDEN TEXT</span>
</p>
`

const documentFragment = template.content

const plain = degausser(documentFragment)

console.log(plain)
```

Output:

```
For example:

Take a look at
how this text
is interpreted below. HIDDEN TEXT
```

### Using with Node.js

It's recommended to use [jsdom](https://github.com/jsdom/jsdom) for a DOM implementation.