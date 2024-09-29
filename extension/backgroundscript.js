/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

/*
 * Mail Extension background script.
 */
import { getHljsStylesheet, getMessage, sha256Digest, toInt } from "./async_utils.mjs"
import OptionsStore from "./options/options-storage.js"
import { markdownRender, resetMarked } from "./markdown-render.js"
import { getShortcutStruct } from "./options/shortcuts.js"

const ICON_INACTIVE = "images/md_bw.svg"
const ICON_RENDERED = "images/md_fucsia.svg"

messenger.runtime.onInstalled.addListener(async (details) => {
  console.log(`onInstalled running... ${details.reason}`)
  const APP_NAME = getMessage("app_name")
  function updateCallback(winId, url) {
    const message = getMessage("upgrade_notification_text", APP_NAME)
    openNotification(winId, message, messenger.notificationbar.PRIORITY_INFO_MEDIUM, [
      getMessage("update_notes_button"),
      getMessage("cancel_button"),
    ]).then((rv) => {
      if (rv === "ok") {
        messenger.tabs.create({
          url: url.href,
          windowId: winId,
        })
      }
    })
  }

  function installCallback(winId, url) {
    messenger.tabs.create({
      url: url.href,
      windowId: winId,
    })
  }

  const win = await messenger.windows.getCurrent()
  const winId = win.id
  let onboardUrl = new URL(messenger.runtime.getURL("/options/options.html"))

  switch (details.reason) {
    case "install":
      onboardUrl.hash = "#docs"
      installCallback(winId, onboardUrl)
      break
    case "update":
      onboardUrl.searchParams.set("previousVersion", details.previousVersion)
      onboardUrl.hash = "#about"
      updateCallback(winId, onboardUrl)
      break
  }
  await doStartup()
})

// Handle rendering requests from the content script.
// See the comment in markdown-render.js for why we do this.
messenger.runtime.onMessage.addListener(function (request, sender, responseCallback) {
  // The content script can load in a not-real tab (like the search box), which
  // has an invalid `sender.tab` value. We should just ignore these pages.
  if (typeof sender.tab?.id === "undefined" || sender.tab.id < 0) {
    return false
  }
  if (!request.action && request.popupCloseMode) {
    return false
  }
  // Ignore messages for compose-preview pane
  if (request.action.startsWith("cp.")) {
    return false
  }
  if (request.action === "render") {
    return doRender(request.mdText)
  } else if (request.action === "render-md") {
    return markdownRender(request.mdText)
  } else if (request.action === "get-options") {
    OptionsStore.getAll().then((prefs) => {
      responseCallback(prefs)
    })
    return true
  } else if (request.action === "set-composeaction-purple") {
    messenger.composeAction.setIcon({
      path: {
        16: "images/md_fucsia.svg",
        19: "images/md_fucsia.svg",
        32: "images/md_fucsia.svg",
        38: "images/md_fucsia.svg",
        64: "images/md_fucsia.svg",
      },
      tabId: sender.tab.id,
    })
    return false
  } else if (request.action === "set-composeaction-bw") {
    messenger.composeAction.setIcon({
      path: {
        16: "images/md_bw.svg",
        19: "images/md_bw.svg",
        32: "images/md_bw.svg",
        38: "images/md_bw.svg",
        64: "images/md_bw.svg",
      },
      tabId: sender.tab.id,
    })
    return false
  } else if (request.action === "open-tab") {
    messenger.tabs.create({
      url: request.url,
    })
    return false
  } else if (request.action === "test-request") {
    responseCallback("test-request-good")
    return false
  } else if (request.action === "test-bg-request") {
    if (request.argument) {
      return Promise.resolve(["test-bg-request", "test-bg-request-ok", request.argument])
    }
    return Promise.resolve(["test-bg-request", "test-bg-request-ok"])
  } else if (request.action === "update-hotkey") {
    return updateHotKey(request.hotkey_value, request.hotkey_tooltip)
  } else if (request.action === "compose-data") {
    return getComposeData(sender.tab)
  } else if (request.action === "renderer-reset") {
    return resetMarked()
  } else if (request.action === "sha256") {
    return sha256Digest(request.data)
  } else if (request.action === "mdhr-mode-set") {
    if (request.mode && request.mode === "classic") {
      return setClassicMode(request.hidden)
    } else if (request.mode && request.mode === "modern") {
      return setModernMode(request.hidden)
    }
  } else {
    console.log("unmatched request action", request.action)
    throw "unmatched request action: " + request.action
  }
})

async function doRender(mdText) {
  async function getSyntaxCSS() {
    const syntax_css_name = await OptionsStore.get("syntax-css")
    return await getHljsStylesheet(syntax_css_name["syntax-css"])
  }
  async function getMainCSS() {
    const main_css = await OptionsStore.get("main-css")
    return main_css["main-css"]
  }
  const syntax_css_p = getSyntaxCSS()
  const main_css_p = getMainCSS()
  const html_p = markdownRender(mdText)

  const [main_css, syntax_css, html] = await Promise.all([main_css_p, syntax_css_p, html_p])
  return { html, main_css, syntax_css }
}

// Add the composeAction (the button in the format toolbar) listener.
messenger.composeAction.onClicked.addListener((tab) => {
  return composeAction(tab.windowId)
})

// Add a context menu to the composeAction button
const menu_reset_id = await messenger.menus.create({
  id: "mdhr-reset-preview",
  title: getMessage("reset_preview"),
  contexts: ["compose_action"],
})
messenger.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === menu_reset_id) {
    await resetModernMode()
  }
})

// Add context menu to message list allowing editing of markdown of a previously sent message
const menu_edit_markdown_id = await messenger.menus.create({
  id: "mdhr-message-edit-as-new",
  title: getMessage("edit_as_new_markdown_message"),
  contexts: ["message_list"],
})

function base64ToStr(base64) {
  const binString = atob(base64)
  const arr = Uint8Array.from(binString, (m) => m.codePointAt(0))
  return new TextDecoder().decode(arr)
}

function loadOldMarkdown(bodyHTML) {
  const mailDocument = new DOMParser().parseFromString(bodyHTML, "text/html")
  const rawMDHR = mailDocument.body.querySelectorAll(".mdhr-raw")
  if (rawMDHR.length === 1) {
    const data = rawMDHR[0].title.substring(4)
    return base64ToStr(data)
  }
}

messenger.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === menu_edit_markdown_id) {
    for (const msgHeader of info.selectedMessages.messages) {
      const messageId = msgHeader.id
      let details = {}
      const textParts = await messenger.messages.listInlineTextParts(messageId)
      for (const part of textParts) {
        if (part.contentType === "text/html") {
          details["body"] = loadOldMarkdown(part.content)
        }
      }
      await messenger.compose.beginNew(messageId, details)
    }
  }
})

async function resetModernMode(preview = true, width = true) {
  const savedPreviewWidth = (await OptionsStore.get("saved-preview-width"))["saved-preview-width"]
  const saved = await saveComposed()
  await unInjectMDPreview()
  await OptionsStore.set({
    "mdhr-mode": "modern",
    "enable-markdown-mode": "true",
    "preview-width": savedPreviewWidth,
  })
  //await OptionsStore.reset("preview-width")
  await injectMDPreview()
  await restoreComposed(saved)
}

// Mail Extensions are not able to add composeScripts via manifest.json,
// they must be added via the API.
messenger.composeScripts.register({
  js: [{ file: "composescript.js" }],
})

async function getOpenComposeWindows() {
  return await messenger.windows.getAll({ populate: true, windowTypes: ["messageCompose"] })
}

messenger.commands.onCommand.addListener(async function (command) {
  if (command === "toggle-markdown") {
    let wins = await getOpenComposeWindows()
    for (const win of wins) {
      if (win.focused) {
        return composeAction(win.id)
      }
    }
  }
})

messenger.compose.onBeforeSend.addListener(async function (tab, details) {
  // If this is a plain text message, do not check for markdown-like content
  if (details.isPlainText) {
    return Promise.resolve({})
  }
  const savedState = await OptionsStore.get([
    "forgot-to-render-check-enabled",
    "enable-markdown-mode",
  ])
  const markdownEnabled = savedState["enable-markdown-mode"]
  const forgotToRenderCheckEnabled = savedState["forgot-to-render-check-enabled"]
  if (!markdownEnabled && forgotToRenderCheckEnabled) {
    const isMarkdown = await messenger.tabs.sendMessage(tab.id, { action: "check-forgot-render" })
    if (isMarkdown) {
      const message = `${getMessage("forgot_to_render_prompt_info")}
          ${getMessage("forgot_to_render_prompt_question")}`
      const rv = await openNotification(
        tab.windowId,
        message,
        messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
        [getMessage("forgot_to_render_send_button"), getMessage("forgot_to_render_back_button")],
      )
      if (rv !== "ok") {
        return Promise.resolve({ cancel: true }) // Markdown disabled and is markdown content
      }
    }
    return Promise.resolve({}) // Markdown disabled and not markdown content
  }
  const previewHidden = savedState["enable-markdown-mode"] === "false"
  if (previewHidden) {
    return Promise.resolve({})
  }
  const msgHTML = await messenger.runtime.sendMessage({
    action: "cp.get-content",
    windowId: tab.windowId,
  })
  const finalDetails = { body: msgHTML }
  return Promise.resolve({ cancel: false, details: finalDetails })
})

messenger.windows.onCreated.addListener(async function (win) {
  if (win.type !== "messageCompose") {
    return
  }
  win = await messenger.windows.get(win.id, { populate: true })
  const composeDetails = await messenger.compose.getComposeDetails(win.tabs[0].id)
  if (composeDetails.isPlainText) {
    await messenger.runtime.sendMessage({
      action: "cp.disableForPlainText",
      windowId: win.id,
    })
  }
})

async function composeAction(windowId) {
  const mdhr_mode = (await OptionsStore.get("mdhr-mode"))["mdhr-mode"]
  if (mdhr_mode === "classic") {
    return doClassicRender(windowId)
  }
  return toggleMDPreview(windowId)
}

async function doClassicRender(windowId) {
  const win = await messenger.windows.get(windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const icon_type = await messenger.runtime.sendMessage({
    action: "cp.toggle-classic-preview",
    windowId: windowId,
  })
  const tabId = win.tabs[0].id
  if (icon_type === "rendered") {
    await messenger.tabs.sendMessage(tabId, { action: "request-preview" })
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_RENDERED,
        19: ICON_RENDERED,
        32: ICON_RENDERED,
        38: ICON_RENDERED,
        64: ICON_RENDERED,
      },
      tabId: tabId,
    })
    await updateHotKey(true)
  } else {
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_INACTIVE,
        19: ICON_INACTIVE,
        32: ICON_INACTIVE,
        38: ICON_INACTIVE,
        64: ICON_INACTIVE,
      },
      tabId: tabId,
    })
    await updateHotKey(false)
  }
}

async function toggleMDPreview(windowId) {
  // Send a message to the compose window to toggle markdown rendering
  const win = await messenger.windows.get(windowId, {
    populate: true,
    windowTypes: ["messageCompose"],
  })
  const tabId = win.tabs[0].id
  let composeDetails = await messenger.compose.getComposeDetails(tabId)
  // Do not try to render plain text emails
  if (composeDetails.isPlainText) {
    return
  }
  const icon_type = await messenger.runtime.sendMessage({
    action: "cp.toggle-preview",
    windowId: windowId,
  })
  if (icon_type === "rendered") {
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_RENDERED,
        19: ICON_RENDERED,
        32: ICON_RENDERED,
        38: ICON_RENDERED,
        64: ICON_RENDERED,
      },
      tabId: tabId,
    })
    await updateHotKey(false)
  } else {
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_INACTIVE,
        19: ICON_INACTIVE,
        32: ICON_INACTIVE,
        38: ICON_INACTIVE,
        64: ICON_INACTIVE,
      },
      tabId: tabId,
    })
    await updateHotKey(true)
  }
}

async function openNotification(windowId, message, priority, button_labels) {
  async function notificationClose(notificationId) {
    return new Promise((resolve) => {
      let notificationResponse = "cancel"

      // Defining a onClosed listener
      function onClosedListener(closeWinId, closeNotificationId, closedByUser) {
        if (closeWinId === windowId) {
          messenger.notificationbar.onClosed.removeListener(onClosedListener)
          messenger.notificationbar.onButtonClicked.removeListener(onButtonClickListener)
          resolve(notificationResponse)
        }
      }

      function onButtonClickListener(closeWinId, closeNotificationId, buttonId) {
        if (closeWinId === windowId) {
          if (buttonId === "btn-ok") {
            notificationResponse = "ok"
          }
          resolve(notificationResponse)
        }
      }

      messenger.notificationbar.onDismissed.addListener(onClosedListener)
      messenger.notificationbar.onClosed.addListener(onClosedListener)
      messenger.notificationbar.onButtonClicked.addListener(onButtonClickListener)
    })
  }

  let notificationId = await messenger.notificationbar.create({
    windowId: windowId,
    priority: priority,
    label: message,
    buttons: [
      {
        id: "btn-ok",
        label: button_labels[0],
      },
      {
        id: "btn-cancel",
        label: button_labels[1],
      },
    ],
    placement: "bottom",
  })
  return await notificationClose(notificationId)
}

async function updateHotKey(rendered = null) {
  OptionsStore.get(["hotkey-input", "mdhr-mode", "enable-markdown-mode"]).then(
    async ({
      "hotkey-input": hotkey_value,
      "mdhr-mode": mdhr_mode,
      "enable-markdown-mode": enable_preview,
    }) => {
      const shortkeyStruct = getShortcutStruct(hotkey_value)
      let tooltip
      if (!shortkeyStruct.macShortcut) {
        tooltip = shortkeyStruct.shortcut
      } else {
        tooltip = shortkeyStruct.macShortcut
      }
      try {
        await messenger.commands.update({
          name: "toggle-markdown",
          shortcut: hotkey_value,
        })
        if (rendered !== null) {
          enable_preview = rendered
        }
        let tooltip_msg
        if (mdhr_mode === "classic") {
          tooltip_msg = !enable_preview ? "enable" : "disable"
        } else if (mdhr_mode === "modern") {
          tooltip_msg = enable_preview ? "enable" : "disable"
        } else {
          tooltip_msg = "disable"
        }
        const msg = getMessage(`toggle_button_tooltip_${tooltip_msg}`)
        await messenger.composeAction.setTitle({ title: `${msg}\n${tooltip}` })
      } catch (error) {
        return error
      }
      return "ok"
    },
  )
}

async function setClassicMode(hidden = true) {
  const previewWidth = (await OptionsStore.get("preview-width"))["preview-width"]
  await OptionsStore.set({ "saved-preview-width": previewWidth })
  const wins = await getOpenComposeWindows()
  for (const win of wins) {
    await messenger.runtime.sendMessage({
      action: "cp.set-classic-mode",
      windowId: win,
    })
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_INACTIVE,
        19: ICON_INACTIVE,
        32: ICON_INACTIVE,
        38: ICON_INACTIVE,
        64: ICON_INACTIVE,
      },
      tabId: win.tabs[0].id,
    })
    await updateHotKey(!hidden)
    await messenger.menus.update("mdhr-reset-preview", { enabled: false })
  }
}

async function setModernMode(hidden = false) {
  const savedPreviewWidth = (await OptionsStore.get("saved-preview-width"))["saved-preview-width"]
  await OptionsStore.set({ "preview-width": savedPreviewWidth })
  const wins = await getOpenComposeWindows()
  for (const win of wins) {
    await messenger.runtime.sendMessage({
      action: "cp.set-modern-mode",
      windowId: win,
    })
    await messenger.composeAction.setIcon({
      path: {
        16: ICON_RENDERED,
        19: ICON_RENDERED,
        32: ICON_RENDERED,
        38: ICON_RENDERED,
        64: ICON_RENDERED,
      },
      tabId: win.tabs[0].id,
    })
    await updateHotKey(hidden)
    await messenger.menus.update("mdhr-reset-preview", { enabled: true })
  }
}

async function getComposeData(tab) {
  const composeDetails = await messenger.compose.getComposeDetails(tab.id)
  const rv = {
    message_type: composeDetails.type,
    reply_position: null,
    use_paragraph: null,
  }
  if (["reply", "forward"].includes(composeDetails.type)) {
    const identityId = composeDetails.identityId
    rv.reply_position = await messenger.reply_prefs.getReplyPosition(identityId)
    rv.use_paragraph = await messenger.reply_prefs.getUseParagraph()
  }
  return rv
}

async function saveComposed() {
  const rv = []
  const wins = await getOpenComposeWindows()
  let win
  for (win of wins) {
    const tabId = win.tabs[0].id
    const savedMsgHdrs = await messenger.compose.saveMessage(tabId, { mode: "draft" })
    /*const details = {
      id: win.id,
      tabId: tabId,
      details: await messenger.compose.getComposeDetails(tabId),
    }*/
    rv.push(...savedMsgHdrs.messages)
    await messenger.windows.remove(win.id)
  }
  return rv
}

async function restoreComposed(msgHeaderList) {
  let msgHeaders
  for (msgHeaders of msgHeaderList) {
    await messenger.compose.beginNew(msgHeaders.id)
  }
}

async function injectMDPreview() {
  // Save state of open compose Windows as drafts
  const saved = await saveComposed()
  // Register custom UI compose editor
  const savedState = await OptionsStore.get([
    "mdhr-mode",
    "preview-width",
    "enable-markdown-mode",
    "saved-preview-width",
  ])
  const options = { mode: savedState["mdhr-mode"] }
  if (savedState["mdhr-mode"] === "modern") {
    try {
      options["width"] = toInt(savedState["preview-width"])
    } catch (e) {
      options["width"] = toInt(savedState["saved-preview-width"])
    }
    options["hidden"] = savedState["enable-markdown-mode"] === "false"
  } else {
    options["hidden"] = true
  }
  await messenger.ex_customui.add(
    messenger.ex_customui.LOCATION_COMPOSE_EDITOR,
    messenger.runtime.getURL("compose_preview/compose_preview.html"),
    options,
  )
  // Restore the saved drafts
  await restoreComposed(saved)
}

async function unInjectMDPreview() {
  // Save state of open compose Windows as drafts
  const saved = await saveComposed()
  await messenger.ex_customui.remove(
    messenger.ex_customui.LOCATION_COMPOSE_EDITOR,
    messenger.runtime.getURL("compose_preview/compose_preview.html"),
  )
  // Restore the saved drafts
  await restoreComposed(saved)
}

async function doStartup() {
  const savedState = await OptionsStore.get(["mdhr-mode", "preview-width"])
  if (savedState["mdhr-mode"] === "modern") {
    await OptionsStore.set({ "saved-preview-width": savedState["preview-width"] })
  }
  await updateHotKey()
  await resetMarked()
  await injectMDPreview()
}
messenger.runtime.onStartup.addListener(async function () {
  await doStartup()
})
