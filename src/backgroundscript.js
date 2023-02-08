/*
 * Copyright JFX 2021
 * Copyright Adam Pritchard 2016
 * MIT License
 */

"use strict"
/*global messenger:false, Utils:false, CommonLogic:false */

/*
 * Mail Extension background script.
 */
import {getHljsStylesheet} from './async_utils.js'
import OptionsStore from "./options/options-storage.js"
import markdownRender from "./markdown-render.js"

messenger.runtime.onInstalled.addListener(async (details) => {
  console.log(`onInstalled running... ${details.reason}`)
  const APP_NAME = Utils.getMessage("app_name")
  function updateCallback(winId, url) {
    const message = Utils.getMessage("upgrade_notification_text", APP_NAME)
    openNotification(winId,
      message,
      messenger.notificationbar.PRIORITY_INFO_MEDIUM,
      [Utils.getMessage("update_notes_button"), Utils.getMessage("cancel_button")]
    ).then(rv => {
      if (rv === "ok") {
        messenger.tabs.create({
          "url": url.href,
          windowId: winId,
        })
      }
    })
  }

  function installCallback(winId, url) {
    messenger.tabs.create({
      "url": url.href,
      windowId: winId,
    })
  }

  const win = await messenger.windows.getCurrent()
  const winId = win.id
  let onboardUrl = new URL(messenger.runtime.getURL("/options/options.html"))
  let callback

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
messenger.runtime.onMessage.addListener(function(request, sender, responseCallback) {
  // The content script can load in a not-real tab (like the search box), which
  // has an invalid `sender.tab` value. We should just ignore these pages.
  if (typeof (sender.tab) === 'undefined' ||
    typeof (sender.tab.id) === 'undefined' || sender.tab.id < 0) {
    return false
  }
  if (!request.action && request.popupCloseMode) {
    return false
  }

  if (request.action === 'render') {
    OptionsStore.getAll()
      .then(prefs => {
        getHljsStylesheet(`${prefs["syntax-css"]}`)
          .then(syntaxCSS => {
            responseCallback({
              html: markdownRender(
                request.mdText,
                prefs),
              css: (prefs['main-css'] + syntaxCSS)
            })
            return true
          })
      }).catch(e => {
      throw(e)
    })
    return true
  }
  else if (request.action === 'get-options') {
    OptionsStore.getAll().then(prefs => {
      responseCallback(prefs)
    })
    return true
  }
  else if (request.action === 'show-toggle-button') {
    if (request.show) {
      messenger.composeAction.enable(sender.tab.id)
      messenger.menus.update("mdhr_toggle_context_menu", {enabled: true})
      messenger.composeAction.setTitle({
        title: Utils.getMessage("toggle_button_tooltip"),
        tabId: sender.tab.id
      })
      messenger.composeAction.setIcon({
        path: {
          "16": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "19": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "32": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "38": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "64": messenger.runtime.getURL('/images/rocmarkdown.svg')
        },
        tabId: sender.tab.id
      })
      return false
    }
    else {
      messenger.composeAction.disable(sender.tab.id)
      messenger.menus.update("mdhr_toggle_context_menu", {enabled: false})
      messenger.composeAction.setTitle({
        title: Utils.getMessage("toggle_button_tooltip_disabled"),
        tabId: sender.tab.id
      })
      messenger.composeAction.setIcon({
        path: {
          "16": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "19": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "32": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "38": messenger.runtime.getURL('/images/rocmarkdown.svg'),
          "64": messenger.runtime.getURL('/images/rocmarkdown.svg')
        },
        tabId: sender.tab.id
      })
      return false
    }
  }
  else if (request.action === 'open-tab') {
    messenger.tabs.create({
      'url': request.url
    })
    return false
  }
  else if (request.action === 'get-unrender-markdown-warning') {
    return openNotification(sender.tab.windowId,
      Utils.getMessage("unrendering_modified_markdown_warning"),
      messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
      [Utils.getMessage("unrender_button"), Utils.getMessage("cancel_button")]
    )
  }
  else if (request.action === 'test-request') {
    responseCallback('test-request-good')
    return false
  }
  else if (request.action === "test-bg-request") {
    if (request.argument) {
      return Promise.resolve(["test-bg-request",
        "test-bg-request-ok",
        request.argument])
    }
    return Promise.resolve([
      "test-bg-request",
      "test-bg-request-ok"])
  }
  else if (request.action === 'update-hotkey') {
    return messenger.commands.update({
      "name": "toggle-markdown",
      "shortcut": request.hotkey_value,
    }).then(() => {
      updateActionTooltip()
    })
  }
  else if (request.action === "compose-ready") {
    return onComposeReady(sender.tab)
  }
  else {
    console.log('unmatched request action', request.action)
    throw 'unmatched request action: ' + request.action
  }
})

// Add the composeAction (the button in the format toolbar) listener.
messenger.composeAction.onClicked.addListener(tab => {
  return composeRender(tab.id)
})

// Mail Extensions are not able to add composeScripts via manifest.json,
// they must be added via the API.
messenger.composeScripts.register({
  "js": [
    { file: "utils.js" },
    { file: "jsHtmlToText.js" },
    { file: "mdh-html-to-text.js" },
    { file: "markdown-here.js" },
    { file: "composescript.js" }
  ]
})

messenger.commands.onCommand.addListener(async function(command) {
  if (command === "toggle-markdown") {
    let wins = await messenger.windows.getAll({ populate: true, windowTypes: ["messageCompose"] })
    for (const win of wins) {
      if (win.focused) {
        let tabId = win.tabs[0].id
        return composeRender(tabId)
      }
    }
  }
})

messenger.compose.onBeforeSend.addListener(async function(tab, details) {
  let rv
  // If this is a plain text message, do not check for markdown-like content
  if (details.isPlainText) {
    return Promise.resolve({})
  }
  let forgotToRenderCheckEnabled = await forgotToRenderEnabled()
  if (!forgotToRenderCheckEnabled) {
    return Promise.resolve({})
  }

  let isMarkdown = await messenger.tabs.sendMessage(
    tab.id, { action: "check-forgot-render" })
  if (isMarkdown) {
    const message = `${Utils.getMessage("forgot_to_render_prompt_info")}
        ${Utils.getMessage("forgot_to_render_prompt_question")}`

    rv = await openNotification(tab.windowId,
      message,
      messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
      [
        Utils.getMessage("forgot_to_render_send_button"),
        Utils.getMessage("forgot_to_render_back_button")
      ]
    )
  }
  else {
    rv = "ok"
  }
  if (rv === "ok") {
    return Promise.resolve({})
  }
  else {
    return Promise.resolve({ cancel: true })
  }
})

async function composeRender(tabId) {
  // Send a message to the compose window to toggle markdown rendering
  let composeDetails = await messenger.compose.getComposeDetails(tabId)
  // Do not try to render plain text emails
  if (composeDetails.isPlainText) {
    return
  }
  messenger.tabs.sendMessage(tabId, { action: 'toggle-markdown', })
}

async function openNotification(windowId, message, priority, button_labels) {
  async function notificationClose(notificationId) {
    return new Promise(resolve => {
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
        label: button_labels[0]
      },
      {
        id: "btn-cancel",
        label: button_labels[1]
      }
    ],
    placement: "bottom",
  })
  return await notificationClose(notificationId)
}

function forgotToRenderEnabled() {
  return new Promise(resolve => {
    let rv = false
    OptionsStore.getAll().then(prefs => {
      rv = prefs["forgot-to-render-check-enabled"]
      resolve(rv)
    })
  })
}

// Show the shortcut hotkey on the ComposeAction button
async function updateActionTooltip() {
  const hotkey = await OptionsStore.get("hotkey-input")
  const msg = Utils.getMessage("toggle_button_tooltip")
  await messenger.composeAction.setTitle({ title: `${msg}\n${hotkey["hotkey-input"]}` })
}
updateActionTooltip()

// Context menu in compose window
async function createContextMenu() {
  let menuId = await messenger.menus.create({
    id: "mdhr_toggle_context_menu",
    title: Utils.getMessage("context_menu_item"),
    contexts: ["page", "selection"],
    icons: {
      "16": "images/rocmarkdown.svg",
    },
    visible: false,
    enabled: true,
  })
  messenger.menus.onShown.addListener((info, tab) => {
    if (tab.type === "messageCompose") {
      messenger.compose.getComposeDetails(tab.id)
        .then(details => {
          if (!details.isPlainText) {
            messenger.menus.update(menuId, {visible: true})
            messenger.menus.refresh()
          }
        })
    }
  })
  messenger.menus.onHidden.addListener((info, tab) => {
    messenger.menus.update(menuId, {visible: false})
    messenger.menus.refresh()
   })
  messenger.menus.onClicked.addListener((info, tab) => {
    return composeRender(tab.id)
  })
}
createContextMenu()

async function onComposeReady(tab) {
  let composeDetails = await messenger.compose.getComposeDetails(tab.id)
  if (["reply", "forward"].includes(composeDetails.type)) {
    let identityId = composeDetails.identityId
    let replyPosition = await messenger.reply_prefs.getReplyPosition(identityId)
    let useParagraph = await messenger.reply_prefs.getUseParagraph()
    return {reply_position: replyPosition, use_paragraph: useParagraph}
  }
}
