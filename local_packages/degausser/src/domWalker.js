import { blacklist } from './util'

export const walkDOM = (parentNode, collector) => {
  if (!parentNode) {
    return
  }

  processNode(parentNode, collector)

  return collector.getResult()
}

const processNode = (node, collector) => {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      collector.processTextNode(node)
      break
    case Node.ELEMENT_NODE:
      if (blacklist.includes(node.tagName.toLowerCase())) {
        return
      }
      processElementNode(node, collector)
      break
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      if (node.hasChildNodes()) {
        node.childNodes.forEach((child) => {
          processNode(child, collector)
        })
      }
      break
  }
}

const processElementNode = (node, collector) => {
  const skipRest = collector.processElementNode(node, true)

  if (skipRest) {
    return
  }

  if (node.hasChildNodes()) {
    node.childNodes.forEach((child) => {
      processNode(child, collector)
    })
  }

  collector.processElementNode(node, false)
}
