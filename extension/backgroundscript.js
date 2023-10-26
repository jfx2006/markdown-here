/*
 * Copyright JFX 2021-2023
 * Copyright Adam Pritchard 2013-2016
 * MIT License
 */

/*
 * Mail Extension background script.
 */
import { getHljsStylesheet, getMessage } from "./async_utils.mjs"
import OptionsStore from "./options/options-storage.js"
import { resetMarked, markdownRender } from "./markdown-render.js"
import { getShortcutStruct } from "./options/shortcuts.js"

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
  } else if (request.action === "show-toggle-button") {
    if (request.show) {
      messenger.composeAction.enable(sender.tab.id)
      messenger.menus.update("mdhr_toggle_context_menu", { enabled: true })
      messenger.composeAction.setTitle({
        title: getMessage("toggle_button_tooltip"),
        tabId: sender.tab.id,
      })
      messenger.composeAction.setIcon({
        path: {
          16: messenger.runtime.getURL("/images/md_bw.svg"),
          19: messenger.runtime.getURL("/images/md_bw.svg"),
          32: messenger.runtime.getURL("/images/md_fucsia.svg"),
          38: messenger.runtime.getURL("/images/md_fucsia.svg"),
          64: messenger.runtime.getURL("/images/md_fucsia.svg"),
        },
        tabId: sender.tab.id,
      })
      return false
    } else {
      messenger.composeAction.disable(sender.tab.id)
      messenger.menus.update("mdhr_toggle_context_menu", { enabled: false })
      messenger.composeAction.setTitle({
        title: getMessage("toggle_button_tooltip_disabled"),
        tabId: sender.tab.id,
      })
      messenger.composeAction.setIcon({
        path: {
          16: messenger.runtime.getURL("/images/md_trnsp.svg"),
          19: messenger.runtime.getURL("/images/md_trnsp.svg"),
          32: messenger.runtime.getURL("/images/md_trnsp.svg"),
          38: messenger.runtime.getURL("/images/md_trnsp.svg"),
          64: messenger.runtime.getURL("/images/md_trnsp.svg"),
        },
        tabId: sender.tab.id,
      })
      return false
    }
  } else if (request.action === "open-tab") {
    messenger.tabs.create({
      url: request.url,
    })
    return false
  } else if (request.action === "get-unrender-markdown-warning") {
    return openNotification(
      sender.tab.windowId,
      getMessage("unrendering_modified_markdown_warning"),
      messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
      [getMessage("unrender_button"), getMessage("cancel_button")]
    )
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
  } else if (request.action === "compose-ready") {
    return onComposeReady(sender.tab)
  } else if (request.action === "renderer-reset") {
    return resetMarked()
  } else {
    console.log("unmatched request action", request.action)
    throw "unmatched request action: " + request.action
  }
})

await resetMarked()

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
  return toggleMDPreview(tab.windowId)
})

// Mail Extensions are not able to add composeScripts via manifest.json,
// they must be added via the API.
messenger.composeScripts.register({
  js: [
    { file: "utils.js" },
    { file: "jsHtmlToText.js" },
    { file: "mdh-html-to-text.js" },
    { file: "composescript.js" },
  ],
})

messenger.commands.onCommand.addListener(async function (command) {
  if (command === "toggle-markdown") {
    let wins = await messenger.windows.getAll({ populate: true, windowTypes: ["messageCompose"] })
    for (const win of wins) {
      if (win.focused) {
        return toggleMDPreview(win.id)
      }
    }
  }
})

messenger.compose.onBeforeSend.addListener(async function (tab, details) {
  // If this is a plain text message, do not check for markdown-like content
  if (details.isPlainText) {
    return Promise.resolve({})
  }
  const savedState = await OptionsStore.get(["preview-hidden"])
  const previewHidden = savedState["preview-hidden"] === "true"
  if (previewHidden) {
    return Promise.resolve({})
  }
  const msgHTML = await messenger.runtime.sendMessage({
    action: "cp.get-content",
    windowId: tab.windowId,
  })
  return Promise.resolve({ cancel: false, details: { body: msgHTML } })
})

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
  return messenger.runtime.sendMessage({ action: "cp.toggle-preview", windowId: windowId })
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

async function updateHotKey(hotkey_value, tooltip) {
  await messenger.commands.update({
    name: "toggle-markdown",
    shortcut: hotkey_value,
  })
  const msg = getMessage("toggle_button_tooltip")
  await messenger.composeAction.setTitle({ title: `${msg}\n${tooltip}` })
}
OptionsStore.get("hotkey-input").then(async (result) => {
  const shortkeyStruct = getShortcutStruct(result["hotkey-input"])
  let tooltip = shortkeyStruct.shortcut
  if (shortkeyStruct.macShortcut) {
    tooltip = shortkeyStruct.macShortcut
  }
  await updateHotKey(shortkeyStruct.shortcut, tooltip)
})

async function onComposeReady(tab) {
  let composeDetails = await messenger.compose.getComposeDetails(tab.id)
  if (["reply", "forward"].includes(composeDetails.type)) {
    let identityId = composeDetails.identityId
    let replyPosition = await messenger.reply_prefs.getReplyPosition(identityId)
    let useParagraph = await messenger.reply_prefs.getUseParagraph()
    return {
      message_type: composeDetails.type,
      reply_position: replyPosition,
      use_paragraph: useParagraph,
    }
  }
  return {}
}

function str2Int(intstr) {
  let rv = Number.parseInt(intstr, 10)
  if (Number.isNaN(rv)) {
    return 0
  }
  return rv
}

async function injectMDPreview() {
  // Register custom UI compose editor
  const savedState = await OptionsStore.get(["preview-width", "preview-hidden"])
  const previewHidden = savedState["preview-hidden"] === "true"
  const previewWidth = str2Int(savedState["preview-width"])
  await messenger.ex_customui.add(
    messenger.ex_customui.LOCATION_COMPOSE_EDITOR,
    messenger.runtime.getURL("compose_preview/compose_preview.html"),
    { hidden: previewHidden, width: previewWidth }
  )
}
await injectMDPreview()
