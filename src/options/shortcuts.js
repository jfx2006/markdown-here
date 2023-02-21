/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global messenger:false */

// From chrome://mozapps/content/extensions/shortcuts.js
const keyOptions = [
  (e) => String.fromCharCode(e.which), // A letter?
  (e) => e.code.toUpperCase(), // A letter.
  (e) => trimPrefix(e.code), // Digit3, ArrowUp, Numpad9.
  (e) => trimPrefix(e.key), // Digit3, ArrowUp, Numpad9.
  (e) => remapKey(e.key), // Comma, Period, Space.
]

// From chrome://mozapps/content/extensions/shortcuts.js
const validKeys = new Set([
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
  "Delete",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "MediaNextTrack",
  "MediaPlayPause",
  "MediaPrevTrack",
  "MediaStop",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Up",
  "Down",
  "Left",
  "Right",
  "Comma",
  "Period",
  "Space",
])

// From chrome://mozapps/content/extensions/shortcuts.js
const remapKeys = {
  ",": "Comma",
  ".": "Period",
  " ": "Space",
}

// From chrome://mozapps/content/extensions/shortcuts.js
function trimPrefix(string) {
  return string.replace(/^(?:Digit|Numpad|Arrow)/, "")
}

// From chrome://mozapps/content/extensions/shortcuts.js
function remapKey(string) {
  // eslint-disable-next-line no-prototype-builtins
  if (remapKeys.hasOwnProperty(string)) {
    return remapKeys[string]
  }
  return string
}

// Modified from chrome://mozapps/content/extensions/shortcuts.js
function getStringForEvent(event) {
  for (const option of keyOptions) {
    const value = option(event)
    if (validKeys.has(value)) {
      return value
    }
  }
  return ""
}

// From chrome://mozapps/content/extensions/shortcuts.js
function getShortcutForEvent(e) {
  let modifierMap

  // It's apparently "MacIntel" even on M1's
  if (navigator.platform === "MacIntel") {
    modifierMap = {
      MacCtrl: e.ctrlKey,
      Alt: e.altKey,
      Command: e.metaKey,
      Shift: e.shiftKey,
    }
  } else {
    modifierMap = {
      Ctrl: e.ctrlKey,
      Alt: e.altKey,
      Shift: e.shiftKey,
    }
  }

  return Object.entries(modifierMap)
    .filter(([key, isDown]) => isDown)
    .map(([key]) => key)
    .concat(getStringForEvent(e))
    .join("+")
}

export default class HotkeyHandler {
  constructor(id) {
    this.inputElem = document.getElementById(id)
    this.commandName = this.inputElem.getAttribute("data-command")
    this.form = this.inputElem.form
    this.resetBtn = document.getElementById(`${id}-reset`)
    this.inputElem.addEventListener("keydown", (e) => this.shortCutChanged(e))
    this.resetBtn.addEventListener("click", (e) => {
      this.resetShortcut()
    })
    this.updateEvent = new CustomEvent("hotkey", {
      bubbles: true,
      detail: { value: () => this.inputElem.value },
    })
  }

  async shortCutChanged(e) {
    const input = e.target

    if (e.key === "Escape") {
      input.blur()
      return
    } else if (e.key === "Tab") {
      return
    }

    if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Avoid triggering back-navigation.
        e.preventDefault()
        e.currentTarget.value = ""
        return
      }
      // Catch cases where no modifier key is given (Alt, etc)
      e.preventDefault()
      e.stopPropagation()
      return
    }
    e.preventDefault()
    e.stopPropagation()

    const shortcutString = getShortcutForEvent(e)
    if (e.type === "keyup" || !shortcutString.length || shortcutString.endsWith("+")) {
      return
    }
    if (e.type === "keyup" && !shortcutString.find("+")) {
      console.log(`Invalid hotkey combo: ${shortcutString}`)
      return
    }
    this.inputElem.value = shortcutString
    this.inputElem.dispatchEvent(this.updateEvent)
  }
  async resetShortcut() {
    await messenger.commands.reset(this.commandName)
    await this.updateKeys()
    this.inputElem.dispatchEvent(this.updateEvent)
  }
  async updateKeys() {
    const commands = await messenger.commands.getAll()
    for (const c of commands) {
      if (c.name === this.commandName) {
        this.inputElem.value = c.shortcut
        return c.shortcut
      }
    }
  }
}
