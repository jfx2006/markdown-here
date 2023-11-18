/*
 * Copyright JFX 2023
 * MIT License
 */

import { fetchExtFile, getLanguage } from "./async_utils.mjs";

async function loadMDHR4() {
  const preview_lang = await getLanguage()
  const mdhr4_md = await fetchExtFile(`_locales/${preview_lang}/mdhr4.md`)

  const response = await messenger.runtime.sendMessage({action: "render", mdText: mdhr4_md })
  const parser = new DOMParser()

  const tmpDoc = parser.parseFromString(response.html, "text/html")

  const contentElem = document.querySelector("#content")
  const replacements = document.adoptNode(tmpDoc.body).children
  contentElem.replaceChildren(...replacements)

  const demovideo = document.querySelector("#demovideo")
  const video = document.querySelector("#video")
  video.appendChild(demovideo)
  demovideo.style.display = ""
}

await loadMDHR4()
