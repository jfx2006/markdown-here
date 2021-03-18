/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options page UI code
 */

/* global messenger:false, Utils:false */

import BSN from "../vendor/bootstrap-native.esm.js"
import HotkeyHandler from "./shortcuts.js"

import OptionsStorePromise from "./options-storage.js"
import { kSyntaxCSSStyles } from "./options-storage.js"

(async () => {
  window.OptionsStore = await OptionsStorePromise;
  const hotkeyHandler = new HotkeyHandler("hotkey-input")
  const form = document.getElementById("mdh-options-form")
  const cssSyntaxSelect = document.getElementById("css-syntax-select")
  const cssSyntaxEdit = document.getElementById("css-syntax-edit")
  const SyntaxCSSStyles = await kSyntaxCSSStyles;
  let savedMsgToast

  function showSavedMsg() {
    savedMsgToast.show()
    setTimeout(function() {
      savedMsgToast.hide()
    }, 5000)
  }

  async function onOptionsLoaded() {
    savedMsgToast = new BSN.Toast("#saved-msg")

    const optTabs = document.getElementById("optionsTabList")
    const optTabLinks = optTabs.getElementsByTagName("a")
    Array.from(optTabLinks).map(tab => new BSN.Tab(tab, {}))

    document.getElementById("copyVersionToClipboard").addEventListener('click', function(e) {
      e.preventDefault()
      e.stopPropagation()
      const copyText = document.getElementById('versionInfo').innerText
      navigator.clipboard.writeText(copyText)
      const check = e.target.nextElementSibling
      check.classList.add("show")
      setTimeout(function() {
        check.classList.remove("show")
      }, 5000)
    })

    for (const [name, filename] of Object.entries(SyntaxCSSStyles)) {
      const opt= new Option(name, filename.toString())
      cssSyntaxSelect.options.add(opt)
    }

    cssSyntaxSelect.options.add(new Option(messenger.i18n.getMessage('currently_in_use'), ''));
    cssSyntaxSelect.selectedIndex = cssSyntaxSelect.options.length - 1;
    cssSyntaxSelect.addEventListener('change', cssSyntaxSelectChange);

    if (messenger !== undefined) {
      await fillSupportInfo()
    }

    form.addEventListener("hotkey", handleHotKey)
    await OptionsStore.syncForm(form)
    await cssSyntaxSelectChange();
    form.addEventListener("options-sync:form-synced", savedMsgToast.show())
  }

  async function fillSupportInfo() {
    const platform = await messenger.runtime.getPlatformInfo()
    const browser_info = await messenger.runtime.getBrowserInfo()
    const appManifest = messenger.runtime.getManifest()
    document.getElementById("mdhrVersion").innerText = appManifest.version
    document.getElementById("mdhrThunderbirdVersion").innerText =
      `${browser_info.name} ${browser_info.version} ${browser_info.buildID}`
    document.getElementById("mdhrOS").innerText = `${platform.os} ${platform.arch}`
  }

  async function handleHotKey(e) {
    let newHotKey = e.detail.value()
    await OptionsStore.set({ "hotkey-input": newHotKey})
    Utils.makeRequestToBGScript('update-hotkey', {"hotkey_value": newHotKey})
      .then(() => {
        form.dispatchEvent(
          new CustomEvent("options-sync:form-synced", {
            bubbles: true,
          })
        );
        showSavedMsg();
      })
  }

  // The syntax hightlighting CSS combo-box selection changed.
  async function cssSyntaxSelectChange() {
    const selected = cssSyntaxSelect.options[cssSyntaxSelect.selectedIndex].value;
    if (!selected) {
      // This probably indicates that the user selected the "currently in use"
      // option, which is by definition what is in the edit box.
      return;
    }
    // Remove the "currently in use" option, since it doesn't make sense anymore.
    if (!cssSyntaxSelect.options[cssSyntaxSelect.options.length-1].value) {
      cssSyntaxSelect.options.length -= 1;
    }
    // Get the CSS for the selected theme.
    const url = messenger.runtime.getURL(`/highlightjs/styles/${selected}`)
    try {
      const response = await fetch(url)
      cssSyntaxEdit.value = await response.text()
    }
    catch (e) {
      console.log(`Error fetching CSS: ${selected}`)
      console.log(e)
    }
  }

  // window.addEventListener('load', onOptionsLoaded)
  await onOptionsLoaded()
})()
