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

function getMacShortcut(modifiers, key) {
  // Take a shortcut string for macOS and rewrite the key names to match
  // what people expect for that platform: Ctrl -> ⌘
  if (navigator.platform === "MacIntel") {
    const keyMap = { MacCtrl: "Ctrl", Command: "⌘", Ctrl: "⌘", Alt: "Alt", Shift: "Shift" }
    return [...modifiers.map((k) => keyMap[k]), key].join("+")
  }
}

// Modified from chrome://mozapps/content/extensions/shortcuts.js
function getKeyForEvent(event) {
  for (const option of keyOptions) {
    const value = option(event)
    if (validKeys.has(value)) {
      return value
    }
  }
  return null
}

export function getShortcutStruct(shortcutStr) {
  if (!shortcutStr) {
    // Ensure the shortcut is a string, even if it is unset.
    return null
  }
  const remap = {
    MacCtrl: "MacCtrl",
    Command: "Command",
    Ctrl: "Command",
    Alt: "Alt",
    Shift: "Shift",
  }

  let modifiers = shortcutStr.split("+")
  let key = modifiers.pop()

  if (modifiers.length) {
    const modifiers_fix = modifiers.map((x) => remap[x])
    return {
      modifiers,
      key: key,
      shortcut: [...modifiers_fix, key].join("+"),
      macShortcut: getMacShortcut(modifiers, key),
    }
  }

  if (FUNCTION_KEYS.test(key)) {
    return key
  }

  return null
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

  const modifiers = Object.entries(modifierMap)
    .filter(([key, isDown]) => isDown)
    .map(([key]) => key)
  const str = getKeyForEvent(e)
  if (str !== null) {
    return {
      modifiers,
      key: str,
      shortcut: [...modifiers, str].join("+"),
      macShortcut: getMacShortcut(modifiers, str),
    }
  }
}

const BASIC_KEYS =
  /^([A-Z0-9]|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right)$/
const FUNCTION_KEYS = /^(F[1-9]|F1[0-2])$/

export default class HotkeyHandler {
  constructor(id) {
    this.inputElem = document.getElementById(id)
    this.hiddenElem = document.getElementById(`${id}-hidden`)
    this.commandName = this.inputElem.getAttribute("data-command")
    this.form = this.inputElem.form
    this.resetBtn = document.getElementById(`${id}-reset`)
    this.inputElem.addEventListener("keydown", (e) => this.shortCutChanged(e))
    this.resetBtn.addEventListener("click", (e) => {
      this.resetShortcut()
    })
    this.updateEvent = new CustomEvent("hotkey", {
      bubbles: true,
      detail: { value: () => this.inputElem.value, macHotKey: () => this.hiddenElem.innerText },
    })
  }
  setValidKey(shortcutStruct) {
    this.inputElem.value = shortcutStruct.shortcut
    if (shortcutStruct.macShortcut) {
      this.hiddenElem.innerText = shortcutStruct.macShortcut
      this.hiddenElem.classList.remove("hidden")
    }
    this.inputElem.dispatchEvent(this.updateEvent)
  }

  setMacShortcutDisplay(shortcutStr) {
    const shortcutStruct = getShortcutStruct(shortcutStr)
    if (shortcutStruct && shortcutStruct.macShortcut) {
      this.hiddenElem.innerText = shortcutStruct.macShortcut
      this.hiddenElem.classList.remove("hidden")
      return shortcutStruct
    }
  }

  setInvalidKey() {
    this.hiddenElem.classList.remove("hidden")
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
        this.setInvalidKey()
        return
      }
      // Catch cases where no modifier key is given (Alt, etc)
      e.preventDefault()
      e.stopPropagation()
      this.setInvalidKey()
      return
    }
    e.preventDefault()
    e.stopPropagation()

    const shortcutStruct = getShortcutForEvent(e)
    if (shortcutStruct) {
      switch (shortcutStruct.modifiers.length) {
        case 0:
          // A lack of modifiers is only allowed with function keys.
          if (!FUNCTION_KEYS.test(shortcutStruct.key)) {
            this.setInvalidKey()
            return
          }
          break
        case 1:
          // Shift is only allowed on its own with function keys.
          if (shortcutStruct.modifiers[0] === "Shift" && !FUNCTION_KEYS.test(shortcutStruct.key)) {
            this.setInvalidKey()
            return
          }
          // Alt+<letter> on macOS does funny things...
          if (shortcutStruct.modifiers[0] === "Alt" && BASIC_KEYS.test(shortcutStruct.key)) {
            this.setInvalidKey()
            return
          }
          break
        case 2:
          if (shortcutStruct.modifiers[0] === shortcutStruct.modifiers[1]) {
            this.setInvalidKey()
            return
          }
          break
        default:
          this.setInvalidKey()
          return
      }
      if (!BASIC_KEYS.test(shortcutStruct.key) && !FUNCTION_KEYS.test(shortcutStruct.key)) {
        this.setInvalidKey()
        return
      }
      this.setValidKey(shortcutStruct)
    }
  }
  async resetShortcut() {
    await messenger.commands.reset(this.commandName)
    const shortcutStr = await this.updateKeys()
    const shortcutStruct = getShortcutStruct(shortcutStr)
    if (shortcutStruct.macShortcut) {
      this.hiddenElem.innerText = shortcutStruct.macShortcut
      this.hiddenElem.classList.remove("hidden")
    }
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
