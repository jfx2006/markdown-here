/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// From chrome://mozapps/content/extensions/shortcuts.js
const keyOptions = [
  e => String.fromCharCode(e.which), // A letter?
  e => e.code.toUpperCase(), // A letter.
  e => trimPrefix(e.code), // Digit3, ArrowUp, Numpad9.
  e => trimPrefix(e.key), // Digit3, ArrowUp, Numpad9.
  e => remapKey(e.key), // Comma, Period, Space.
];

// From chrome://mozapps/content/extensions/shortcuts.js
const validKeys = new Set([
  'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'MediaNextTrack', 'MediaPlayPause', 'MediaPrevTrack', 'MediaStop',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Up', 'Down', 'Left', 'Right', 'Comma', 'Period', 'Space'
]);

// From chrome://mozapps/content/extensions/shortcuts.js
const remapKeys = {
  ',': 'Comma',
  '.': 'Period',
  ' ': 'Space',
};

// From chrome://mozapps/content/extensions/shortcuts.js
function trimPrefix(string) {
  return string.replace(/^(?:Digit|Numpad|Arrow)/, '');
}

// From chrome://mozapps/content/extensions/shortcuts.js
function remapKey(string) {
  if (remapKeys.hasOwnProperty(string)) {
    return remapKeys[string];
  }

  return string;
}

// Modified from chrome://mozapps/content/extensions/shortcuts.js
function getStringForEvent(event) {
  for (const option of keyOptions) {
    const value = option(event);
    if (validKeys.has(value)) {
      return value;
    }
  }
  return '';
}

// From chrome://mozapps/content/extensions/shortcuts.js
function getShortcutForEvent(e) {
  let modifierMap;

  if (navigator.platform === 'MacIntel') {
    modifierMap = {
      MacCtrl: e.ctrlKey,
      Alt: e.altKey,
      Command: e.metaKey,
      Shift: e.shiftKey,
    };
  } else {
    modifierMap = {
      Ctrl: e.ctrlKey,
      Alt: e.altKey,
      Shift: e.shiftKey,
    };
  }

  return Object.entries(modifierMap)
    .filter(([ key, isDown ]) => isDown)
    .map(([ key ]) => key)
    .concat(getStringForEvent(e))
    .join('+');
}

export default class shortcutInput extends HTMLElement {
  constructor(...args) {
    super(...args)
    // Attaches a shadow root to custom element.
    const shadowRoot = this.attachShadow({mode: 'open'})
    const commandName = this.getAttribute("command");

    linkCSS("../vendor/bootswatch.css");
    linkCSS("options.css");

    let wrapper = document.createElement("div");
    wrapper.classList.add("input-wrapper")
    shadowRoot.appendChild(wrapper);

    // Defines the "real" input element.
    let inputElement = document.createElement('input');
    inputElement.setAttribute('type', "text");
    inputElement.setAttribute("form", this.closest("form").id)
    inputElement.classList.add("hotkey-input")
    inputElement.addEventListener('keydown', (e) => shortCutChanged(e));
    this.inputElement = inputElement;

    // Appends the input into the shadow root.
    wrapper.appendChild(inputElement);

    let saveBtn = addButton("Save", "hotkey_save_button", "btn-primary");
    wrapper.appendChild(saveBtn);
    let resetBtn = addButton("Reset", "hotkey_reset_button", "btn-danger");
    wrapper.appendChild(resetBtn);
    saveBtn.addEventListener('click', (e) => {
      updateShortcut();
    });
    resetBtn.addEventListener('click', (e) => {
      resetShortcut();
    });

    function linkCSS(url) {
      // Apply external styles to the shadow dom
      const linkElem = document.createElement('link');
      linkElem.setAttribute('rel', 'stylesheet');
      linkElem.setAttribute('href', url);
      // Attach the created element to the shadow dom
      shadowRoot.appendChild(linkElem);
    }

    function addButton(text, i18n_key, btnClass) {
      let btn = document.createElement('button');
      for (const c of ["btn", "btn-sm", btnClass]) {
        btn.classList.add(c);
      }
      btn.textContent = text;
      btn.setAttribute("data-i18n", i18n_key);
      return btn;
    }

    async function updateShortcut() {
      try {
        await browser.commands.update({
          name: commandName,
          shortcut: inputElement.value
        });
        // createBanner('success', shortcut);
      } catch (err) {
        console.log('Cannot change shortcut: ' + err);
        // createBanner('danger', shortcut);
      }
    }
    this.setShortcut = updateShortcut;

    async function resetShortcut() {
      await browser.commands.reset(commandName);
      // createBanner('info', shortcut);
      updateKeys();
    }

    async function updateKeys() {
      const commands = await browser.commands.getAll();
      for (const c of commands) {
        if (c.name === commandName) {
          inputElement.value = c.shortcut
        }
      }
    }

    function shortCutChanged(e) {
      const input = e.target;

      if (e.key === 'Escape') {
        input.blur();
        return;
      } else if (e.key === 'Tab') {
        return;
      }

      if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Avoid triggering back-navigation.
          e.preventDefault();
          e.currentTarget.value = '';
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      const shortcutString = getShortcutForEvent(e);
      if (e.type === 'keyup' || !shortcutString.length) {
        return;
      }

      e.currentTarget.value = shortcutString;
    }
  }
  get value() {
    return this.inputElement.getAttribute("value") || "";
  }
  set value(v) {
    this.inputElement.setAttribute("value", v);
    return this.setShortcut();
  }
  get validity() {
    return this.inputElement.validity;
  }
  get name() {
    return this.getAttribute("name");
  }
  get form() {
    return this.inputElement.form;
  }
  get disabled() {
    return this.inputElement.disabled;
  }
}
