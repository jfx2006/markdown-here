/*
 * Copyright JFX 2024
 * MIT License
 * Based on https://github.com/markedjs/marked/issues/1430#issuecomment-499915579
 */

import { marked } from "./vendor/marked.esm.js"

export function taskListRenderer() {
  const renderer = new marked.Renderer()
  const renderListItem = renderer.listitem.bind(renderer)
  return {
    renderer: {
      listitem(token, task, checked) {
        let html = renderListItem(token, task, checked)
        if (task) {
          html = html
            .replace("<input ", "<input class='task-list-item-checkbox' ")
            .replace("<li>", "<li class='task-list-item'>")
        }
        return html
      },
    },
  }
}
