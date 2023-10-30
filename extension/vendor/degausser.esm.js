/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

// node_modules/degausser/src/util.js
function autoBind() {
  for (let prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
    if (prop === "constructor" || typeof this[prop] !== "function")
      continue;
    this[prop] = this[prop].bind(this);
  }
}
var whitespaces = [9, 10, 13, 32];
var isCharWhitespace = (charCode) => {
  return whitespaces.includes(charCode);
};
var isCharNewLine = (charCode) => {
  return charCode === 10 || charCode === 13;
};
var BreakType = {
  NONE: "none",
  SINGLE: "single",
  DOUBLE: "double"
};
var trimBeginOnly = (string) => {
  let firstNonWhite = null;
  for (let index = 0; index < string.length; index++) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index;
      break;
    }
  }
  if (firstNonWhite === null) {
    return string;
  }
  return string.slice(firstNonWhite);
};
var trimEndNewLine = (string) => {
  let lastNonNewLine = null;
  let foundNewLineCharacter = false;
  let foundNonWhiteSpaceCharacter = false;
  for (let index = string.length - 1; index >= 0; index--) {
    const charCode = string.charCodeAt(index);
    const isNewLine = isCharNewLine(charCode);
    if (isCharWhitespace(charCode)) {
      if (!isNewLine) {
        continue;
      } else {
        foundNewLineCharacter = true;
      }
    } else {
      foundNonWhiteSpaceCharacter = true;
    }
    if (!isNewLine) {
      if (foundNewLineCharacter) {
        lastNonNewLine = index;
      }
      break;
    }
  }
  if (!foundNonWhiteSpaceCharacter) {
    return null;
  }
  if (lastNonNewLine === null) {
    return string;
  }
  return string.slice(
    0,
    lastNonNewLine ? lastNonNewLine + 1 : void 0
  );
};
var trimAllExceptEndWhiteSpace = (string) => {
  return trimEndNewLine(trimBeginOnly(string));
};
var trimBeginAndEnd = (string) => {
  let firstNonWhite = null, lastNonWhite = null;
  for (let index = 0; index < string.length; index++) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index;
      break;
    }
  }
  for (let index = string.length - 1; index >= 0; index--) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      lastNonWhite = index;
      break;
    }
  }
  if (firstNonWhite === null || lastNonWhite === null) {
    return null;
  }
  return string.slice(
    firstNonWhite,
    lastNonWhite ? lastNonWhite + 1 : void 0
  );
};
var collapseWhitespace = (string) => {
  const textElements = [];
  let startOfNonWhite = null;
  for (let index = 0; index < string.length; index++) {
    if (startOfNonWhite === null && !isCharWhitespace(string.charCodeAt(index))) {
      startOfNonWhite = index;
      continue;
    }
    if (startOfNonWhite !== null && isCharWhitespace(string.charCodeAt(index))) {
      textElements.push(string.slice(startOfNonWhite, index));
      startOfNonWhite = null;
      continue;
    }
  }
  if (startOfNonWhite !== null) {
    textElements.push(string.slice(startOfNonWhite));
  }
  return textElements.join(" ");
};
var trimAndCollapseWhitespace = (string) => {
  return trimBeginAndEnd(collapseWhitespace(string));
};
var blacklist = [
  "base",
  "command",
  "link",
  "meta",
  "noscript",
  "script",
  "style",
  "title",
  // special cases
  // "html",
  "head"
];
var phrasingConstructs = [
  "a",
  "abbr",
  "audio",
  "b",
  "bdo",
  "br",
  "button",
  "canvas",
  "cite",
  "code",
  "command",
  "data",
  "datalist",
  "dfn",
  "em",
  "embed",
  "i",
  "iframe",
  "img",
  "input",
  "kbd",
  "keygen",
  "label",
  "mark",
  "math",
  "meter",
  "noscript",
  "object",
  "output",
  "progress",
  "q",
  "ruby",
  "samp",
  "script",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "svg",
  "textarea",
  "time",
  "var",
  "video",
  "wbr",
  // special cases
  "map",
  "area"
];
var isElementBlacklisted = (element, classBlacklist, elementBlacklist, idBlacklist) => {
  if (classBlacklist && classBlacklist.length) {
    const classList = getClassNameArray(element);
    if (classList.length === 1 && classBlacklist.includes(classList[0])) {
      return true;
    }
    if (classList.length && intersection(classBlacklist, classList).length) {
      return true;
    }
  }
  if (elementBlacklist && elementBlacklist.length) {
    if (element.tagName) {
      const isElementInBlacklist = elementBlacklist.find(
        (blacklistedTag) => matchesLocalNameOrElement(element, blacklistedTag.toLowerCase())
      );
      if (isElementInBlacklist) {
        return true;
      }
    }
  }
  if (idBlacklist && idBlacklist.length) {
    const { id } = element;
    if (id && id.length && idBlacklist.includes(id)) {
      return true;
    }
  }
  return false;
};
var intersection = (array1, array2) => {
  const intersectionArray = [];
  for (let value of array1) {
    const index = array2.indexOf(value);
    if (index !== -1) {
      intersectionArray.push(value);
    }
  }
  return intersectionArray;
};
var getClassNameArray = (element) => {
  const { className } = element;
  if (typeof className === "string") {
    return className.split(/\s/);
  }
  if (typeof className === "object" && "baseVal" in className) {
    return className.baseVal.split(/\s/);
  }
  return [];
};
var matchesLocalNameOrElement = (element, otherNameOrElement) => {
  if (typeof otherNameOrElement === "string") {
    return (element.localName || element.nodeName) === otherNameOrElement;
  }
  return element === otherNameOrElement;
};
var getAltText = (node, placeholderCharacter, placeholderLength) => {
  let altText = node.getAttribute("alt");
  if (altText) {
    altText = altText.trim();
  }
  if (!altText) {
    const altTextPlaceholder = placeholderCharacter.repeat(placeholderLength);
    return altTextPlaceholder;
  }
  return altText;
};
var elementCanHaveAltText = (tagName) => {
  if (!tagName) {
    return false;
  }
  const tagNameLowerCase = tagName.toLowerCase();
  const elementsWithAltText = ["area", "img", "input", "canvas"];
  return elementsWithAltText.includes(tagNameLowerCase);
};

// node_modules/degausser/src/stringCollector.js
var StringCollector = class {
  constructor(options = {}) {
    this.runs = [];
    this.text = [];
    this.options = options;
    this.hasEncounteredFirstCell = false;
    this.lastBreak = null;
    autoBind.call(this);
  }
  addBreak(double) {
    if (this.lastBreak === null) {
      return;
    }
    if (double) {
      this.lastBreak = BreakType.DOUBLE;
    } else if (this.lastBreak !== BreakType.DOUBLE) {
      this.lastBreak = BreakType.SINGLE;
    }
  }
  processBreaks() {
    if (!this.lastBreak) {
      return;
    }
    switch (this.lastBreak) {
      case BreakType.SINGLE:
        this.runs.push("\n");
        break;
      case BreakType.DOUBLE:
        let paragraphBreakAdded = false;
        for (let i = this.runs.length - 1; i >= 0; i--) {
          const run = this.runs[i];
          if (run === "\n\n") {
            paragraphBreakAdded = true;
            break;
          } else if (run !== "\n") {
            break;
          }
        }
        if (!paragraphBreakAdded) {
          this.runs.push("\n\n");
        }
        break;
    }
    this.lastBreak = BreakType.NONE;
  }
  processTextAndTrim(trimmingFunction) {
    if (this.text.length === 0) {
      return;
    }
    const trimmed = trimmingFunction(this.text.join(""));
    if (!trimmed) {
      this.text = [];
      return;
    }
    if (this.lastBreak === null) {
      this.lastBreak = BreakType.NONE;
    }
    this.runs.push(trimmingFunction(trimmed));
    this.text = [];
  }
  processText(trimEndSpaces = true) {
    if (trimEndSpaces) {
      this.processTextAndTrim(trimAndCollapseWhitespace);
    } else {
      this.processTextAndTrim(trimAllExceptEndWhiteSpace);
    }
  }
  processElementNode(node, isOpening) {
    if (isElementBlacklisted(
      node,
      this.options.classBlacklist,
      this.options.elementBlacklist,
      this.options.idBlacklist
    )) {
      return true;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === "pre") {
      this.processText();
      this.addBreak(false);
      this.processBreaks();
      this.runs.push(node.textContent);
      this.lastBreak = BreakType.SINGLE;
      return true;
    }
    switch (tag) {
      case "br":
        this.processText(false);
        this.processBreaks();
        this.runs.push("\n");
        return true;
      case "wbr":
        this.processBreaks();
        this.text.push("\u200B");
        return true;
    }
    if (elementCanHaveAltText(node.tagName)) {
      this.processBreaks();
      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push(` ${altText} `);
      return true;
    }
    if (node.tagName.toLowerCase() === "svg" && isOpening) {
      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push(` ${altText} `);
    }
    this.processBlockConstruct(tag, isOpening);
    return false;
  }
  processBlockConstruct(tag, isOpening) {
    if (phrasingConstructs.includes(tag)) {
      return;
    }
    if (tag === "th" || tag === "td") {
      if (isOpening) {
        if (!this.hasEncounteredFirstCell) {
          this.hasEncounteredFirstCell = true;
        } else {
          this.processBreaks();
          this.runs.push("	");
        }
      } else {
        this.processText();
      }
      return;
    }
    this.processText();
    if (tag === "tr") {
      this.hasEncounteredFirstCell = false;
    }
    if (tag === "p") {
      this.addBreak(true);
    }
    this.addBreak(false);
  }
  processTextNode(node) {
    const string = node.textContent.normalize();
    const trimmed = trimBeginAndEnd(string);
    if (trimmed) {
      this.processBreaks();
    }
    this.text.push(string);
  }
  getResult() {
    this.processText();
    return this.runs.join("");
  }
};

// node_modules/degausser/src/mapCollector.js
var MapType = {
  TEXT: "Text",
  BREAK: "Break"
};
var MapCollector = class {
  constructor(options = {}) {
    this.map = [];
    this.text = [];
    this.options = options;
    this.hasEncounteredFirstCell = false;
    this.lastBreak = null;
    autoBind.call(this);
  }
  addBreak(double) {
    if (this.lastBreak === null) {
      return;
    }
    if (double) {
      this.lastBreak = BreakType.DOUBLE;
    } else if (this.lastBreak !== BreakType.DOUBLE) {
      this.lastBreak = BreakType.SINGLE;
    }
  }
  processBreaks() {
    if (!this.lastBreak) {
      return;
    }
    switch (this.lastBreak) {
      case BreakType.SINGLE:
        this.map.push({
          type: MapType.BREAK,
          double: false
        });
        break;
      case BreakType.DOUBLE:
        let paragraphBreakAdded = false;
        for (let i = this.map.length - 1; i >= 0; --i) {
          const map = this.map[i];
          if (map.type === MapType.BREAK && map.double) {
            paragraphBreakAdded = true;
            break;
          } else if (!this.isSingleBreak(map)) {
            break;
          }
        }
        if (!paragraphBreakAdded) {
          this.map.push({
            type: MapType.BREAK,
            double: true
          });
        }
        break;
    }
    this.lastBreak = BreakType.NONE;
  }
  isSingleBreak(mapObject) {
    const isSingleBreak = mapObject.type === MapType.BREAK && !mapObject.double;
    const isNewLine = mapObject.type === MapType.TEXT && mapObject.content === "\n";
    return isSingleBreak || isNewLine;
  }
  processTextAndTrim(trimmingFunction) {
    if (this.text.length === 0) {
      return;
    }
    const joinedText = this.text.map((element) => element.string).join("");
    const trimmed = trimmingFunction(joinedText);
    if (!trimmed) {
      this.text = [];
      return;
    }
    let fullText = trimmingFunction(trimmed);
    let blockMap = [];
    let currentIndexOfString = 0;
    for (const textMap of this.text) {
      const shrunkText = trimmingFunction(textMap.string);
      if (!shrunkText) {
        continue;
      }
      const index = fullText.indexOf(shrunkText);
      if (index < 0) {
        throw new Error(
          `Could not find shrunk string "${shrunkText}" in "${fullText}"`
        );
      }
      blockMap.push({
        type: MapType.TEXT,
        node: textMap.node,
        start: currentIndexOfString + index,
        length: shrunkText.length,
        content: shrunkText
      });
      fullText = fullText.slice(index + shrunkText.length);
      currentIndexOfString += shrunkText.length + index;
    }
    for (let i = 1; i < blockMap.length; ++i) {
      if (blockMap[i].start - blockMap[i - 1].start !== blockMap[i - 1].length) {
        blockMap[i - 1].length = blockMap[i].start - blockMap[i - 1].start;
      }
    }
    this.map.push(...blockMap);
    if (this.lastBreak === null) {
      this.lastBreak = BreakType.NONE;
    }
    this.text = [];
  }
  processText(trimEndSpaces = true) {
    if (trimEndSpaces) {
      this.processTextAndTrim(trimAndCollapseWhitespace);
    } else {
      this.processTextAndTrim(trimAllExceptEndWhiteSpace);
    }
  }
  processElementNode(node, isOpening) {
    if (isElementBlacklisted(
      node,
      this.options.classBlacklist,
      this.options.elementBlacklist,
      this.options.idBlacklist
    )) {
      return true;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === "pre") {
      this.processText();
      this.addBreak(false);
      this.processBreaks();
      this.lastBreak = BreakType.SINGLE;
      this.map.push({
        type: MapType.TEXT,
        node,
        content: node.textContent,
        length: node.textContent.length
      });
      return true;
    }
    switch (tag) {
      case "br":
        this.processText(false);
        this.processBreaks();
        this.map.push({
          type: MapType.TEXT,
          node,
          content: "\n",
          length: 1
        });
        return true;
      case "wbr":
        this.processBreaks();
        this.text.push({ node, string: "\u200B" });
        return true;
    }
    if (elementCanHaveAltText(node.tagName)) {
      this.processBreaks();
      const altText = getAltText(node, this.options.placeholderString, this.options.placeholderCopies);
      this.text.push({ node, string: ` ${altText} ` });
      return true;
    }
    if (node.tagName.toLowerCase() === "svg" && isOpening) {
      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push({ node, string: ` ${altText} ` });
    }
    this.processBlockConstruct(node, isOpening);
    return false;
  }
  processBlockConstruct(node, isOpening) {
    const tag = node.tagName.toLowerCase();
    if (phrasingConstructs.includes(tag)) {
      return;
    }
    if (tag === "th" || tag === "td") {
      if (isOpening) {
        if (!this.hasEncounteredFirstCell) {
          this.hasEncounteredFirstCell = true;
        } else {
          this.processBreaks();
          this.map.push({
            type: MapType.TEXT,
            node,
            content: "	",
            length: 1
          });
        }
      } else {
        this.processText();
      }
      return;
    }
    this.processText();
    if (tag === "tr") {
      this.hasEncounteredFirstCell = false;
    }
    if (tag === "p") {
      this.addBreak(true);
    }
    this.addBreak(false);
  }
  processTextNode(node) {
    const string = node.textContent.normalize();
    const trimmed = trimBeginAndEnd(string);
    if (trimmed) {
      this.processBreaks();
    }
    this.text.push({ node, string });
  }
  getResult() {
    const result = [];
    let runningIndex = 0;
    for (const entity of this.map) {
      switch (entity.type) {
        case MapType.TEXT:
          const whitespace = [];
          if (entity.node.nodeType === Node.TEXT_NODE || entity.node.tagName === "img") {
            let nodeContent;
            if (elementCanHaveAltText(entity.node.tagName)) {
              const altText = getAltText(
                entity.node,
                this.options.placeholderString,
                this.options.placeholderCopies
              ).normalize();
              nodeContent = altText;
            } else {
              nodeContent = "";
              if (entity.node.tagName === "svg") {
                const altText = getAltText(
                  entity.node,
                  this.options.placeholderString,
                  this.options.placeholderCopies
                ).normalize();
                nodeContent = altText;
              }
              nodeContent += entity.node.textContent.normalize();
            }
            for (let charInMap = 0, charInNode = 0; charInNode < nodeContent.length; ++charInNode) {
              const isEqual = entity.content.charAt(charInMap) === nodeContent.charAt(charInNode);
              const isMapWhitespace = isCharWhitespace(
                entity.content.charCodeAt(charInMap)
              );
              const isNodeWhitespace = isCharWhitespace(
                nodeContent.charCodeAt(charInNode)
              );
              if (isEqual || isMapWhitespace && isNodeWhitespace) {
                ++charInMap;
              } else if (isMapWhitespace || isNodeWhitespace) {
                const skips = {
                  after: charInMap - 1,
                  position: charInNode
                };
                whitespace.push(skips);
              } else {
                throw new Error(
                  `Degauss error, character mismatch and not a whitespace`
                );
              }
            }
          }
          result.push({
            node: entity.node,
            content: entity.content,
            whitespace,
            start: runningIndex,
            length: entity.length
          });
          runningIndex += entity.length;
          break;
        case MapType.BREAK:
          const lastResult = result[result.length - 1];
          if (entity.double) {
            lastResult.length += 2;
            runningIndex += 2;
          } else {
            lastResult.length += 1;
            runningIndex += 1;
          }
          break;
      }
    }
    return result;
  }
};

// node_modules/degausser/src/domWalker.js
var walkDOM = (parentNode, collector) => {
  if (!parentNode) {
    return;
  }
  processNode(parentNode, collector);
  return collector.getResult();
};
var processNode = (node, collector) => {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      collector.processTextNode(node);
      break;
    case Node.ELEMENT_NODE:
      if (blacklist.includes(node.tagName.toLowerCase())) {
        return;
      }
      processElementNode(node, collector);
      break;
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      if (node.hasChildNodes()) {
        node.childNodes.forEach((child) => {
          processNode(child, collector);
        });
      }
      break;
  }
};
var processElementNode = (node, collector) => {
  const skipRest = collector.processElementNode(node, true);
  if (skipRest) {
    return;
  }
  if (node.hasChildNodes()) {
    node.childNodes.forEach((child) => {
      processNode(child, collector);
    });
  }
  collector.processElementNode(node, false);
};

// node_modules/degausser/src/degausser.js
var degausser = (parentNode, options = {}) => {
  const unitSeparatorCode = 31;
  const defaultOptions = {
    placeholderString: String.fromCharCode(unitSeparatorCode),
    placeholderCopies: 100
  };
  const finalOptions = Object.assign(defaultOptions, options);
  let collector = new StringCollector(finalOptions);
  if (finalOptions.map) {
    collector = new MapCollector(finalOptions);
  }
  return walkDOM(parentNode, collector);
};
var getRangeFromOffset = (start, end, doc = document, map = null, options = {}) => {
  const docType = doc.nodeType;
  if (docType !== Node.DOCUMENT_NODE && docType !== Node.DOCUMENT_FRAGMENT_NODE) {
    throw new Error("Bad Document Node");
  }
  if (map === null) {
    const finalOptions = Object.assign({}, options);
    finalOptions.map = true;
    map = degausser(doc, finalOptions);
  }
  const range = doc.createRange();
  for (let mapIndex = 0; mapIndex < map.length; ++mapIndex) {
    const entry = map[mapIndex];
    if (start >= entry.start && start < entry.start + entry.length) {
      if (entry.node.nodeName === "img") {
        range.setStartBefore(entry.node);
      } else {
        const adjustedStart = start - entry.start;
        let skips = 0;
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedStart) {
            ++skips;
          }
        }
        if (adjustedStart + skips - entry.node.length === 1) {
          range.setStartAfter(entry.node);
        } else {
          range.setStart(entry.node, adjustedStart + skips);
        }
      }
    }
    if (end >= entry.start && end < entry.start + entry.length) {
      if (entry.node.nodeName === "img") {
        range.setEndAfter(entry.node);
      } else {
        const adjustedEnd = end - entry.start;
        let skips = 0;
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedEnd) {
            ++skips;
          }
        }
        if (adjustedEnd + skips - entry.node.length === 1) {
          range.setEndAfter(entry.node);
        } else {
          range.setEnd(entry.node, adjustedEnd + skips);
        }
      }
      break;
    }
  }
  return range;
};
export {
  degausser,
  getRangeFromOffset
};
