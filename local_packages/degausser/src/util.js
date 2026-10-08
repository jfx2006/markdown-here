function autoBind() {
  for (let prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
    if (prop === 'constructor' || typeof this[prop] !== 'function') continue
    this[prop] = this[prop].bind(this)
  }
}

// Char codes for \t, \n, and non-&nbsp; space character
const whitespaces = [9, 10, 13, 32]
const isCharWhitespace = (charCode) => {
  return whitespaces.includes(charCode)
}

const isCharNewLine = (charCode) => {
  return charCode === 10 || charCode === 13
}

const BreakType = {
  NONE: 'none',
  SINGLE: 'single',
  DOUBLE: 'double',
}

/**
 * Trim whitespace from the start of the string
 * @param string
 * @returns { string }
 */
const trimBeginOnly = (string) => {
  // Get the first non-whitespace character index
  let firstNonWhite = null
  for (let index = 0; index < string.length; index++) {
      if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index
      break
      }
  }

  // If the first non-whitespace character is null, the string is entirely whitespace
  if (firstNonWhite === null) {
      return string
  }

  // Return the non-empty sections of the string
  return string.slice(firstNonWhite)
}

/**
 * Trim any new line characters from the end of the string
 * Also trim any whitespace that comes after that new line character, but not any that comes before.
 * @param string
 * @returns {*}
 */
const trimEndNewLine = (string) => {
  let lastNonNewLine = null
  let foundNewLineCharacter = false
  let foundNonWhiteSpaceCharacter = false
  for (let index = string.length - 1; index >= 0; index--) {
    const charCode = string.charCodeAt(index)
    const isNewLine = isCharNewLine(charCode)
    if (isCharWhitespace(charCode)) {
      if (!isNewLine) {
        // okay to trim out any white space
        continue
      } else {
        foundNewLineCharacter = true
      }
    } else {
      foundNonWhiteSpaceCharacter = true
    }
    if (!isNewLine) {
      if (foundNewLineCharacter) {
        lastNonNewLine = index
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
}

/**
 * Trims any whitespace at the start and trims any newline characters at the end of the string.
 * Trims any whitespace after newline characters at the end of the string, but not any that comes before.
 * @param string
 * @returns {*}
 */
const trimAllExceptEndWhiteSpace = (string) => {
  return trimEndNewLine(trimBeginOnly(string))
}

const trimBeginAndEnd = (string) => {
  // Get the first and last non-whitespace character index
  let firstNonWhite = null,
    lastNonWhite = null
  for (let index = 0; index < string.length; index++) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      firstNonWhite = index
      break
    }
  }
  for (let index = string.length - 1; index >= 0; index--) {
    if (!isCharWhitespace(string.charCodeAt(index))) {
      // if(index !== string.length - 1){
      // String slicing breaks if the last char is not whitespace
      lastNonWhite = index
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
}

const collapseWhitespace = (string) => {
  // Collapse all other sequential whitespace into a single whitespace
  const textElements = []
  let startOfNonWhite = null
  for (let index = 0; index < string.length; index++) {
    if (
      startOfNonWhite === null &&
      !isCharWhitespace(string.charCodeAt(index))
    ) {
      startOfNonWhite = index
      continue
    }
    if (
      startOfNonWhite !== null &&
      isCharWhitespace(string.charCodeAt(index))
    ) {
      textElements.push(string.slice(startOfNonWhite, index))
      startOfNonWhite = null
      continue
    }
  }

  // At the end, add the rest of the string
  if (startOfNonWhite !== null) {
    textElements.push(string.slice(startOfNonWhite))
  }

  return textElements.join(' ')
}

const trimAndCollapseWhitespace = (string) => {
  return trimBeginAndEnd(collapseWhitespace(string))
}

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
]

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
]

// copied from readium-cfi-js library
// original function called "isElementBlacklisted"
const isElementBlacklisted = (
  element,
  classBlacklist,
  elementBlacklist,
  idBlacklist,
) => {
  if (classBlacklist && classBlacklist.length) {
    const classList = getClassNameArray(element)
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
      )

      if (isElementInBlacklist) {
        return true
      }
    }
  }

  if (idBlacklist && idBlacklist.length) {
    const { id } = element
    if (id && id.length && idBlacklist.includes(id)) {
      return true
    }
  }

  return false
}

const intersection = (array1, array2) => {
  const intersectionArray = []
  for (let value of array1) {
    const index = array2.indexOf(value)
    if (index !== -1) {
      intersectionArray.push(value)
    }
  }

  return intersectionArray
}

const getClassNameArray = (element) => {
  const { className } = element
  if (typeof className === 'string') {
    return className.split(/\s/)
  }
  if (typeof className === 'object' && 'baseVal' in className) {
    return className.baseVal.split(/\s/)
  }
  return []
}

const matchesLocalNameOrElement = (element, otherNameOrElement) => {
  if (typeof otherNameOrElement === 'string') {
    return (element.localName || element.nodeName) === otherNameOrElement
  }
  return element === otherNameOrElement
}

/**
 * Gets the alt text from an element, if it exists, otherwise returns placeholder alt text composed of 100 unit separator character.
 * If node has empty alt attribute or alt attribute with empty string, this will return the placeholder alt text instead.
 * @param node
 * @param placeholderCharacter
 * @param placeholderLength
 * @returns {string}
 */
const getAltText = (node, placeholderCharacter, placeholderLength) => {
  let altText = node.getAttribute('alt')
  if (altText) {
    altText = altText.trim()
  }

  if (!altText) {
    const altTextPlaceholder = placeholderCharacter.repeat(placeholderLength)
    return altTextPlaceholder
  }

  return altText
}

/**
 * Checks if element with given tagname can have an alt attribute.
 * @param tagName
 * @returns {boolean}
 */
const elementCanHaveAltText = (tagName) => {
  if (!tagName) {
    return false
  }

  const tagNameLowerCase = tagName.toLowerCase()
  const elementsWithAltText = ['area', 'img', 'input', 'canvas',]
  return elementsWithAltText.includes(tagNameLowerCase)
}

export {
  autoBind,
  blacklist,
  BreakType,
  trimBeginOnly,
  trimEndNewLine,
  trimBeginAndEnd,
  trimAllExceptEndWhiteSpace,
  trimAndCollapseWhitespace,
  collapseWhitespace,
  phrasingConstructs,
  isElementBlacklisted,
  isCharWhitespace,
  getAltText,
  elementCanHaveAltText,
}
