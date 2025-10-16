function autoBind() {
  for (let prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
    if (prop === 'constructor' || typeof this[prop] !== 'function') continue
    this[prop] = this[prop].bind(this);
  }
}

// Char codes for \t, \n, and non-&nbsp; space character
const whitespaces = [9, 10, 13, 32];
const isCharWhitespace = (charCode) => {
  return whitespaces.includes(charCode)
};

const isCharNewLine = (charCode) => {
  return charCode === 10 || charCode === 13
};

const BreakType = {
  NONE: 'none',
  SINGLE: 'single',
  DOUBLE: 'double',
};

/**
 * Trim whitespace from the start of the string
 * @param string
 * @returns { string }
 */
const trimBeginOnly = (string) => {
  // Get the first non-whitespace character index
  let firstNonWhite = null;
  for (let index = 0; index < string.length; index++) {
      if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index;
      break
      }
  }

  // If the first non-whitespace character is null, the string is entirely whitespace
  if (firstNonWhite === null) {
      return string
  }

  // Return the non-empty sections of the string
  return string.slice(firstNonWhite)
};

/**
 * Trim any new line characters from the end of the string
 * Also trim any whitespace that comes after that new line character, but not any that comes before.
 * @param string
 * @returns {*}
 */
const trimEndNewLine = (string) => {
  let lastNonNewLine = null;
  let foundNewLineCharacter = false;
  let foundNonWhiteSpaceCharacter = false;
  for (let index = string.length - 1; index >= 0; index--) {
    const charCode = string.charCodeAt(index);
    const isNewLine = isCharNewLine(charCode);
    if (isCharWhitespace(charCode)) {
      if (!isNewLine) {
        // okay to trim out any white space
        continue
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
      break
    }
  }

  if (!foundNonWhiteSpaceCharacter) {
    return null
  }
  // If both are null, the string is entirely whitespace
  if (lastNonNewLine === null) {
    return string
  }

  // Return the non-empty sections of the string
  return string.slice(
      0,
      lastNonNewLine ? lastNonNewLine + 1 : undefined,
  )
};

/**
 * Trims any whitespace at the start and trims any newline characters at the end of the string.
 * Trims any whitespace after newline characters at the end of the string, but not any that comes before.
 * @param string
 * @returns {*}
 */
const trimAllExceptEndWhiteSpace = (string) => {
  return trimEndNewLine(trimBeginOnly(string))
};

const trimBeginAndEnd = (string) => {
  // Get the first and last non-whitespace character index
  let firstNonWhite = null,
    lastNonWhite = null;
  for (let index = 0; index < string.length; index++) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index;
      break
    }
  }
  for (let index = string.length - 1; index >= 0; index--) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      // if(index !== string.length - 1){
      // String slicing breaks if the last char is not whitespace
      lastNonWhite = index;
      // }
      break
    }
  }

  // If both are null, the string is entirely whitespace
  if (firstNonWhite === null || lastNonWhite === null) {
    return null
  }

  // Return the non-empty sections of the string
  return string.slice(
    firstNonWhite,
    lastNonWhite ? lastNonWhite + 1 : undefined,
  )
};

const collapseWhitespace = (string) => {
  // Collapse all other sequential whitespace into a single whitespace
  const textElements = [];
  let startOfNonWhite = null;
  for (let index = 0; index < string.length; index++) {
    if (
      startOfNonWhite === null &&
      !isCharWhitespace(string.charCodeAt(index))
    ) {
      startOfNonWhite = index;
      continue
    }
    if (
      startOfNonWhite !== null &&
      isCharWhitespace(string.charCodeAt(index))
    ) {
      textElements.push(string.slice(startOfNonWhite, index));
      startOfNonWhite = null;
      continue
    }
  }

  // At the end, add the rest of the string
  if (startOfNonWhite !== null) {
    textElements.push(string.slice(startOfNonWhite));
  }

  return textElements.join(' ')
};

const trimAndCollapseWhitespace = (string) => {
  return trimBeginAndEnd(collapseWhitespace(string))
};

const blacklist = [
  'base',
  'command',
  'link',
  'meta',
  'noscript',
  'script',
  'style',
  'title',
  // special cases
  // "html",
  'head',
];

const phrasingConstructs = [
  'a',
  'abbr',
  'audio',
  'b',
  'bdo',
  'br',
  'button',
  'canvas',
  'cite',
  'code',
  'command',
  'data',
  'datalist',
  'dfn',
  'em',
  'embed',
  'i',
  'iframe',
  'img',
  'input',
  'kbd',
  'keygen',
  'label',
  'mark',
  'math',
  'meter',
  'noscript',
  'object',
  'output',
  'progress',
  'q',
  'ruby',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'svg',
  'textarea',
  'time',
  'var',
  'video',
  'wbr',
  // special cases
  'map',
  'area',
];

// copied from readium-cfi-js library
// original function called "isElementBlacklisted"
const isElementBlacklisted = (
  element,
  classBlacklist,
  elementBlacklist,
  idBlacklist,
) => {
  if (classBlacklist && classBlacklist.length) {
    const classList = getClassNameArray(element);
    if (classList.length === 1 && classBlacklist.includes(classList[0])) {
      return true
    }
    if (classList.length && intersection(classBlacklist, classList).length) {
      return true
    }
  }

  if (elementBlacklist && elementBlacklist.length) {
    if (element.tagName) {
      const isElementInBlacklist = elementBlacklist.find((blacklistedTag) =>
        matchesLocalNameOrElement(element, blacklistedTag.toLowerCase()),
      );

      if (isElementInBlacklist) {
        return true
      }
    }
  }

  if (idBlacklist && idBlacklist.length) {
    const { id } = element;
    if (id && id.length && idBlacklist.includes(id)) {
      return true
    }
  }

  return false
};

const intersection = (array1, array2) => {
  const intersectionArray = [];
  for (let value of array1) {
    const index = array2.indexOf(value);
    if (index !== -1) {
      intersectionArray.push(value);
    }
  }

  return intersectionArray
};

const getClassNameArray = (element) => {
  const { className } = element;
  if (typeof className === 'string') {
    return className.split(/\s/)
  }
  if (typeof className === 'object' && 'baseVal' in className) {
    return className.baseVal.split(/\s/)
  }
  return []
};

const matchesLocalNameOrElement = (element, otherNameOrElement) => {
  if (typeof otherNameOrElement === 'string') {
    return (element.localName || element.nodeName) === otherNameOrElement
  }
  return element === otherNameOrElement
};

/**
 * Gets the alt text from an element, if it exists, otherwise returns placeholder alt text composed of 100 unit separator character.
 * If node has empty alt attribute or alt attribute with empty string, this will return the placeholder alt text instead.
 * @param node
 * @param placeholderCharacter
 * @param placeholderLength
 * @returns {string}
 */
const getAltText = (node, placeholderCharacter, placeholderLength) => {
  let altText = node.getAttribute('alt');
  if (altText) {
    altText = altText.trim();
  }

  if (!altText) {
    const altTextPlaceholder = placeholderCharacter.repeat(placeholderLength);
    return altTextPlaceholder
  }

  return altText
};

/**
 * Checks if element with given tagname can have an alt attribute.
 * @param tagName
 * @returns {boolean}
 */
const elementCanHaveAltText = (tagName) => {
  if (!tagName) {
    return false
  }

  const tagNameLowerCase = tagName.toLowerCase();
  const elementsWithAltText = ['area', 'img', 'input', 'canvas',];
  return elementsWithAltText.includes(tagNameLowerCase)
};

class StringCollector {
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
      // The only time it should be null is at the beginning of document
      return
    }

    if (double) {
      this.lastBreak = BreakType.DOUBLE;
    } else if (this.lastBreak !== BreakType.DOUBLE) {
      this.lastBreak = BreakType.SINGLE;
    }
  }

  processBreaks() {
    if (!this.lastBreak) {
      return
    }

    switch (this.lastBreak) {
      case BreakType.SINGLE:
        this.runs.push('\n');
        break
      case BreakType.DOUBLE:
        let paragraphBreakAdded = false;
        // iterate through runs backwards:
        for (let i = this.runs.length - 1; i >= 0; i--) {
          const run = this.runs[i];
          if (run === '\n\n') {
            // found double break
            paragraphBreakAdded = true;
            break
          } else if (run !== '\n') {
            // found text content
            break
          }
        }
        if (!paragraphBreakAdded) {
          this.runs.push('\n\n');
        }
        break
    }

    this.lastBreak = BreakType.NONE;
  }

  processTextAndTrim(trimmingFunction) {
    if (this.text.length === 0) {
      return
    }

    // Trim
    const trimmed = trimmingFunction(this.text.join(''));
    if (!trimmed) {
      // Trimmed into an empty string
      // Preserve all preceding breaks
      this.text = [];
      return
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
    if (
      isElementBlacklisted(
        node,
        this.options.classBlacklist,
        this.options.elementBlacklist,
        this.options.idBlacklist,
      )
    ) {
      return true
    }

    const tag = node.tagName.toLowerCase();

    // Special case for Preformatted
    if (tag === 'pre') {
      this.processText();
      this.addBreak(false);
      this.processBreaks();

      this.runs.push(node.textContent);
      this.lastBreak = BreakType.SINGLE;

      return true
    }

    // Process other tags
    switch (tag) {
      case 'br':
        this.processText(false);
        this.processBreaks();
        this.runs.push('\n');

        return true
      case 'wbr':
        this.processBreaks();
        this.text.push('\u200B');

        return true
    }

    if (elementCanHaveAltText(node.tagName)) {
      this.processBreaks();

      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push(` ${altText} `);

      return true
    }
    if (node.tagName.toLowerCase() === 'svg' && isOpening) {
      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push(` ${altText} `);
    }

    this.processBlockConstruct(tag, isOpening);

    return false
  }

  processBlockConstruct(tag, isOpening) {
    if (phrasingConstructs.includes(tag)) {
      // Do not process phrasing tags as block constructs
      return
    }

    if (tag === 'th' || tag === 'td') {
      // Special Block
      if (isOpening) {
        // I'm assuming the DOM will fix all table element malformations

        if (!this.hasEncounteredFirstCell) {
          this.hasEncounteredFirstCell = true;
        } else {
          this.processBreaks();
          this.runs.push('\t');
        }
      } else {
        this.processText();
      }

      return
    }

    // Regular Block

    this.processText();

    if (tag === 'tr') {
      this.hasEncounteredFirstCell = false;
    }

    if (tag === 'p') {
      this.addBreak(true);
    }

    this.addBreak(false);
  }

  processTextNode(node) {
    const string = node.textContent.normalize();

    // Trim
    const trimmed = trimBeginAndEnd(string);
    if (trimmed) {
      this.processBreaks();
    }

    this.text.push(string);
  }

  getResult() {
    // Get Stragglers
    this.processText();

    return this.runs.join('')
  }
}

const MapType = {
  TEXT: 'Text',
  BREAK: 'Break',
};

class MapCollector {
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
      // The only time it should be null is at the beginning of document
      return
    }

    if (double) {
      this.lastBreak = BreakType.DOUBLE;
    } else if (this.lastBreak !== BreakType.DOUBLE) {
      this.lastBreak = BreakType.SINGLE;
    }
  }

  processBreaks() {
    if (!this.lastBreak) {
      return
    }

    switch (this.lastBreak) {
      case BreakType.SINGLE:
        this.map.push({
          type: MapType.BREAK,
          double: false,
        });
        break
      case BreakType.DOUBLE:
        let paragraphBreakAdded = false;
        // iterate through map backwards:
        for (let i = this.map.length - 1; i >= 0; --i) {
          const map = this.map[i];
          if (map.type === MapType.BREAK && map.double) {
            paragraphBreakAdded = true;
            break
          } else if (!this.isSingleBreak(map)) {
            break
          }
        }
        if (!paragraphBreakAdded) {
          this.map.push({
            type: MapType.BREAK,
            double: true,
          });
        }
        break
    }

    this.lastBreak = BreakType.NONE;
  }

  isSingleBreak(mapObject) {
    const isSingleBreak = mapObject.type === MapType.BREAK && !mapObject.double;
    const isNewLine = mapObject.type === MapType.TEXT && mapObject.content === '\n';
    return isSingleBreak || isNewLine
  }

  processTextAndTrim(trimmingFunction) {
    if (this.text.length === 0) {
      return
    }

    const joinedText = this.text.map((element) => element.string).join('');
    // TODO: might have to check for null string here
    const trimmed = trimmingFunction(joinedText);
    if (!trimmed) {
      // Trimmed into an empty string
      // Preserve all preceding breaks
      this.text = [];
      return
    }

    let fullText = trimmingFunction(trimmed);

    let blockMap = [];
    let currentIndexOfString = 0;

    for (const textMap of this.text) {
      const shrunkText = trimmingFunction(textMap.string);
      if (!shrunkText) {
        continue
      }

      const index = fullText.indexOf(shrunkText);

      if (index < 0) {
        throw new Error(
          `Could not find shrunk string \"${shrunkText}\" in \"${fullText}\"`,
        )
      }

      blockMap.push({
        type: MapType.TEXT,
        node: textMap.node,
        start: currentIndexOfString + index,
        length: shrunkText.length,
        content: shrunkText,
      });

      fullText = fullText.slice(index + shrunkText.length);
      currentIndexOfString += shrunkText.length + index;
    }

    // Do some more magic on block map
    for (let i = 1; i < blockMap.length; ++i) {
      if (
        blockMap[i].start - blockMap[i - 1].start !==
        blockMap[i - 1].length
      ) {
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
    if (
      isElementBlacklisted(
        node,
        this.options.classBlacklist,
        this.options.elementBlacklist,
        this.options.idBlacklist,
      )
    ) {
      return true
    }

    const tag = node.tagName.toLowerCase();

    // Special case for Preformatted
    if (tag === 'pre') {
      this.processText();
      this.addBreak(false);
      this.processBreaks();

      this.lastBreak = BreakType.SINGLE;

      this.map.push({
        type: MapType.TEXT,
        node,
        content: node.textContent,
        length: node.textContent.length,
      });

      return true
    }

    // Process other tags
    switch (tag) {
      case 'br':
        this.processText(false);
        this.processBreaks();

        this.map.push({
          type: MapType.TEXT,
          node,
          content: '\n',
          length: 1,
        });

        return true
      case 'wbr':
        this.processBreaks();
        this.text.push({ node, string: '\u200B' });

        return true
    }

    if (elementCanHaveAltText(node.tagName)) {
      this.processBreaks();

      const altText = getAltText(node, this.options.placeholderString, this.options.placeholderCopies);
      this.text.push({ node, string: ` ${altText} ` });

      return true
    }

    if (node.tagName.toLowerCase() === 'svg' && isOpening) {
      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      );
      this.text.push({ node, string: ` ${altText} ` });
    }

    this.processBlockConstruct(node, isOpening);

    return false
  }

  processBlockConstruct(node, isOpening) {
    const tag = node.tagName.toLowerCase();

    if (phrasingConstructs.includes(tag)) {
      // Do not process phrasing tags as block constructs
      return
    }

    if (tag === 'th' || tag === 'td') {
      // Special Block
      if (isOpening) {
        // I'm assuming the DOM will fix all table element malformations

        if (!this.hasEncounteredFirstCell) {
          this.hasEncounteredFirstCell = true;
        } else {
          this.processBreaks();
          this.map.push({
            type: MapType.TEXT,
            node,
            content: '\t',
            length: 1,
          });
        }
      } else {
        this.processText();
      }

      return
    }

    this.processText();

    if (tag === 'tr') {
      this.hasEncounteredFirstCell = false;
    }

    if (tag === 'p') {
      this.addBreak(true);
    }

    this.addBreak(false);
  }

  processTextNode(node) {
    const string = node.textContent.normalize();

    // Trim
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
          // TODO: Tests

          const whitespace = [];

          if (
            entity.node.nodeType === Node.TEXT_NODE ||
            entity.node.tagName === 'img'
          ) {
            let nodeContent;
            if (elementCanHaveAltText(entity.node.tagName)) {
              const altText = getAltText(
                entity.node,
                this.options.placeholderString,
                this.options.placeholderCopies
              ).normalize();
              nodeContent = altText;
            } else {
              nodeContent = '';
              if (entity.node.tagName === 'svg') {
                const altText = getAltText(
                  entity.node,
                  this.options.placeholderString,
                  this.options.placeholderCopies
                ).normalize();
                nodeContent = altText;
              }
              nodeContent += entity.node.textContent.normalize();
            }

            for (
              let charInMap = 0, charInNode = 0;
              charInNode < nodeContent.length;
              ++charInNode
            ) {
              const isEqual =
                entity.content.charAt(charInMap) ===
                nodeContent.charAt(charInNode);
              const isMapWhitespace = isCharWhitespace(
                entity.content.charCodeAt(charInMap),
              );
              const isNodeWhitespace = isCharWhitespace(
                nodeContent.charCodeAt(charInNode),
              );

              if (isEqual || (isMapWhitespace && isNodeWhitespace)) {
                ++charInMap;
              } else if (isMapWhitespace || isNodeWhitespace) {
                const skips = {
                  after: charInMap - 1,
                  position: charInNode,
                };
                whitespace.push(skips);
              } else {
                throw new Error(
                  `Degauss error, character mismatch and not a whitespace`,
                )
              }
            }
          }

          result.push({
            node: entity.node,
            content: entity.content,
            whitespace: whitespace,
            start: runningIndex,
            length: entity.length,
          });

          runningIndex += entity.length;

          break
        case MapType.BREAK:
          const lastResult = result[result.length - 1];

          if (entity.double) {
            lastResult.length += 2;
            runningIndex += 2;
          } else {
            lastResult.length += 1;
            runningIndex += 1;
          }

          break
      }
    }

    return result
  }
}

const walkDOM = (parentNode, collector) => {
  if (!parentNode) {
    return
  }

  processNode(parentNode, collector);

  return collector.getResult()
};

const processNode = (node, collector) => {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      collector.processTextNode(node);
      break
    case Node.ELEMENT_NODE:
      if (blacklist.includes(node.tagName.toLowerCase())) {
        return
      }
      processElementNode(node, collector);
      break
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      if (node.hasChildNodes()) {
        node.childNodes.forEach((child) => {
          processNode(child, collector);
        });
      }
      break
  }
};

const processElementNode = (node, collector) => {
  const skipRest = collector.processElementNode(node, true);

  if (skipRest) {
    return
  }

  if (node.hasChildNodes()) {
    node.childNodes.forEach((child) => {
      processNode(child, collector);
    });
  }

  collector.processElementNode(node, false);
};

/**
 * Extracts text from the given node.
 * Options include (but are not limited to):
 * - placeholderString: string to take the place of alt text when alt it is empty/undefined
 * - placeholderCopies: the number of times placeholderString repeats
 * @param parentNode
 * @param options
 * @returns {*}
 */
const degausser = (parentNode, options = {}) => {
  const unitSeparatorCode = 31;
  const defaultOptions = {
    placeholderString: String.fromCharCode(unitSeparatorCode),
    placeholderCopies: 100,
  };
  const finalOptions = Object.assign(defaultOptions, options);

  let collector = new StringCollector(finalOptions);

  if (finalOptions.map) {
    collector = new MapCollector(finalOptions);
  }

  return walkDOM(parentNode, collector)
};

const getRangeFromOffset = (start, end, doc = document, map = null, options = {}) => {
  const docType = doc.nodeType;
  if (
    docType !== Node.DOCUMENT_NODE &&
    docType !== Node.DOCUMENT_FRAGMENT_NODE
  ) {
    throw new Error('Bad Document Node')
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
      if (entry.node.nodeName === 'img') {
        range.setStartBefore(entry.node);
      } else {
        const adjustedStart = start - entry.start;

        let skips = 0;
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedStart) {
            ++skips;
          }
        }

        if (adjustedStart + skips - entry.node.length === 1){
          // space between the end of the node and the start of the next
          range.setStartAfter(entry.node);
        } else {
          range.setStart(entry.node, adjustedStart + skips);
        }
      }
    }

    if (end >= entry.start && end < entry.start + entry.length) {
      if (entry.node.nodeName === 'img') {
        range.setEndAfter(entry.node);
      } else {
        const adjustedEnd = end - entry.start;

        let skips = 0;
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedEnd) {
            ++skips;
          }
        }

        if (adjustedEnd + skips - entry.node.length === 1){
          // space between the end of the node and the start of the next
          range.setEndAfter(entry.node);
        } else {
          range.setEnd(entry.node, adjustedEnd + skips);
        }
      }
      break
    }
  }

  return range
};

export { degausser, getRangeFromOffset };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVnYXVzc2VyLmVzbS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZ2F1c3NlckAyLjQuNC9ub2RlX21vZHVsZXMvZGVnYXVzc2VyL3NyYy91dGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZ2F1c3NlckAyLjQuNC9ub2RlX21vZHVsZXMvZGVnYXVzc2VyL3NyYy9zdHJpbmdDb2xsZWN0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZGVnYXVzc2VyQDIuNC40L25vZGVfbW9kdWxlcy9kZWdhdXNzZXIvc3JjL21hcENvbGxlY3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9kZWdhdXNzZXJAMi40LjQvbm9kZV9tb2R1bGVzL2RlZ2F1c3Nlci9zcmMvZG9tV2Fsa2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZ2F1c3NlckAyLjQuNC9ub2RlX21vZHVsZXMvZGVnYXVzc2VyL3NyYy9kZWdhdXNzZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gYXV0b0JpbmQoKSB7XG4gIGZvciAobGV0IHByb3Agb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpKSkge1xuICAgIGlmIChwcm9wID09PSAnY29uc3RydWN0b3InIHx8IHR5cGVvZiB0aGlzW3Byb3BdICE9PSAnZnVuY3Rpb24nKSBjb250aW51ZVxuICAgIHRoaXNbcHJvcF0gPSB0aGlzW3Byb3BdLmJpbmQodGhpcylcbiAgfVxufVxuXG4vLyBDaGFyIGNvZGVzIGZvciBcXHQsIFxcbiwgYW5kIG5vbi0mbmJzcDsgc3BhY2UgY2hhcmFjdGVyXG5jb25zdCB3aGl0ZXNwYWNlcyA9IFs5LCAxMCwgMTMsIDMyXVxuY29uc3QgaXNDaGFyV2hpdGVzcGFjZSA9IChjaGFyQ29kZSkgPT4ge1xuICByZXR1cm4gd2hpdGVzcGFjZXMuaW5jbHVkZXMoY2hhckNvZGUpXG59XG5cbmNvbnN0IGlzQ2hhck5ld0xpbmUgPSAoY2hhckNvZGUpID0+IHtcbiAgcmV0dXJuIGNoYXJDb2RlID09PSAxMCB8fCBjaGFyQ29kZSA9PT0gMTNcbn1cblxuY29uc3QgQnJlYWtUeXBlID0ge1xuICBOT05FOiAnbm9uZScsXG4gIFNJTkdMRTogJ3NpbmdsZScsXG4gIERPVUJMRTogJ2RvdWJsZScsXG59XG5cbi8qKlxuICogVHJpbSB3aGl0ZXNwYWNlIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmdcbiAqIEBwYXJhbSBzdHJpbmdcbiAqIEByZXR1cm5zIHsgc3RyaW5nIH1cbiAqL1xuY29uc3QgdHJpbUJlZ2luT25seSA9IChzdHJpbmcpID0+IHtcbiAgLy8gR2V0IHRoZSBmaXJzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgaW5kZXhcbiAgbGV0IGZpcnN0Tm9uV2hpdGUgPSBudWxsXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzdHJpbmcubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoIWlzQ2hhcldoaXRlc3BhY2Uoc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgZmlyc3ROb25XaGl0ZSA9IGluZGV4XG4gICAgICBicmVha1xuICAgICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGZpcnN0IG5vbi13aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBudWxsLCB0aGUgc3RyaW5nIGlzIGVudGlyZWx5IHdoaXRlc3BhY2VcbiAgaWYgKGZpcnN0Tm9uV2hpdGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBzdHJpbmdcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgbm9uLWVtcHR5IHNlY3Rpb25zIG9mIHRoZSBzdHJpbmdcbiAgcmV0dXJuIHN0cmluZy5zbGljZShmaXJzdE5vbldoaXRlKVxufVxuXG4vKipcbiAqIFRyaW0gYW55IG5ldyBsaW5lIGNoYXJhY3RlcnMgZnJvbSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAqIEFsc28gdHJpbSBhbnkgd2hpdGVzcGFjZSB0aGF0IGNvbWVzIGFmdGVyIHRoYXQgbmV3IGxpbmUgY2hhcmFjdGVyLCBidXQgbm90IGFueSB0aGF0IGNvbWVzIGJlZm9yZS5cbiAqIEBwYXJhbSBzdHJpbmdcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCB0cmltRW5kTmV3TGluZSA9IChzdHJpbmcpID0+IHtcbiAgbGV0IGxhc3ROb25OZXdMaW5lID0gbnVsbFxuICBsZXQgZm91bmROZXdMaW5lQ2hhcmFjdGVyID0gZmFsc2VcbiAgbGV0IGZvdW5kTm9uV2hpdGVTcGFjZUNoYXJhY3RlciA9IGZhbHNlXG4gIGZvciAobGV0IGluZGV4ID0gc3RyaW5nLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcbiAgICBjb25zdCBjaGFyQ29kZSA9IHN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuICAgIGNvbnN0IGlzTmV3TGluZSA9IGlzQ2hhck5ld0xpbmUoY2hhckNvZGUpXG4gICAgaWYgKGlzQ2hhcldoaXRlc3BhY2UoY2hhckNvZGUpKSB7XG4gICAgICBpZiAoIWlzTmV3TGluZSkge1xuICAgICAgICAvLyBva2F5IHRvIHRyaW0gb3V0IGFueSB3aGl0ZSBzcGFjZVxuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmROZXdMaW5lQ2hhcmFjdGVyID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3VuZE5vbldoaXRlU3BhY2VDaGFyYWN0ZXIgPSB0cnVlXG4gICAgfVxuICAgIGlmICghaXNOZXdMaW5lKSB7XG4gICAgICBpZiAoZm91bmROZXdMaW5lQ2hhcmFjdGVyKSB7XG4gICAgICAgIGxhc3ROb25OZXdMaW5lID0gaW5kZXhcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKCFmb3VuZE5vbldoaXRlU3BhY2VDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIC8vIElmIGJvdGggYXJlIG51bGwsIHRoZSBzdHJpbmcgaXMgZW50aXJlbHkgd2hpdGVzcGFjZVxuICBpZiAobGFzdE5vbk5ld0xpbmUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gc3RyaW5nXG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIG5vbi1lbXB0eSBzZWN0aW9ucyBvZiB0aGUgc3RyaW5nXG4gIHJldHVybiBzdHJpbmcuc2xpY2UoXG4gICAgICAwLFxuICAgICAgbGFzdE5vbk5ld0xpbmUgPyBsYXN0Tm9uTmV3TGluZSArIDEgOiB1bmRlZmluZWQsXG4gIClcbn1cblxuLyoqXG4gKiBUcmltcyBhbnkgd2hpdGVzcGFjZSBhdCB0aGUgc3RhcnQgYW5kIHRyaW1zIGFueSBuZXdsaW5lIGNoYXJhY3RlcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLlxuICogVHJpbXMgYW55IHdoaXRlc3BhY2UgYWZ0ZXIgbmV3bGluZSBjaGFyYWN0ZXJzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgYnV0IG5vdCBhbnkgdGhhdCBjb21lcyBiZWZvcmUuXG4gKiBAcGFyYW0gc3RyaW5nXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuY29uc3QgdHJpbUFsbEV4Y2VwdEVuZFdoaXRlU3BhY2UgPSAoc3RyaW5nKSA9PiB7XG4gIHJldHVybiB0cmltRW5kTmV3TGluZSh0cmltQmVnaW5Pbmx5KHN0cmluZykpXG59XG5cbmNvbnN0IHRyaW1CZWdpbkFuZEVuZCA9IChzdHJpbmcpID0+IHtcbiAgLy8gR2V0IHRoZSBmaXJzdCBhbmQgbGFzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgaW5kZXhcbiAgbGV0IGZpcnN0Tm9uV2hpdGUgPSBudWxsLFxuICAgIGxhc3ROb25XaGl0ZSA9IG51bGxcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHN0cmluZy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBpZiAoIWlzQ2hhcldoaXRlc3BhY2Uoc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgZmlyc3ROb25XaGl0ZSA9IGluZGV4XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICBmb3IgKGxldCBpbmRleCA9IHN0cmluZy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG4gICAgaWYgKCFpc0NoYXJXaGl0ZXNwYWNlKHN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSkpIHtcbiAgICAgIC8vIGlmKGluZGV4ICE9PSBzdHJpbmcubGVuZ3RoIC0gMSl7XG4gICAgICAvLyBTdHJpbmcgc2xpY2luZyBicmVha3MgaWYgdGhlIGxhc3QgY2hhciBpcyBub3Qgd2hpdGVzcGFjZVxuICAgICAgbGFzdE5vbldoaXRlID0gaW5kZXhcbiAgICAgIC8vIH1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLy8gSWYgYm90aCBhcmUgbnVsbCwgdGhlIHN0cmluZyBpcyBlbnRpcmVseSB3aGl0ZXNwYWNlXG4gIGlmIChmaXJzdE5vbldoaXRlID09PSBudWxsIHx8IGxhc3ROb25XaGl0ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIG5vbi1lbXB0eSBzZWN0aW9ucyBvZiB0aGUgc3RyaW5nXG4gIHJldHVybiBzdHJpbmcuc2xpY2UoXG4gICAgZmlyc3ROb25XaGl0ZSxcbiAgICBsYXN0Tm9uV2hpdGUgPyBsYXN0Tm9uV2hpdGUgKyAxIDogdW5kZWZpbmVkLFxuICApXG59XG5cbmNvbnN0IGNvbGxhcHNlV2hpdGVzcGFjZSA9IChzdHJpbmcpID0+IHtcbiAgLy8gQ29sbGFwc2UgYWxsIG90aGVyIHNlcXVlbnRpYWwgd2hpdGVzcGFjZSBpbnRvIGEgc2luZ2xlIHdoaXRlc3BhY2VcbiAgY29uc3QgdGV4dEVsZW1lbnRzID0gW11cbiAgbGV0IHN0YXJ0T2ZOb25XaGl0ZSA9IG51bGxcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHN0cmluZy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBpZiAoXG4gICAgICBzdGFydE9mTm9uV2hpdGUgPT09IG51bGwgJiZcbiAgICAgICFpc0NoYXJXaGl0ZXNwYWNlKHN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSlcbiAgICApIHtcbiAgICAgIHN0YXJ0T2ZOb25XaGl0ZSA9IGluZGV4XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoXG4gICAgICBzdGFydE9mTm9uV2hpdGUgIT09IG51bGwgJiZcbiAgICAgIGlzQ2hhcldoaXRlc3BhY2Uoc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpKVxuICAgICkge1xuICAgICAgdGV4dEVsZW1lbnRzLnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0T2ZOb25XaGl0ZSwgaW5kZXgpKVxuICAgICAgc3RhcnRPZk5vbldoaXRlID0gbnVsbFxuICAgICAgY29udGludWVcbiAgICB9XG4gIH1cblxuICAvLyBBdCB0aGUgZW5kLCBhZGQgdGhlIHJlc3Qgb2YgdGhlIHN0cmluZ1xuICBpZiAoc3RhcnRPZk5vbldoaXRlICE9PSBudWxsKSB7XG4gICAgdGV4dEVsZW1lbnRzLnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0T2ZOb25XaGl0ZSkpXG4gIH1cblxuICByZXR1cm4gdGV4dEVsZW1lbnRzLmpvaW4oJyAnKVxufVxuXG5jb25zdCB0cmltQW5kQ29sbGFwc2VXaGl0ZXNwYWNlID0gKHN0cmluZykgPT4ge1xuICByZXR1cm4gdHJpbUJlZ2luQW5kRW5kKGNvbGxhcHNlV2hpdGVzcGFjZShzdHJpbmcpKVxufVxuXG5jb25zdCBibGFja2xpc3QgPSBbXG4gICdiYXNlJyxcbiAgJ2NvbW1hbmQnLFxuICAnbGluaycsXG4gICdtZXRhJyxcbiAgJ25vc2NyaXB0JyxcbiAgJ3NjcmlwdCcsXG4gICdzdHlsZScsXG4gICd0aXRsZScsXG4gIC8vIHNwZWNpYWwgY2FzZXNcbiAgLy8gXCJodG1sXCIsXG4gICdoZWFkJyxcbl1cblxuY29uc3QgcGhyYXNpbmdDb25zdHJ1Y3RzID0gW1xuICAnYScsXG4gICdhYmJyJyxcbiAgJ2F1ZGlvJyxcbiAgJ2InLFxuICAnYmRvJyxcbiAgJ2JyJyxcbiAgJ2J1dHRvbicsXG4gICdjYW52YXMnLFxuICAnY2l0ZScsXG4gICdjb2RlJyxcbiAgJ2NvbW1hbmQnLFxuICAnZGF0YScsXG4gICdkYXRhbGlzdCcsXG4gICdkZm4nLFxuICAnZW0nLFxuICAnZW1iZWQnLFxuICAnaScsXG4gICdpZnJhbWUnLFxuICAnaW1nJyxcbiAgJ2lucHV0JyxcbiAgJ2tiZCcsXG4gICdrZXlnZW4nLFxuICAnbGFiZWwnLFxuICAnbWFyaycsXG4gICdtYXRoJyxcbiAgJ21ldGVyJyxcbiAgJ25vc2NyaXB0JyxcbiAgJ29iamVjdCcsXG4gICdvdXRwdXQnLFxuICAncHJvZ3Jlc3MnLFxuICAncScsXG4gICdydWJ5JyxcbiAgJ3NhbXAnLFxuICAnc2NyaXB0JyxcbiAgJ3NlbGVjdCcsXG4gICdzbWFsbCcsXG4gICdzcGFuJyxcbiAgJ3N0cm9uZycsXG4gICdzdWInLFxuICAnc3VwJyxcbiAgJ3N2ZycsXG4gICd0ZXh0YXJlYScsXG4gICd0aW1lJyxcbiAgJ3ZhcicsXG4gICd2aWRlbycsXG4gICd3YnInLFxuICAvLyBzcGVjaWFsIGNhc2VzXG4gICdtYXAnLFxuICAnYXJlYScsXG5dXG5cbi8vIGNvcGllZCBmcm9tIHJlYWRpdW0tY2ZpLWpzIGxpYnJhcnlcbi8vIG9yaWdpbmFsIGZ1bmN0aW9uIGNhbGxlZCBcImlzRWxlbWVudEJsYWNrbGlzdGVkXCJcbmNvbnN0IGlzRWxlbWVudEJsYWNrbGlzdGVkID0gKFxuICBlbGVtZW50LFxuICBjbGFzc0JsYWNrbGlzdCxcbiAgZWxlbWVudEJsYWNrbGlzdCxcbiAgaWRCbGFja2xpc3QsXG4pID0+IHtcbiAgaWYgKGNsYXNzQmxhY2tsaXN0ICYmIGNsYXNzQmxhY2tsaXN0Lmxlbmd0aCkge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IGdldENsYXNzTmFtZUFycmF5KGVsZW1lbnQpXG4gICAgaWYgKGNsYXNzTGlzdC5sZW5ndGggPT09IDEgJiYgY2xhc3NCbGFja2xpc3QuaW5jbHVkZXMoY2xhc3NMaXN0WzBdKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKGNsYXNzTGlzdC5sZW5ndGggJiYgaW50ZXJzZWN0aW9uKGNsYXNzQmxhY2tsaXN0LCBjbGFzc0xpc3QpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICBpZiAoZWxlbWVudEJsYWNrbGlzdCAmJiBlbGVtZW50QmxhY2tsaXN0Lmxlbmd0aCkge1xuICAgIGlmIChlbGVtZW50LnRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IGlzRWxlbWVudEluQmxhY2tsaXN0ID0gZWxlbWVudEJsYWNrbGlzdC5maW5kKChibGFja2xpc3RlZFRhZykgPT5cbiAgICAgICAgbWF0Y2hlc0xvY2FsTmFtZU9yRWxlbWVudChlbGVtZW50LCBibGFja2xpc3RlZFRhZy50b0xvd2VyQ2FzZSgpKSxcbiAgICAgIClcblxuICAgICAgaWYgKGlzRWxlbWVudEluQmxhY2tsaXN0KSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGlkQmxhY2tsaXN0ICYmIGlkQmxhY2tsaXN0Lmxlbmd0aCkge1xuICAgIGNvbnN0IHsgaWQgfSA9IGVsZW1lbnRcbiAgICBpZiAoaWQgJiYgaWQubGVuZ3RoICYmIGlkQmxhY2tsaXN0LmluY2x1ZGVzKGlkKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuY29uc3QgaW50ZXJzZWN0aW9uID0gKGFycmF5MSwgYXJyYXkyKSA9PiB7XG4gIGNvbnN0IGludGVyc2VjdGlvbkFycmF5ID0gW11cbiAgZm9yIChsZXQgdmFsdWUgb2YgYXJyYXkxKSB7XG4gICAgY29uc3QgaW5kZXggPSBhcnJheTIuaW5kZXhPZih2YWx1ZSlcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBpbnRlcnNlY3Rpb25BcnJheS5wdXNoKHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbnRlcnNlY3Rpb25BcnJheVxufVxuXG5jb25zdCBnZXRDbGFzc05hbWVBcnJheSA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lIH0gPSBlbGVtZW50XG4gIGlmICh0eXBlb2YgY2xhc3NOYW1lID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjbGFzc05hbWUuc3BsaXQoL1xccy8pXG4gIH1cbiAgaWYgKHR5cGVvZiBjbGFzc05hbWUgPT09ICdvYmplY3QnICYmICdiYXNlVmFsJyBpbiBjbGFzc05hbWUpIHtcbiAgICByZXR1cm4gY2xhc3NOYW1lLmJhc2VWYWwuc3BsaXQoL1xccy8pXG4gIH1cbiAgcmV0dXJuIFtdXG59XG5cbmNvbnN0IG1hdGNoZXNMb2NhbE5hbWVPckVsZW1lbnQgPSAoZWxlbWVudCwgb3RoZXJOYW1lT3JFbGVtZW50KSA9PiB7XG4gIGlmICh0eXBlb2Ygb3RoZXJOYW1lT3JFbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiAoZWxlbWVudC5sb2NhbE5hbWUgfHwgZWxlbWVudC5ub2RlTmFtZSkgPT09IG90aGVyTmFtZU9yRWxlbWVudFxuICB9XG4gIHJldHVybiBlbGVtZW50ID09PSBvdGhlck5hbWVPckVsZW1lbnRcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBhbHQgdGV4dCBmcm9tIGFuIGVsZW1lbnQsIGlmIGl0IGV4aXN0cywgb3RoZXJ3aXNlIHJldHVybnMgcGxhY2Vob2xkZXIgYWx0IHRleHQgY29tcG9zZWQgb2YgMTAwIHVuaXQgc2VwYXJhdG9yIGNoYXJhY3Rlci5cbiAqIElmIG5vZGUgaGFzIGVtcHR5IGFsdCBhdHRyaWJ1dGUgb3IgYWx0IGF0dHJpYnV0ZSB3aXRoIGVtcHR5IHN0cmluZywgdGhpcyB3aWxsIHJldHVybiB0aGUgcGxhY2Vob2xkZXIgYWx0IHRleHQgaW5zdGVhZC5cbiAqIEBwYXJhbSBub2RlXG4gKiBAcGFyYW0gcGxhY2Vob2xkZXJDaGFyYWN0ZXJcbiAqIEBwYXJhbSBwbGFjZWhvbGRlckxlbmd0aFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0QWx0VGV4dCA9IChub2RlLCBwbGFjZWhvbGRlckNoYXJhY3RlciwgcGxhY2Vob2xkZXJMZW5ndGgpID0+IHtcbiAgbGV0IGFsdFRleHQgPSBub2RlLmdldEF0dHJpYnV0ZSgnYWx0JylcbiAgaWYgKGFsdFRleHQpIHtcbiAgICBhbHRUZXh0ID0gYWx0VGV4dC50cmltKClcbiAgfVxuXG4gIGlmICghYWx0VGV4dCkge1xuICAgIGNvbnN0IGFsdFRleHRQbGFjZWhvbGRlciA9IHBsYWNlaG9sZGVyQ2hhcmFjdGVyLnJlcGVhdChwbGFjZWhvbGRlckxlbmd0aClcbiAgICByZXR1cm4gYWx0VGV4dFBsYWNlaG9sZGVyXG4gIH1cblxuICByZXR1cm4gYWx0VGV4dFxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBlbGVtZW50IHdpdGggZ2l2ZW4gdGFnbmFtZSBjYW4gaGF2ZSBhbiBhbHQgYXR0cmlidXRlLlxuICogQHBhcmFtIHRhZ05hbWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5jb25zdCBlbGVtZW50Q2FuSGF2ZUFsdFRleHQgPSAodGFnTmFtZSkgPT4ge1xuICBpZiAoIXRhZ05hbWUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IHRhZ05hbWVMb3dlckNhc2UgPSB0YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgY29uc3QgZWxlbWVudHNXaXRoQWx0VGV4dCA9IFsnYXJlYScsICdpbWcnLCAnaW5wdXQnLCAnY2FudmFzJyxdXG4gIHJldHVybiBlbGVtZW50c1dpdGhBbHRUZXh0LmluY2x1ZGVzKHRhZ05hbWVMb3dlckNhc2UpXG59XG5cbmV4cG9ydCB7XG4gIGF1dG9CaW5kLFxuICBibGFja2xpc3QsXG4gIEJyZWFrVHlwZSxcbiAgdHJpbUJlZ2luT25seSxcbiAgdHJpbUVuZE5ld0xpbmUsXG4gIHRyaW1CZWdpbkFuZEVuZCxcbiAgdHJpbUFsbEV4Y2VwdEVuZFdoaXRlU3BhY2UsXG4gIHRyaW1BbmRDb2xsYXBzZVdoaXRlc3BhY2UsXG4gIGNvbGxhcHNlV2hpdGVzcGFjZSxcbiAgcGhyYXNpbmdDb25zdHJ1Y3RzLFxuICBpc0VsZW1lbnRCbGFja2xpc3RlZCxcbiAgaXNDaGFyV2hpdGVzcGFjZSxcbiAgZ2V0QWx0VGV4dCxcbiAgZWxlbWVudENhbkhhdmVBbHRUZXh0LFxufVxuIiwiaW1wb3J0IHtcbiAgYXV0b0JpbmQsXG4gIEJyZWFrVHlwZSxcbiAgdHJpbUJlZ2luQW5kRW5kLFxuICBwaHJhc2luZ0NvbnN0cnVjdHMsXG4gIGlzRWxlbWVudEJsYWNrbGlzdGVkLFxuICBnZXRBbHRUZXh0LFxuICBlbGVtZW50Q2FuSGF2ZUFsdFRleHQsXG4gIHRyaW1BbmRDb2xsYXBzZVdoaXRlc3BhY2UsXG4gIHRyaW1BbGxFeGNlcHRFbmRXaGl0ZVNwYWNlLFxufSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdDb2xsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnJ1bnMgPSBbXVxuICAgIHRoaXMudGV4dCA9IFtdXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgdGhpcy5oYXNFbmNvdW50ZXJlZEZpcnN0Q2VsbCA9IGZhbHNlXG4gICAgdGhpcy5sYXN0QnJlYWsgPSBudWxsXG5cbiAgICBhdXRvQmluZC5jYWxsKHRoaXMpXG4gIH1cblxuICBhZGRCcmVhayhkb3VibGUpIHtcbiAgICBpZiAodGhpcy5sYXN0QnJlYWsgPT09IG51bGwpIHtcbiAgICAgIC8vIFRoZSBvbmx5IHRpbWUgaXQgc2hvdWxkIGJlIG51bGwgaXMgYXQgdGhlIGJlZ2lubmluZyBvZiBkb2N1bWVudFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGRvdWJsZSkge1xuICAgICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuRE9VQkxFXG4gICAgfSBlbHNlIGlmICh0aGlzLmxhc3RCcmVhayAhPT0gQnJlYWtUeXBlLkRPVUJMRSkge1xuICAgICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuU0lOR0xFXG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0JyZWFrcygpIHtcbiAgICBpZiAoIXRoaXMubGFzdEJyZWFrKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMubGFzdEJyZWFrKSB7XG4gICAgICBjYXNlIEJyZWFrVHlwZS5TSU5HTEU6XG4gICAgICAgIHRoaXMucnVucy5wdXNoKCdcXG4nKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBCcmVha1R5cGUuRE9VQkxFOlxuICAgICAgICBsZXQgcGFyYWdyYXBoQnJlYWtBZGRlZCA9IGZhbHNlXG4gICAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBydW5zIGJhY2t3YXJkczpcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMucnVucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGNvbnN0IHJ1biA9IHRoaXMucnVuc1tpXVxuICAgICAgICAgIGlmIChydW4gPT09ICdcXG5cXG4nKSB7XG4gICAgICAgICAgICAvLyBmb3VuZCBkb3VibGUgYnJlYWtcbiAgICAgICAgICAgIHBhcmFncmFwaEJyZWFrQWRkZWQgPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSBpZiAocnVuICE9PSAnXFxuJykge1xuICAgICAgICAgICAgLy8gZm91bmQgdGV4dCBjb250ZW50XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcmFncmFwaEJyZWFrQWRkZWQpIHtcbiAgICAgICAgICB0aGlzLnJ1bnMucHVzaCgnXFxuXFxuJylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgIH1cblxuICAgIHRoaXMubGFzdEJyZWFrID0gQnJlYWtUeXBlLk5PTkVcbiAgfVxuXG4gIHByb2Nlc3NUZXh0QW5kVHJpbSh0cmltbWluZ0Z1bmN0aW9uKSB7XG4gICAgaWYgKHRoaXMudGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFRyaW1cbiAgICBjb25zdCB0cmltbWVkID0gdHJpbW1pbmdGdW5jdGlvbih0aGlzLnRleHQuam9pbignJykpXG4gICAgaWYgKCF0cmltbWVkKSB7XG4gICAgICAvLyBUcmltbWVkIGludG8gYW4gZW1wdHkgc3RyaW5nXG4gICAgICAvLyBQcmVzZXJ2ZSBhbGwgcHJlY2VkaW5nIGJyZWFrc1xuICAgICAgdGhpcy50ZXh0ID0gW11cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLmxhc3RCcmVhayA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuTk9ORVxuICAgIH1cblxuICAgIHRoaXMucnVucy5wdXNoKHRyaW1taW5nRnVuY3Rpb24odHJpbW1lZCkpXG4gICAgdGhpcy50ZXh0ID0gW11cbiAgfVxuXG4gIHByb2Nlc3NUZXh0KHRyaW1FbmRTcGFjZXMgPSB0cnVlKSB7XG4gICAgaWYgKHRyaW1FbmRTcGFjZXMpIHtcbiAgICAgIHRoaXMucHJvY2Vzc1RleHRBbmRUcmltKHRyaW1BbmRDb2xsYXBzZVdoaXRlc3BhY2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvY2Vzc1RleHRBbmRUcmltKHRyaW1BbGxFeGNlcHRFbmRXaGl0ZVNwYWNlKVxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NFbGVtZW50Tm9kZShub2RlLCBpc09wZW5pbmcpIHtcbiAgICBpZiAoXG4gICAgICBpc0VsZW1lbnRCbGFja2xpc3RlZChcbiAgICAgICAgbm9kZSxcbiAgICAgICAgdGhpcy5vcHRpb25zLmNsYXNzQmxhY2tsaXN0LFxuICAgICAgICB0aGlzLm9wdGlvbnMuZWxlbWVudEJsYWNrbGlzdCxcbiAgICAgICAgdGhpcy5vcHRpb25zLmlkQmxhY2tsaXN0LFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBQcmVmb3JtYXR0ZWRcbiAgICBpZiAodGFnID09PSAncHJlJykge1xuICAgICAgdGhpcy5wcm9jZXNzVGV4dCgpXG4gICAgICB0aGlzLmFkZEJyZWFrKGZhbHNlKVxuICAgICAgdGhpcy5wcm9jZXNzQnJlYWtzKClcblxuICAgICAgdGhpcy5ydW5zLnB1c2gobm9kZS50ZXh0Q29udGVudClcbiAgICAgIHRoaXMubGFzdEJyZWFrID0gQnJlYWtUeXBlLlNJTkdMRVxuXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFByb2Nlc3Mgb3RoZXIgdGFnc1xuICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICBjYXNlICdicic6XG4gICAgICAgIHRoaXMucHJvY2Vzc1RleHQoZmFsc2UpXG4gICAgICAgIHRoaXMucHJvY2Vzc0JyZWFrcygpXG4gICAgICAgIHRoaXMucnVucy5wdXNoKCdcXG4nKVxuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBjYXNlICd3YnInOlxuICAgICAgICB0aGlzLnByb2Nlc3NCcmVha3MoKVxuICAgICAgICB0aGlzLnRleHQucHVzaCgnXFx1MjAwQicpXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudENhbkhhdmVBbHRUZXh0KG5vZGUudGFnTmFtZSkpIHtcbiAgICAgIHRoaXMucHJvY2Vzc0JyZWFrcygpXG5cbiAgICAgIGNvbnN0IGFsdFRleHQgPSBnZXRBbHRUZXh0KFxuICAgICAgICBub2RlLFxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJTdHJpbmcsXG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlckNvcGllc1xuICAgICAgKVxuICAgICAgdGhpcy50ZXh0LnB1c2goYCAke2FsdFRleHR9IGApXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3N2ZycgJiYgaXNPcGVuaW5nKSB7XG4gICAgICBjb25zdCBhbHRUZXh0ID0gZ2V0QWx0VGV4dChcbiAgICAgICAgbm9kZSxcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyU3RyaW5nLFxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJDb3BpZXNcbiAgICAgIClcbiAgICAgIHRoaXMudGV4dC5wdXNoKGAgJHthbHRUZXh0fSBgKVxuICAgIH1cblxuICAgIHRoaXMucHJvY2Vzc0Jsb2NrQ29uc3RydWN0KHRhZywgaXNPcGVuaW5nKVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBwcm9jZXNzQmxvY2tDb25zdHJ1Y3QodGFnLCBpc09wZW5pbmcpIHtcbiAgICBpZiAocGhyYXNpbmdDb25zdHJ1Y3RzLmluY2x1ZGVzKHRhZykpIHtcbiAgICAgIC8vIERvIG5vdCBwcm9jZXNzIHBocmFzaW5nIHRhZ3MgYXMgYmxvY2sgY29uc3RydWN0c1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRhZyA9PT0gJ3RoJyB8fCB0YWcgPT09ICd0ZCcpIHtcbiAgICAgIC8vIFNwZWNpYWwgQmxvY2tcbiAgICAgIGlmIChpc09wZW5pbmcpIHtcbiAgICAgICAgLy8gSSdtIGFzc3VtaW5nIHRoZSBET00gd2lsbCBmaXggYWxsIHRhYmxlIGVsZW1lbnQgbWFsZm9ybWF0aW9uc1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNFbmNvdW50ZXJlZEZpcnN0Q2VsbCkge1xuICAgICAgICAgIHRoaXMuaGFzRW5jb3VudGVyZWRGaXJzdENlbGwgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzQnJlYWtzKClcbiAgICAgICAgICB0aGlzLnJ1bnMucHVzaCgnXFx0JylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzVGV4dCgpXG4gICAgICB9XG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFJlZ3VsYXIgQmxvY2tcblxuICAgIHRoaXMucHJvY2Vzc1RleHQoKVxuXG4gICAgaWYgKHRhZyA9PT0gJ3RyJykge1xuICAgICAgdGhpcy5oYXNFbmNvdW50ZXJlZEZpcnN0Q2VsbCA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHRhZyA9PT0gJ3AnKSB7XG4gICAgICB0aGlzLmFkZEJyZWFrKHRydWUpXG4gICAgfVxuXG4gICAgdGhpcy5hZGRCcmVhayhmYWxzZSlcbiAgfVxuXG4gIHByb2Nlc3NUZXh0Tm9kZShub2RlKSB7XG4gICAgY29uc3Qgc3RyaW5nID0gbm9kZS50ZXh0Q29udGVudC5ub3JtYWxpemUoKVxuXG4gICAgLy8gVHJpbVxuICAgIGNvbnN0IHRyaW1tZWQgPSB0cmltQmVnaW5BbmRFbmQoc3RyaW5nKVxuICAgIGlmICh0cmltbWVkKSB7XG4gICAgICB0aGlzLnByb2Nlc3NCcmVha3MoKVxuICAgIH1cblxuICAgIHRoaXMudGV4dC5wdXNoKHN0cmluZylcbiAgfVxuXG4gIGdldFJlc3VsdCgpIHtcbiAgICAvLyBHZXQgU3RyYWdnbGVyc1xuICAgIHRoaXMucHJvY2Vzc1RleHQoKVxuXG4gICAgcmV0dXJuIHRoaXMucnVucy5qb2luKCcnKVxuICB9XG59XG4iLCJpbXBvcnQge1xuICBhdXRvQmluZCxcbiAgQnJlYWtUeXBlLFxuICB0cmltQmVnaW5BbmRFbmQsXG4gIGlzQ2hhcldoaXRlc3BhY2UsXG4gIHBocmFzaW5nQ29uc3RydWN0cyxcbiAgaXNFbGVtZW50QmxhY2tsaXN0ZWQsXG4gIGdldEFsdFRleHQsXG4gIGVsZW1lbnRDYW5IYXZlQWx0VGV4dCxcbiAgdHJpbUFsbEV4Y2VwdEVuZFdoaXRlU3BhY2UsXG4gIHRyaW1BbmRDb2xsYXBzZVdoaXRlc3BhY2UsXG59IGZyb20gJy4vdXRpbCdcblxuY29uc3QgTWFwVHlwZSA9IHtcbiAgVEVYVDogJ1RleHQnLFxuICBCUkVBSzogJ0JyZWFrJyxcbn1cblxuZXhwb3J0IGNsYXNzIE1hcENvbGxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubWFwID0gW11cbiAgICB0aGlzLnRleHQgPSBbXVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgdGhpcy5oYXNFbmNvdW50ZXJlZEZpcnN0Q2VsbCA9IGZhbHNlXG4gICAgdGhpcy5sYXN0QnJlYWsgPSBudWxsXG5cbiAgICBhdXRvQmluZC5jYWxsKHRoaXMpXG4gIH1cblxuICBhZGRCcmVhayhkb3VibGUpIHtcbiAgICBpZiAodGhpcy5sYXN0QnJlYWsgPT09IG51bGwpIHtcbiAgICAgIC8vIFRoZSBvbmx5IHRpbWUgaXQgc2hvdWxkIGJlIG51bGwgaXMgYXQgdGhlIGJlZ2lubmluZyBvZiBkb2N1bWVudFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGRvdWJsZSkge1xuICAgICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuRE9VQkxFXG4gICAgfSBlbHNlIGlmICh0aGlzLmxhc3RCcmVhayAhPT0gQnJlYWtUeXBlLkRPVUJMRSkge1xuICAgICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuU0lOR0xFXG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0JyZWFrcygpIHtcbiAgICBpZiAoIXRoaXMubGFzdEJyZWFrKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMubGFzdEJyZWFrKSB7XG4gICAgICBjYXNlIEJyZWFrVHlwZS5TSU5HTEU6XG4gICAgICAgIHRoaXMubWFwLnB1c2goe1xuICAgICAgICAgIHR5cGU6IE1hcFR5cGUuQlJFQUssXG4gICAgICAgICAgZG91YmxlOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgQnJlYWtUeXBlLkRPVUJMRTpcbiAgICAgICAgbGV0IHBhcmFncmFwaEJyZWFrQWRkZWQgPSBmYWxzZVxuICAgICAgICAvLyBpdGVyYXRlIHRocm91Z2ggbWFwIGJhY2t3YXJkczpcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMubWFwLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5tYXBbaV1cbiAgICAgICAgICBpZiAobWFwLnR5cGUgPT09IE1hcFR5cGUuQlJFQUsgJiYgbWFwLmRvdWJsZSkge1xuICAgICAgICAgICAgcGFyYWdyYXBoQnJlYWtBZGRlZCA9IHRydWVcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1NpbmdsZUJyZWFrKG1hcCkpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyYWdyYXBoQnJlYWtBZGRlZCkge1xuICAgICAgICAgIHRoaXMubWFwLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogTWFwVHlwZS5CUkVBSyxcbiAgICAgICAgICAgIGRvdWJsZTogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgdGhpcy5sYXN0QnJlYWsgPSBCcmVha1R5cGUuTk9ORVxuICB9XG5cbiAgaXNTaW5nbGVCcmVhayhtYXBPYmplY3QpIHtcbiAgICBjb25zdCBpc1NpbmdsZUJyZWFrID0gbWFwT2JqZWN0LnR5cGUgPT09IE1hcFR5cGUuQlJFQUsgJiYgIW1hcE9iamVjdC5kb3VibGVcbiAgICBjb25zdCBpc05ld0xpbmUgPSBtYXBPYmplY3QudHlwZSA9PT0gTWFwVHlwZS5URVhUICYmIG1hcE9iamVjdC5jb250ZW50ID09PSAnXFxuJ1xuICAgIHJldHVybiBpc1NpbmdsZUJyZWFrIHx8IGlzTmV3TGluZVxuICB9XG5cbiAgcHJvY2Vzc1RleHRBbmRUcmltKHRyaW1taW5nRnVuY3Rpb24pIHtcbiAgICBpZiAodGhpcy50ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgam9pbmVkVGV4dCA9IHRoaXMudGV4dC5tYXAoKGVsZW1lbnQpID0+IGVsZW1lbnQuc3RyaW5nKS5qb2luKCcnKVxuICAgIC8vIFRPRE86IG1pZ2h0IGhhdmUgdG8gY2hlY2sgZm9yIG51bGwgc3RyaW5nIGhlcmVcbiAgICBjb25zdCB0cmltbWVkID0gdHJpbW1pbmdGdW5jdGlvbihqb2luZWRUZXh0KVxuICAgIGlmICghdHJpbW1lZCkge1xuICAgICAgLy8gVHJpbW1lZCBpbnRvIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgLy8gUHJlc2VydmUgYWxsIHByZWNlZGluZyBicmVha3NcbiAgICAgIHRoaXMudGV4dCA9IFtdXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZnVsbFRleHQgPSB0cmltbWluZ0Z1bmN0aW9uKHRyaW1tZWQpXG5cbiAgICBsZXQgYmxvY2tNYXAgPSBbXVxuICAgIGxldCBjdXJyZW50SW5kZXhPZlN0cmluZyA9IDBcblxuICAgIGZvciAoY29uc3QgdGV4dE1hcCBvZiB0aGlzLnRleHQpIHtcbiAgICAgIGNvbnN0IHNocnVua1RleHQgPSB0cmltbWluZ0Z1bmN0aW9uKHRleHRNYXAuc3RyaW5nKVxuICAgICAgaWYgKCFzaHJ1bmtUZXh0KSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gZnVsbFRleHQuaW5kZXhPZihzaHJ1bmtUZXh0KVxuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ291bGQgbm90IGZpbmQgc2hydW5rIHN0cmluZyBcXFwiJHtzaHJ1bmtUZXh0fVxcXCIgaW4gXFxcIiR7ZnVsbFRleHR9XFxcImAsXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgYmxvY2tNYXAucHVzaCh7XG4gICAgICAgIHR5cGU6IE1hcFR5cGUuVEVYVCxcbiAgICAgICAgbm9kZTogdGV4dE1hcC5ub2RlLFxuICAgICAgICBzdGFydDogY3VycmVudEluZGV4T2ZTdHJpbmcgKyBpbmRleCxcbiAgICAgICAgbGVuZ3RoOiBzaHJ1bmtUZXh0Lmxlbmd0aCxcbiAgICAgICAgY29udGVudDogc2hydW5rVGV4dCxcbiAgICAgIH0pXG5cbiAgICAgIGZ1bGxUZXh0ID0gZnVsbFRleHQuc2xpY2UoaW5kZXggKyBzaHJ1bmtUZXh0Lmxlbmd0aClcbiAgICAgIGN1cnJlbnRJbmRleE9mU3RyaW5nICs9IHNocnVua1RleHQubGVuZ3RoICsgaW5kZXhcbiAgICB9XG5cbiAgICAvLyBEbyBzb21lIG1vcmUgbWFnaWMgb24gYmxvY2sgbWFwXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBibG9ja01hcC5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKFxuICAgICAgICBibG9ja01hcFtpXS5zdGFydCAtIGJsb2NrTWFwW2kgLSAxXS5zdGFydCAhPT1cbiAgICAgICAgYmxvY2tNYXBbaSAtIDFdLmxlbmd0aFxuICAgICAgKSB7XG4gICAgICAgIGJsb2NrTWFwW2kgLSAxXS5sZW5ndGggPSBibG9ja01hcFtpXS5zdGFydCAtIGJsb2NrTWFwW2kgLSAxXS5zdGFydFxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubWFwLnB1c2goLi4uYmxvY2tNYXApXG5cbiAgICBpZiAodGhpcy5sYXN0QnJlYWsgPT09IG51bGwpIHtcbiAgICAgIHRoaXMubGFzdEJyZWFrID0gQnJlYWtUeXBlLk5PTkVcbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBbXVxuICB9XG5cbiAgcHJvY2Vzc1RleHQodHJpbUVuZFNwYWNlcyA9IHRydWUpIHtcbiAgICBpZiAodHJpbUVuZFNwYWNlcykge1xuICAgICAgdGhpcy5wcm9jZXNzVGV4dEFuZFRyaW0odHJpbUFuZENvbGxhcHNlV2hpdGVzcGFjZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9jZXNzVGV4dEFuZFRyaW0odHJpbUFsbEV4Y2VwdEVuZFdoaXRlU3BhY2UpXG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0VsZW1lbnROb2RlKG5vZGUsIGlzT3BlbmluZykge1xuICAgIGlmIChcbiAgICAgIGlzRWxlbWVudEJsYWNrbGlzdGVkKFxuICAgICAgICBub2RlLFxuICAgICAgICB0aGlzLm9wdGlvbnMuY2xhc3NCbGFja2xpc3QsXG4gICAgICAgIHRoaXMub3B0aW9ucy5lbGVtZW50QmxhY2tsaXN0LFxuICAgICAgICB0aGlzLm9wdGlvbnMuaWRCbGFja2xpc3QsXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHRhZyA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIFByZWZvcm1hdHRlZFxuICAgIGlmICh0YWcgPT09ICdwcmUnKSB7XG4gICAgICB0aGlzLnByb2Nlc3NUZXh0KClcbiAgICAgIHRoaXMuYWRkQnJlYWsoZmFsc2UpXG4gICAgICB0aGlzLnByb2Nlc3NCcmVha3MoKVxuXG4gICAgICB0aGlzLmxhc3RCcmVhayA9IEJyZWFrVHlwZS5TSU5HTEVcblxuICAgICAgdGhpcy5tYXAucHVzaCh7XG4gICAgICAgIHR5cGU6IE1hcFR5cGUuVEVYVCxcbiAgICAgICAgbm9kZSxcbiAgICAgICAgY29udGVudDogbm9kZS50ZXh0Q29udGVudCxcbiAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCxcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBvdGhlciB0YWdzXG4gICAgc3dpdGNoICh0YWcpIHtcbiAgICAgIGNhc2UgJ2JyJzpcbiAgICAgICAgdGhpcy5wcm9jZXNzVGV4dChmYWxzZSlcbiAgICAgICAgdGhpcy5wcm9jZXNzQnJlYWtzKClcblxuICAgICAgICB0aGlzLm1hcC5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBNYXBUeXBlLlRFWFQsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBjb250ZW50OiAnXFxuJyxcbiAgICAgICAgICBsZW5ndGg6IDEsXG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGNhc2UgJ3dicic6XG4gICAgICAgIHRoaXMucHJvY2Vzc0JyZWFrcygpXG4gICAgICAgIHRoaXMudGV4dC5wdXNoKHsgbm9kZSwgc3RyaW5nOiAnXFx1MjAwQicgfSlcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50Q2FuSGF2ZUFsdFRleHQobm9kZS50YWdOYW1lKSkge1xuICAgICAgdGhpcy5wcm9jZXNzQnJlYWtzKClcblxuICAgICAgY29uc3QgYWx0VGV4dCA9IGdldEFsdFRleHQobm9kZSwgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyU3RyaW5nLCB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJDb3BpZXMpXG4gICAgICB0aGlzLnRleHQucHVzaCh7IG5vZGUsIHN0cmluZzogYCAke2FsdFRleHR9IGAgfSlcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAobm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzdmcnICYmIGlzT3BlbmluZykge1xuICAgICAgY29uc3QgYWx0VGV4dCA9IGdldEFsdFRleHQoXG4gICAgICAgIG5vZGUsXG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclN0cmluZyxcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyQ29waWVzXG4gICAgICApXG4gICAgICB0aGlzLnRleHQucHVzaCh7IG5vZGUsIHN0cmluZzogYCAke2FsdFRleHR9IGAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnByb2Nlc3NCbG9ja0NvbnN0cnVjdChub2RlLCBpc09wZW5pbmcpXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHByb2Nlc3NCbG9ja0NvbnN0cnVjdChub2RlLCBpc09wZW5pbmcpIHtcbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuXG4gICAgaWYgKHBocmFzaW5nQ29uc3RydWN0cy5pbmNsdWRlcyh0YWcpKSB7XG4gICAgICAvLyBEbyBub3QgcHJvY2VzcyBwaHJhc2luZyB0YWdzIGFzIGJsb2NrIGNvbnN0cnVjdHNcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0YWcgPT09ICd0aCcgfHwgdGFnID09PSAndGQnKSB7XG4gICAgICAvLyBTcGVjaWFsIEJsb2NrXG4gICAgICBpZiAoaXNPcGVuaW5nKSB7XG4gICAgICAgIC8vIEknbSBhc3N1bWluZyB0aGUgRE9NIHdpbGwgZml4IGFsbCB0YWJsZSBlbGVtZW50IG1hbGZvcm1hdGlvbnNcblxuICAgICAgICBpZiAoIXRoaXMuaGFzRW5jb3VudGVyZWRGaXJzdENlbGwpIHtcbiAgICAgICAgICB0aGlzLmhhc0VuY291bnRlcmVkRmlyc3RDZWxsID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJvY2Vzc0JyZWFrcygpXG4gICAgICAgICAgdGhpcy5tYXAucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBNYXBUeXBlLlRFWFQsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgY29udGVudDogJ1xcdCcsXG4gICAgICAgICAgICBsZW5ndGg6IDEsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzVGV4dCgpXG4gICAgICB9XG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMucHJvY2Vzc1RleHQoKVxuXG4gICAgaWYgKHRhZyA9PT0gJ3RyJykge1xuICAgICAgdGhpcy5oYXNFbmNvdW50ZXJlZEZpcnN0Q2VsbCA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHRhZyA9PT0gJ3AnKSB7XG4gICAgICB0aGlzLmFkZEJyZWFrKHRydWUpXG4gICAgfVxuXG4gICAgdGhpcy5hZGRCcmVhayhmYWxzZSlcbiAgfVxuXG4gIHByb2Nlc3NUZXh0Tm9kZShub2RlKSB7XG4gICAgY29uc3Qgc3RyaW5nID0gbm9kZS50ZXh0Q29udGVudC5ub3JtYWxpemUoKVxuXG4gICAgLy8gVHJpbVxuICAgIGNvbnN0IHRyaW1tZWQgPSB0cmltQmVnaW5BbmRFbmQoc3RyaW5nKVxuICAgIGlmICh0cmltbWVkKSB7XG4gICAgICB0aGlzLnByb2Nlc3NCcmVha3MoKVxuICAgIH1cblxuICAgIHRoaXMudGV4dC5wdXNoKHsgbm9kZSwgc3RyaW5nIH0pXG4gIH1cblxuICBnZXRSZXN1bHQoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBsZXQgcnVubmluZ0luZGV4ID0gMFxuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5tYXApIHtcbiAgICAgIHN3aXRjaCAoZW50aXR5LnR5cGUpIHtcbiAgICAgICAgY2FzZSBNYXBUeXBlLlRFWFQ6XG4gICAgICAgICAgLy8gVE9ETzogVGVzdHNcblxuICAgICAgICAgIGNvbnN0IHdoaXRlc3BhY2UgPSBbXVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgZW50aXR5Lm5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFIHx8XG4gICAgICAgICAgICBlbnRpdHkubm9kZS50YWdOYW1lID09PSAnaW1nJ1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgbGV0IG5vZGVDb250ZW50XG4gICAgICAgICAgICBpZiAoZWxlbWVudENhbkhhdmVBbHRUZXh0KGVudGl0eS5ub2RlLnRhZ05hbWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGFsdFRleHQgPSBnZXRBbHRUZXh0KFxuICAgICAgICAgICAgICAgIGVudGl0eS5ub2RlLFxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclN0cmluZyxcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJDb3BpZXNcbiAgICAgICAgICAgICAgKS5ub3JtYWxpemUoKVxuICAgICAgICAgICAgICBub2RlQ29udGVudCA9IGFsdFRleHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5vZGVDb250ZW50ID0gJydcbiAgICAgICAgICAgICAgaWYgKGVudGl0eS5ub2RlLnRhZ05hbWUgPT09ICdzdmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWx0VGV4dCA9IGdldEFsdFRleHQoXG4gICAgICAgICAgICAgICAgICBlbnRpdHkubm9kZSxcbiAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclN0cmluZyxcbiAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlckNvcGllc1xuICAgICAgICAgICAgICAgICkubm9ybWFsaXplKClcbiAgICAgICAgICAgICAgICBub2RlQ29udGVudCA9IGFsdFRleHRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBub2RlQ29udGVudCArPSBlbnRpdHkubm9kZS50ZXh0Q29udGVudC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICBsZXQgY2hhckluTWFwID0gMCwgY2hhckluTm9kZSA9IDA7XG4gICAgICAgICAgICAgIGNoYXJJbk5vZGUgPCBub2RlQ29udGVudC5sZW5ndGg7XG4gICAgICAgICAgICAgICsrY2hhckluTm9kZVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGlzRXF1YWwgPVxuICAgICAgICAgICAgICAgIGVudGl0eS5jb250ZW50LmNoYXJBdChjaGFySW5NYXApID09PVxuICAgICAgICAgICAgICAgIG5vZGVDb250ZW50LmNoYXJBdChjaGFySW5Ob2RlKVxuICAgICAgICAgICAgICBjb25zdCBpc01hcFdoaXRlc3BhY2UgPSBpc0NoYXJXaGl0ZXNwYWNlKFxuICAgICAgICAgICAgICAgIGVudGl0eS5jb250ZW50LmNoYXJDb2RlQXQoY2hhckluTWFwKSxcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBjb25zdCBpc05vZGVXaGl0ZXNwYWNlID0gaXNDaGFyV2hpdGVzcGFjZShcbiAgICAgICAgICAgICAgICBub2RlQ29udGVudC5jaGFyQ29kZUF0KGNoYXJJbk5vZGUpLFxuICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgaWYgKGlzRXF1YWwgfHwgKGlzTWFwV2hpdGVzcGFjZSAmJiBpc05vZGVXaGl0ZXNwYWNlKSkge1xuICAgICAgICAgICAgICAgICsrY2hhckluTWFwXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNNYXBXaGl0ZXNwYWNlIHx8IGlzTm9kZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwcyA9IHtcbiAgICAgICAgICAgICAgICAgIGFmdGVyOiBjaGFySW5NYXAgLSAxLFxuICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGNoYXJJbk5vZGUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaXRlc3BhY2UucHVzaChza2lwcylcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICBgRGVnYXVzcyBlcnJvciwgY2hhcmFjdGVyIG1pc21hdGNoIGFuZCBub3QgYSB3aGl0ZXNwYWNlYCxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICBub2RlOiBlbnRpdHkubm9kZSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGVudGl0eS5jb250ZW50LFxuICAgICAgICAgICAgd2hpdGVzcGFjZTogd2hpdGVzcGFjZSxcbiAgICAgICAgICAgIHN0YXJ0OiBydW5uaW5nSW5kZXgsXG4gICAgICAgICAgICBsZW5ndGg6IGVudGl0eS5sZW5ndGgsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHJ1bm5pbmdJbmRleCArPSBlbnRpdHkubGVuZ3RoXG5cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIE1hcFR5cGUuQlJFQUs6XG4gICAgICAgICAgY29uc3QgbGFzdFJlc3VsdCA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV1cblxuICAgICAgICAgIGlmIChlbnRpdHkuZG91YmxlKSB7XG4gICAgICAgICAgICBsYXN0UmVzdWx0Lmxlbmd0aCArPSAyXG4gICAgICAgICAgICBydW5uaW5nSW5kZXggKz0gMlxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0UmVzdWx0Lmxlbmd0aCArPSAxXG4gICAgICAgICAgICBydW5uaW5nSW5kZXggKz0gMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG4iLCJpbXBvcnQgeyBibGFja2xpc3QgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdCB3YWxrRE9NID0gKHBhcmVudE5vZGUsIGNvbGxlY3RvcikgPT4ge1xuICBpZiAoIXBhcmVudE5vZGUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHByb2Nlc3NOb2RlKHBhcmVudE5vZGUsIGNvbGxlY3RvcilcblxuICByZXR1cm4gY29sbGVjdG9yLmdldFJlc3VsdCgpXG59XG5cbmNvbnN0IHByb2Nlc3NOb2RlID0gKG5vZGUsIGNvbGxlY3RvcikgPT4ge1xuICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICBjYXNlIE5vZGUuVEVYVF9OT0RFOlxuICAgICAgY29sbGVjdG9yLnByb2Nlc3NUZXh0Tm9kZShub2RlKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIE5vZGUuRUxFTUVOVF9OT0RFOlxuICAgICAgaWYgKGJsYWNrbGlzdC5pbmNsdWRlcyhub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBwcm9jZXNzRWxlbWVudE5vZGUobm9kZSwgY29sbGVjdG9yKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIE5vZGUuRE9DVU1FTlRfTk9ERTpcbiAgICBjYXNlIE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERTpcbiAgICAgIGlmIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICBub2RlLmNoaWxkTm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICBwcm9jZXNzTm9kZShjaGlsZCwgY29sbGVjdG9yKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgfVxufVxuXG5jb25zdCBwcm9jZXNzRWxlbWVudE5vZGUgPSAobm9kZSwgY29sbGVjdG9yKSA9PiB7XG4gIGNvbnN0IHNraXBSZXN0ID0gY29sbGVjdG9yLnByb2Nlc3NFbGVtZW50Tm9kZShub2RlLCB0cnVlKVxuXG4gIGlmIChza2lwUmVzdCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKG5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgbm9kZS5jaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBwcm9jZXNzTm9kZShjaGlsZCwgY29sbGVjdG9yKVxuICAgIH0pXG4gIH1cblxuICBjb2xsZWN0b3IucHJvY2Vzc0VsZW1lbnROb2RlKG5vZGUsIGZhbHNlKVxufVxuIiwiaW1wb3J0IHsgU3RyaW5nQ29sbGVjdG9yIH0gZnJvbSAnLi9zdHJpbmdDb2xsZWN0b3InXG5pbXBvcnQgeyBNYXBDb2xsZWN0b3IgfSBmcm9tICcuL21hcENvbGxlY3RvcidcbmltcG9ydCB7IHdhbGtET00gfSBmcm9tICcuL2RvbVdhbGtlcidcblxuLyoqXG4gKiBFeHRyYWN0cyB0ZXh0IGZyb20gdGhlIGdpdmVuIG5vZGUuXG4gKiBPcHRpb25zIGluY2x1ZGUgKGJ1dCBhcmUgbm90IGxpbWl0ZWQgdG8pOlxuICogLSBwbGFjZWhvbGRlclN0cmluZzogc3RyaW5nIHRvIHRha2UgdGhlIHBsYWNlIG9mIGFsdCB0ZXh0IHdoZW4gYWx0IGl0IGlzIGVtcHR5L3VuZGVmaW5lZFxuICogLSBwbGFjZWhvbGRlckNvcGllczogdGhlIG51bWJlciBvZiB0aW1lcyBwbGFjZWhvbGRlclN0cmluZyByZXBlYXRzXG4gKiBAcGFyYW0gcGFyZW50Tm9kZVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfVxuICovXG5leHBvcnQgY29uc3QgZGVnYXVzc2VyID0gKHBhcmVudE5vZGUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB1bml0U2VwYXJhdG9yQ29kZSA9IDMxXG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgIHBsYWNlaG9sZGVyU3RyaW5nOiBTdHJpbmcuZnJvbUNoYXJDb2RlKHVuaXRTZXBhcmF0b3JDb2RlKSxcbiAgICBwbGFjZWhvbGRlckNvcGllczogMTAwLFxuICB9XG4gIGNvbnN0IGZpbmFsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG5cbiAgbGV0IGNvbGxlY3RvciA9IG5ldyBTdHJpbmdDb2xsZWN0b3IoZmluYWxPcHRpb25zKVxuXG4gIGlmIChmaW5hbE9wdGlvbnMubWFwKSB7XG4gICAgY29sbGVjdG9yID0gbmV3IE1hcENvbGxlY3RvcihmaW5hbE9wdGlvbnMpXG4gIH1cblxuICByZXR1cm4gd2Fsa0RPTShwYXJlbnROb2RlLCBjb2xsZWN0b3IpXG59XG5cbmV4cG9ydCBjb25zdCBnZXRSYW5nZUZyb21PZmZzZXQgPSAoc3RhcnQsIGVuZCwgZG9jID0gZG9jdW1lbnQsIG1hcCA9IG51bGwsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCBkb2NUeXBlID0gZG9jLm5vZGVUeXBlXG4gIGlmIChcbiAgICBkb2NUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX05PREUgJiZcbiAgICBkb2NUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREVcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgRG9jdW1lbnQgTm9kZScpXG4gIH1cblxuICBpZiAobWFwID09PSBudWxsKSB7XG4gICAgY29uc3QgZmluYWxPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucylcbiAgICBmaW5hbE9wdGlvbnMubWFwID0gdHJ1ZVxuICAgIG1hcCA9IGRlZ2F1c3Nlcihkb2MsIGZpbmFsT3B0aW9ucylcbiAgfVxuXG4gIGNvbnN0IHJhbmdlID0gZG9jLmNyZWF0ZVJhbmdlKClcblxuICBmb3IgKGxldCBtYXBJbmRleCA9IDA7IG1hcEluZGV4IDwgbWFwLmxlbmd0aDsgKyttYXBJbmRleCkge1xuICAgIGNvbnN0IGVudHJ5ID0gbWFwW21hcEluZGV4XVxuXG4gICAgaWYgKHN0YXJ0ID49IGVudHJ5LnN0YXJ0ICYmIHN0YXJ0IDwgZW50cnkuc3RhcnQgKyBlbnRyeS5sZW5ndGgpIHtcbiAgICAgIGlmIChlbnRyeS5ub2RlLm5vZGVOYW1lID09PSAnaW1nJykge1xuICAgICAgICByYW5nZS5zZXRTdGFydEJlZm9yZShlbnRyeS5ub2RlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRTdGFydCA9IHN0YXJ0IC0gZW50cnkuc3RhcnRcblxuICAgICAgICBsZXQgc2tpcHMgPSAwXG4gICAgICAgIGZvciAoY29uc3Qgd2hpdGVzcGFjZUVudHJ5IG9mIGVudHJ5LndoaXRlc3BhY2UpIHtcbiAgICAgICAgICBpZiAod2hpdGVzcGFjZUVudHJ5LmFmdGVyIDwgYWRqdXN0ZWRTdGFydCkge1xuICAgICAgICAgICAgKytza2lwc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhZGp1c3RlZFN0YXJ0ICsgc2tpcHMgLSBlbnRyeS5ub2RlLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgLy8gc3BhY2UgYmV0d2VlbiB0aGUgZW5kIG9mIHRoZSBub2RlIGFuZCB0aGUgc3RhcnQgb2YgdGhlIG5leHRcbiAgICAgICAgICByYW5nZS5zZXRTdGFydEFmdGVyKGVudHJ5Lm5vZGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2Uuc2V0U3RhcnQoZW50cnkubm9kZSwgYWRqdXN0ZWRTdGFydCArIHNraXBzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuZCA+PSBlbnRyeS5zdGFydCAmJiBlbmQgPCBlbnRyeS5zdGFydCArIGVudHJ5Lmxlbmd0aCkge1xuICAgICAgaWYgKGVudHJ5Lm5vZGUubm9kZU5hbWUgPT09ICdpbWcnKSB7XG4gICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKGVudHJ5Lm5vZGUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBhZGp1c3RlZEVuZCA9IGVuZCAtIGVudHJ5LnN0YXJ0XG5cbiAgICAgICAgbGV0IHNraXBzID0gMFxuICAgICAgICBmb3IgKGNvbnN0IHdoaXRlc3BhY2VFbnRyeSBvZiBlbnRyeS53aGl0ZXNwYWNlKSB7XG4gICAgICAgICAgaWYgKHdoaXRlc3BhY2VFbnRyeS5hZnRlciA8IGFkanVzdGVkRW5kKSB7XG4gICAgICAgICAgICArK3NraXBzXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFkanVzdGVkRW5kICsgc2tpcHMgLSBlbnRyeS5ub2RlLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgLy8gc3BhY2UgYmV0d2VlbiB0aGUgZW5kIG9mIHRoZSBub2RlIGFuZCB0aGUgc3RhcnQgb2YgdGhlIG5leHRcbiAgICAgICAgICByYW5nZS5zZXRFbmRBZnRlcihlbnRyeS5ub2RlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlLnNldEVuZChlbnRyeS5ub2RlLCBhZGp1c3RlZEVuZCArIHNraXBzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByYW5nZVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsUUFBUSxHQUFHO0FBQ3BCLEVBQUUsS0FBSyxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQzVFLElBQUksSUFBSSxJQUFJLEtBQUssYUFBYSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQzVFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO0FBQ3RDLEdBQUc7QUFDSCxDQUFDO0FBQ0Q7QUFDQTtBQUNBLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFDO0FBQ25DLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxRQUFRLEtBQUs7QUFDdkMsRUFBRSxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQ3ZDLEVBQUM7QUFDRDtBQUNBLE1BQU0sYUFBYSxHQUFHLENBQUMsUUFBUSxLQUFLO0FBQ3BDLEVBQUUsT0FBTyxRQUFRLEtBQUssRUFBRSxJQUFJLFFBQVEsS0FBSyxFQUFFO0FBQzNDLEVBQUM7QUFDRDtBQUNBLE1BQU0sU0FBUyxHQUFHO0FBQ2xCLEVBQUUsSUFBSSxFQUFFLE1BQU07QUFDZCxFQUFFLE1BQU0sRUFBRSxRQUFRO0FBQ2xCLEVBQUUsTUFBTSxFQUFFLFFBQVE7QUFDbEIsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxLQUFLO0FBQ2xDO0FBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxLQUFJO0FBQzFCLEVBQUUsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3ZELE1BQU0sYUFBYSxHQUFHLE1BQUs7QUFDM0IsTUFBTSxLQUFLO0FBQ1gsT0FBTztBQUNQLEdBQUc7QUFDSDtBQUNBO0FBQ0EsRUFBRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7QUFDOUIsTUFBTSxPQUFPLE1BQU07QUFDbkIsR0FBRztBQUNIO0FBQ0E7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFDcEMsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEtBQUs7QUFDbkMsRUFBRSxJQUFJLGNBQWMsR0FBRyxLQUFJO0FBQzNCLEVBQUUsSUFBSSxxQkFBcUIsR0FBRyxNQUFLO0FBQ25DLEVBQUUsSUFBSSwyQkFBMkIsR0FBRyxNQUFLO0FBQ3pDLEVBQUUsS0FBSyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQzNELElBQUksTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUM7QUFDN0MsSUFBSSxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsUUFBUSxFQUFDO0FBQzdDLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNwQyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDdEI7QUFDQSxRQUFRLFFBQVE7QUFDaEIsT0FBTyxNQUFNO0FBQ2IsUUFBUSxxQkFBcUIsR0FBRyxLQUFJO0FBQ3BDLE9BQU87QUFDUCxLQUFLLE1BQU07QUFDWCxNQUFNLDJCQUEyQixHQUFHLEtBQUk7QUFDeEMsS0FBSztBQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNwQixNQUFNLElBQUkscUJBQXFCLEVBQUU7QUFDakMsUUFBUSxjQUFjLEdBQUcsTUFBSztBQUM5QixPQUFPO0FBQ1AsTUFBTSxLQUFLO0FBQ1gsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixFQUFFO0FBQ3BDLElBQUksT0FBTyxJQUFJO0FBQ2YsR0FBRztBQUNIO0FBQ0EsRUFBRSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7QUFDL0IsSUFBSSxPQUFPLE1BQU07QUFDakIsR0FBRztBQUNIO0FBQ0E7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUs7QUFDckIsTUFBTSxDQUFDO0FBQ1AsTUFBTSxjQUFjLEdBQUcsY0FBYyxHQUFHLENBQUMsR0FBRyxTQUFTO0FBQ3JELEdBQUc7QUFDSCxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLDBCQUEwQixHQUFHLENBQUMsTUFBTSxLQUFLO0FBQy9DLEVBQUUsT0FBTyxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLEVBQUM7QUFDRDtBQUNBLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxLQUFLO0FBQ3BDO0FBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxJQUFJO0FBQzFCLElBQUksWUFBWSxHQUFHLEtBQUk7QUFDdkIsRUFBRSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0RCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDckQsTUFBTSxhQUFhLEdBQUcsTUFBSztBQUMzQixNQUFNLEtBQUs7QUFDWCxLQUFLO0FBQ0wsR0FBRztBQUNILEVBQUUsS0FBSyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQzNELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNyRDtBQUNBO0FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBSztBQUMxQjtBQUNBLE1BQU0sS0FBSztBQUNYLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUUsSUFBSSxhQUFhLEtBQUssSUFBSSxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7QUFDdkQsSUFBSSxPQUFPLElBQUk7QUFDZixHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUMsS0FBSztBQUNyQixJQUFJLGFBQWE7QUFDakIsSUFBSSxZQUFZLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxTQUFTO0FBQy9DLEdBQUc7QUFDSCxFQUFDO0FBQ0Q7QUFDQSxNQUFNLGtCQUFrQixHQUFHLENBQUMsTUFBTSxLQUFLO0FBQ3ZDO0FBQ0EsRUFBRSxNQUFNLFlBQVksR0FBRyxHQUFFO0FBQ3pCLEVBQUUsSUFBSSxlQUFlLEdBQUcsS0FBSTtBQUM1QixFQUFFLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RELElBQUk7QUFDSixNQUFNLGVBQWUsS0FBSyxJQUFJO0FBQzlCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELE1BQU07QUFDTixNQUFNLGVBQWUsR0FBRyxNQUFLO0FBQzdCLE1BQU0sUUFBUTtBQUNkLEtBQUs7QUFDTCxJQUFJO0FBQ0osTUFBTSxlQUFlLEtBQUssSUFBSTtBQUM5QixNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEQsTUFBTTtBQUNOLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsRUFBQztBQUM3RCxNQUFNLGVBQWUsR0FBRyxLQUFJO0FBQzVCLE1BQU0sUUFBUTtBQUNkLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBLEVBQUUsSUFBSSxlQUFlLEtBQUssSUFBSSxFQUFFO0FBQ2hDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFDO0FBQ3BELEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMvQixFQUFDO0FBQ0Q7QUFDQSxNQUFNLHlCQUF5QixHQUFHLENBQUMsTUFBTSxLQUFLO0FBQzlDLEVBQUUsT0FBTyxlQUFlLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQsRUFBQztBQUNEO0FBQ0EsTUFBTSxTQUFTLEdBQUc7QUFDbEIsRUFBRSxNQUFNO0FBQ1IsRUFBRSxTQUFTO0FBQ1gsRUFBRSxNQUFNO0FBQ1IsRUFBRSxNQUFNO0FBQ1IsRUFBRSxVQUFVO0FBQ1osRUFBRSxRQUFRO0FBQ1YsRUFBRSxPQUFPO0FBQ1QsRUFBRSxPQUFPO0FBQ1Q7QUFDQTtBQUNBLEVBQUUsTUFBTTtBQUNSLEVBQUM7QUFDRDtBQUNBLE1BQU0sa0JBQWtCLEdBQUc7QUFDM0IsRUFBRSxHQUFHO0FBQ0wsRUFBRSxNQUFNO0FBQ1IsRUFBRSxPQUFPO0FBQ1QsRUFBRSxHQUFHO0FBQ0wsRUFBRSxLQUFLO0FBQ1AsRUFBRSxJQUFJO0FBQ04sRUFBRSxRQUFRO0FBQ1YsRUFBRSxRQUFRO0FBQ1YsRUFBRSxNQUFNO0FBQ1IsRUFBRSxNQUFNO0FBQ1IsRUFBRSxTQUFTO0FBQ1gsRUFBRSxNQUFNO0FBQ1IsRUFBRSxVQUFVO0FBQ1osRUFBRSxLQUFLO0FBQ1AsRUFBRSxJQUFJO0FBQ04sRUFBRSxPQUFPO0FBQ1QsRUFBRSxHQUFHO0FBQ0wsRUFBRSxRQUFRO0FBQ1YsRUFBRSxLQUFLO0FBQ1AsRUFBRSxPQUFPO0FBQ1QsRUFBRSxLQUFLO0FBQ1AsRUFBRSxRQUFRO0FBQ1YsRUFBRSxPQUFPO0FBQ1QsRUFBRSxNQUFNO0FBQ1IsRUFBRSxNQUFNO0FBQ1IsRUFBRSxPQUFPO0FBQ1QsRUFBRSxVQUFVO0FBQ1osRUFBRSxRQUFRO0FBQ1YsRUFBRSxRQUFRO0FBQ1YsRUFBRSxVQUFVO0FBQ1osRUFBRSxHQUFHO0FBQ0wsRUFBRSxNQUFNO0FBQ1IsRUFBRSxNQUFNO0FBQ1IsRUFBRSxRQUFRO0FBQ1YsRUFBRSxRQUFRO0FBQ1YsRUFBRSxPQUFPO0FBQ1QsRUFBRSxNQUFNO0FBQ1IsRUFBRSxRQUFRO0FBQ1YsRUFBRSxLQUFLO0FBQ1AsRUFBRSxLQUFLO0FBQ1AsRUFBRSxLQUFLO0FBQ1AsRUFBRSxVQUFVO0FBQ1osRUFBRSxNQUFNO0FBQ1IsRUFBRSxLQUFLO0FBQ1AsRUFBRSxPQUFPO0FBQ1QsRUFB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
