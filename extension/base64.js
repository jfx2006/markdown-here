/*
 * Copyright JFX 2025
 * MIT License
 * https://gitlab.com/jfx2006
 */

const HAS_UINT8ARRAY_TOBASE64 =
  typeof Uint8Array === "function" && typeof Uint8Array.prototype.toBase64 === "function"

export function bytes_btoa(bytes) {
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
  return btoa(binString)
}

export function bytes_toBase64(bytes) {
  return bytes.toBase64()
}

export function strToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  if (HAS_UINT8ARRAY_TOBASE64) {
    // Thunderbird >= 133
    return bytes_toBase64(bytes)
  } else {
    return bytes_btoa(bytes)
  }
}
