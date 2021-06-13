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
import { kSyntaxCSSStyles, fetchExtFile } from "./options-storage.js"

(async () => {
  window.OptionsStore = await OptionsStorePromise
  const hotkeyHandler = new HotkeyHandler("hotkey-input")
  const form = document.getElementById("mdh-options-form")
  const cssSyntaxSelect = document.getElementById("css-syntax-select")
  const cssSyntaxEdit = document.getElementById("css-syntax-edit")
  const SyntaxCSSStyles = await kSyntaxCSSStyles
  let savedMsgToast

  function showSavedMsg() {
    savedMsgToast.show()
    setTimeout(function() {
      savedMsgToast.hide()
    }, 5000)
  }

  async function onOptionsLoaded() {
    savedMsgToast = new BSN.Toast("#saved-msg")

    const tests_link = document.getElementById("tests-link")
    const optTabs = document.getElementById("optionsTabList")
    const optTabLinks = optTabs.getElementsByTagName("a")
    Array.from(optTabLinks).map(tab => new BSN.Tab(tab, {}))

    tests_link.addEventListener("click", function(e) {
      messenger.tabs.create({url: tests_link.getAttribute("href")})
    })

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
      const opt = new Option(name, filename.toString())
      cssSyntaxSelect.options.add(opt)
    }

    cssSyntaxSelect.addEventListener('change', cssSyntaxSelectChange)

    if (messenger !== undefined) {
      await fillSupportInfo()
      await loadChangeList()
      let rv = await OptionsStore.get("hotkey-input")
      document.getElementById("hotkey-display-str").innerText = rv["hotkey-input"]
      if (document.location.hash === "#docs") {
        let e
        e = document.getElementById("options-tab")
        e.classList.remove("active")
        e.setAttribute("aria-selected", false)
        document.getElementById("options").classList.remove("active", "show")

        e = document.getElementById("docs-tab")
        e.classList.add("active")
        e.setAttribute("aria-selected", true)
        document.getElementById("docs").classList.add("active", "show")
      }
    }

    form.addEventListener("hotkey", handleHotKey)

    // Reset buttons
    for (const btn of document.getElementsByClassName("reset-button")) {
      btn.addEventListener("click", onResetButtonClicked, false)
    }

    await OptionsStore.syncForm(form)
    await cssSyntaxSelectChange()
    form.addEventListener("options-sync:form-synced", showSavedMsg)
  }

  async function onResetButtonClicked(event) {
    const btn = event.target.closest("button")
    const input_target = document.getElementById(btn.dataset.fieldId)
    await OptionsStore.reset(input_target.name)
    showSavedMsg()
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

  async function loadChangeList() {
    let changes = await fetchExtFile("/CHANGES.md")
    let markedOptions = {
      gfm: true,
      pedantic: false,
      sanitize: false }

    changes = marked(changes, markedOptions)

    Utils.saferSetInnerHTML(document.getElementById("mdhrChangeList"), changes)
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
        )
        showSavedMsg()
        document.getElementById("hotkey-display-str").innerText = newHotKey
      })
  }

  // The syntax highlighting CSS combo-box selection changed.
  async function cssSyntaxSelectChange() {
    if (cssSyntaxSelect.selectedIndex < 0) {
      // This might be an upgrade from custom highlight CSS or possibly a removed
      // color scheme, so just set a default (nnfx.css).
      cssSyntaxSelect[65].selected = true
    }
    const selected = cssSyntaxSelect.options[cssSyntaxSelect.selectedIndex].value

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

  await onOptionsLoaded()
})()
