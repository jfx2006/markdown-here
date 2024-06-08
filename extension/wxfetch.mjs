/*
 * Copyright JFX 2021-202
 * MIT License
 * https://gitlab.com/jfx2006
 */

export function wxGetUrl(path) {
  const url = window.messenger?.runtime.getURL(path)
  if (url) {
    return url
  }
  if (path.startsWith("/")) {
    const slashroot = new URL("/", import.meta.url)
    path = `${slashroot}${path}`
  }
  const u = new URL(path, location.href)
  return u.href
}

export async function fetchExtFile(path, json = false) {
  const url = wxGetUrl(path)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error fetching ${path}: ${response.status}`)
  }
  if (json) {
    return await response.json()
  } else {
    return await response.text()
  }
}
