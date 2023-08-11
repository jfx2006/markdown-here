/*
 * Copyright JFX 2021-2023
 * MIT License
 */

import TeXZilla from "./vendor/TeXZilla.js"

/**
 * Trim a canvas. Based on
 * https://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
 *
 * @author Arjan Haverkamp (arjan at avoid dot org)
 * @param {CanvasRenderingContext2D} ctx A canvas context element to trim.
 * @returns {Object} Width and height of trimmed canvas and left-top coordinate of trimmed area.
 *          Example: {width:400, height:300, x:65, y:104}
 */
function trimCanvas(ctx) {
  let canvas = ctx.canvas,
    w = canvas.width,
    h = canvas.height,
    imageData = ctx.getImageData(0, 0, w, h),
    tlCorner = { x: w + 1, y: h + 1 },
    brCorner = { x: -1, y: -1 }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let pixel = (y * w + x) * 4
      let pixel_value =
        imageData.data[pixel] +
        imageData.data[pixel + 1] +
        imageData.data[pixel + 2] +
        imageData.data[pixel + 3]
      if (pixel_value !== 1020) {
        tlCorner.x = Math.min(x, tlCorner.x)
        tlCorner.y = Math.min(y, tlCorner.y)
        brCorner.x = Math.max(x, brCorner.x)
        brCorner.y = Math.max(y, brCorner.y)
      }
    }
  }
  const width = brCorner.x - tlCorner.x + 10
  const height = brCorner.y - tlCorner.y + 10
  const cut = ctx.getImageData(tlCorner.x - 6, tlCorner.y - 6, width, height)

  canvas.width = width
  canvas.height = height

  ctx.putImageData(cut, 0, 0)

  return { width: width, height: height, x: tlCorner.x - 3, y: tlCorner.y - 3 }
}

async function SVG2PNG(svgImg, imgClass) {
  // Converts an SVG <img> to a PNG using the browser canvas
  return new Promise((resolve) => {
    svgImg.addEventListener("load", function (e) {
      let canvas = document.createElement("canvas")
      canvas.width = svgImg.width
      canvas.height = svgImg.height
      let ctx = canvas.getContext("2d")
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(svgImg, 0, 0)
      // The images produced by TeXZilla tend to have a lot of whitespace
      // around the actual formula, so trim it down like GCharts was
      const ctx_trim = trimCanvas(ctx)

      let pngDataURL = canvas.toDataURL("image/png")
      let pngImg = new Image()
      pngImg.width = ctx_trim.width
      pngImg.height = ctx_trim.height
      pngImg.alt = svgImg.alt
      pngImg.src = pngDataURL
      pngImg.classList.add(imgClass)
      resolve(pngImg.outerHTML)
    })
  })
}

class TexSizes {
  static #inlineSize
  static #blockSize
  static {
    // Temporarily insert the MathML element in the document to measure it.
    const el = document.createElement("p")
    el.style.visibility = "hidden"
    el.style.position = "absolute"
    el.style.fontSize = "1rem"
    el.innerText = "Xg"
    window.document.body.appendChild(el)
    this.#blockSize = el.clientHeight
    const fontSize = getComputedStyle(el).fontSize
    this.#inlineSize = Number.parseInt(fontSize)
    window.document.body.removeChild(el)
    console.log({ blockSize: this.#blockSize, inlineSize: this.#inlineSize })
  }
  static size(isBlock) {
    if (isBlock) {
      return this.#blockSize
    }
    return this.#inlineSize
  }
}

export async function TeX2PNG(aTeX, isBlock = false, isRTL = false, aSize = undefined) {
  // Set default size.
  if (aSize === undefined) {
    aSize = TexSizes.size(isBlock)
  }
  let svgImg = TeXZilla.toImage(aTeX, isRTL, true, aSize)
  svgImg.classList.add("math_texzilla_svg")
  return await SVG2PNG(svgImg, "math_texzilla")
}
