/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options page UI code
 */

/* global messenger:false, Utils:false bootstrap:false */

import markdownRender from "../markdown-render.js"
import HotkeyHandler from "./shortcuts.js"
import DOMPurify from "../vendor/purify.es.js"

import {
  fetchExtFile,
  getHljsStyles,
  getHljsStylesheetURL,
  getLanguage,
  getMessage,
} from "../async_utils.mjs"
import OptionsStore from "./options-storage.js"
;(async () => {
  // eslint-disable-next-line no-unused-vars
  const hotkeyHandler = new HotkeyHandler("hotkey-input")
  const form = document.getElementById("mdh-options-form")
  const cssSyntaxSelect = document.getElementById("css-syntax-select")
  const previewInput = document.getElementById("preview_input")
  const previewIframe = document.getElementById("preview")
  let inputDirty = true
  // eslint-disable-next-line no-unused-vars
  let checkChangeTimeout = null
  let savedMsgToast

  function showSavedMsg() {
    inputDirty = true
    savedMsgToast.show()
    setTimeout(function () {
      savedMsgToast.hide()
    }, 5000)
  }

  function link_onClicked(e) {
    const elem = e.target
    if (elem.localName !== "a") {
      return
    }
    if (elem.protocol === "moz-extension:") {
      e.preventDefault()
      messenger.tabs.create({ url: elem.href })
    } else if (elem.protocol === "https:" || elem.protocol === "http:") {
      e.preventDefault()
      messenger.windows.openDefaultBrowser(elem.href)
    }
  }

  async function onOptionsLoaded() {
    messenger.management.getSelf().then((info) => {
      if (info.installType === "development") {
        const tests_link = document.getElementById("tests-link")
        tests_link.hidden = false
      }
    })

    await localizePage()
    activatePillNav()
    if (document.location.hash !== "") {
      activatePill(document.location.hash)
    }
    savedMsgToast = new bootstrap.Toast("#saved-msg")

    document.addEventListener("click", link_onClicked)

    document.getElementById("copyVersionToClipboard").addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()
      const copyText = document.getElementById("versionInfo").innerText
      navigator.clipboard.writeText(copyText)
      const check = e.target.nextElementSibling
      check.classList.add("show")
      setTimeout(function () {
        check.classList.remove("show")
      }, 5000)
    })

    const SyntaxCSSStyles = await getHljsStyles()
    for (const [name, filename] of Object.entries(SyntaxCSSStyles)) {
      const opt = new Option(name, filename.toString())
      cssSyntaxSelect.options.add(opt)
    }

    if (messenger !== undefined) {
      await fillSupportInfo()
      await loadChangeList()
      await setInitialText()
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

    previewIframe.addEventListener("load", handlePreviewLoad)
    previewInput.addEventListener("input", handleInput, false)
    previewInput.addEventListener("scroll", setPreviewScroll, false)

    await OptionsStore.syncForm(form)
    form.addEventListener("options-sync:form-synced", showSavedMsg)
    form.addEventListener("options-sync:form-synced", handleMathRenderer)

    checkPreviewChanged()
    handleMathRenderer()
  }

  function activatePillNav() {
    const triggerPillList = document.querySelectorAll("#optionsTabList a")
    triggerPillList.forEach((triggerEl) => {
      const pillTrigger = new bootstrap.Tab(triggerEl)
      triggerEl.addEventListener("click", (event) => {
        event.preventDefault()
        pillTrigger.show()
      })
    })
  }

  function activatePill(url_hash) {
    const selector = `#optionsTabList a[data-bs-toggle='pill'][href='${url_hash}']`
    const triggerEl = document.querySelector(selector)
    bootstrap.Tab.getInstance(triggerEl).show()
  }

  function escapeHTML(strings, html) {
    return `${DOMPurify.sanitize(html)}`
  }

  function handlePreviewLoad() {
    inputDirty = true
  }

  function getScrollSize(e) {
    return e.scrollHeight - e.clientHeight
  }

  function getScrollPercent() {
    let size = getScrollSize(previewInput)
    if (size <= 0) {
      return 1
    }
    return previewInput.scrollTop / size
  }

  function setPreviewScroll() {
    let preview_scroll = previewIframe.contentDocument.scrollingElement
    preview_scroll.scrollTop = getScrollPercent() * getScrollSize(preview_scroll)
  }

  function checkPreviewChanged() {
    OptionsStore.getAll()
      .then((prefs) => {
        if (inputDirty) {
          getHljsStylesheetURL(prefs["syntax-css"])
            .then((hljs_css_url) => {
              previewIframe.contentDocument.getElementById("hljs_css").href = hljs_css_url

              let md_stylesheet = prefs["main-css"]
              let style_elem = previewIframe.contentDocument.getElementById("md_css")
              style_elem.innerText = md_stylesheet

              let html = markdownRender(previewInput.value, prefs)
              previewIframe.contentDocument.body.innerHTML = escapeHTML`${html}`
              Utils.convertMathSVGs(previewIframe.contentDocument.body)

              setPreviewScroll()

              inputDirty = false
            })
            .catch((reason) => {
              console.log(`Error getting hljs css. ${reason}`)
            })
        }
      })
      .finally(() => {
        checkChangeTimeout = setTimeout(checkPreviewChanged, 100)
      })
  }

  async function setInitialText() {
    if (previewInput.value === "") {
      const preview_lang = await getLanguage()
      previewInput.value = await fetchExtFile(`/_locales/${preview_lang}/preview.md`)
    }
  }

  function handleInput() {
    inputDirty = true
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
    document.getElementById(
      "mdhrThunderbirdVersion"
    ).innerText = `${browser_info.name} ${browser_info.version} ${browser_info.buildID}`
    document.getElementById("mdhrOS").innerText = `${platform.os} ${platform.arch}`
  }

  async function loadChangeList() {
    let changes = await fetchExtFile("/CHANGES.md")
    let userprefs = await OptionsStore.getAll()

    changes = markdownRender(changes, userprefs)

    Utils.saferSetInnerHTML(document.getElementById("mdhrChangeList"), changes)
  }

  async function handleHotKey(e) {
    let newHotKey = e.detail.value()
    await OptionsStore.set({ "hotkey-input": newHotKey })
    Utils.makeRequestToBGScript("update-hotkey", { hotkey_value: newHotKey }).then(() => {
      form.dispatchEvent(
        new CustomEvent("options-sync:form-synced", {
          bubbles: true,
        })
      )
      showSavedMsg()
      document.getElementById("hotkey-display-str").innerText = newHotKey
    })
  }

  function handleMathRenderer(e) {
    // Run when enabling/disabling/changing Math Renderer
    let selected = document.querySelector("[name='math-renderer']:checked")
    let value = selected.value

    let e_math_url = document.getElementById("math-value")
    let e_math_url_reset = document.getElementById("math-reset-button")
    if (value === "gchart") {
      e_math_url.disabled = false
      e_math_url_reset.disabled = false
    } else {
      e_math_url.disabled = true
      e_math_url_reset.disabled = true
    }
  }

  const SUBS = { __APP_NAME: getMessage("app_name") }
  async function localizePage() {
    const page_prefix = "options_page"
    const nodes = document.body.querySelectorAll("[data-i18n]")
    for (let n of nodes) {
      let message_id = `${page_prefix}__${n.dataset.i18n}`
      let arg_str = n.dataset.i18nArg
      let arg = null
      if (arg_str !== undefined) {
        if (arg_str.startsWith("__")) {
          arg = SUBS[arg_str]
        } else {
          arg = arg_str
        }
      }
      let message = getMessage(message_id, arg)
      if (message) {
        n.textContent = message
      }
    }
  }
  await onOptionsLoaded()
})()
