/*
 * Copyright JFX 2021
 * Copyright Adam Pritchard 2016
 * MIT License
 */

"use strict";
/*global messenger:false, MarkdownRender:false,
  marked:false, hljs:false, Utils:false, CommonLogic:false */

/*
 * Mail Extension background script.
 */
import OptionsStorePromise from "./options/options-storage.js"

(async () => {
  let OptionsStore = await OptionsStorePromise;

  messenger.runtime.onInstalled.addListener(async (details) => {
    function updateCallback(winId, url) {
      const message = Utils.getMessage("upgrade_notification_text");
      openNotification(winId,
        message,
        messenger.notificationbar.PRIORITY_INFO_MEDIUM,
        ["Update Notes", "Cancel"]
      ).then(rv => {
        if (rv === "ok") {
          messenger.tabs.create({
            "url": url.href,
            windowId: winId,
          });
        }
      });
    }

    function installCallback(winId, url) {
      messenger.tabs.create({
        "url": url.href,
        windowId: winId,
      });
    }

    const appManifest = messenger.runtime.getManifest();
    const win = await messenger.windows.getCurrent();
    const winId = win.id;
    let onboardUrl = new URL(messenger.runtime.getURL("/options/options.html"));
    let callback;

    switch (details.reason) {
      case "install":
        onboardUrl.hash = "#docs";
        callback = installCallback;
        break;
      case "update":
        onboardUrl.searchParams.set("previousVersion", details.previousVersion)
        callback = updateCallback;
        break;
    }
    OptionsStore.set({ 'last-version': appManifest.version }).then(() => {
      callback(winId, onboardUrl);
    });
  });

// Handle rendering requests from the content script.
// See the comment in markdown-render.js for why we do this.
  messenger.runtime.onMessage.addListener(function(request, sender, responseCallback) {
    // The content script can load in a not-real tab (like the search box), which
    // has an invalid `sender.tab` value. We should just ignore these pages.
    if (typeof (sender.tab) === 'undefined' ||
      typeof (sender.tab.id) === 'undefined' || sender.tab.id < 0) {
      return false;
    }
    if (!request.action && request.popupCloseMode) {
      return false;
    }

    if (request.action === 'render') {
      OptionsStore.getAll()
        .then(prefs => {
          Utils.fetchExtensionFile(`/highlightjs/styles/${prefs["syntax-css"]}`)
            .then(syntaxCSS => {
              responseCallback({
                html: MarkdownRender.markdownRender(
                  request.mdText,
                  prefs,
                  marked,
                  hljs),
                css: (prefs['main-css'] + syntaxCSS)
              })
              return true
            })
        }).catch(e => {
        throw(e)
      })
      return true;
    }
    else if (request.action === 'get-options') {
      OptionsStore.getAll().then(prefs => {
        responseCallback(prefs);
      });
      return true;
    }
    else if (request.action === 'show-toggle-button') {
      if (request.show) {
        messenger.composeAction.enable(sender.tab.id);
        messenger.composeAction.setTitle({
          title: Utils.getMessage('toggle_button_tooltip'),
          tabId: sender.tab.id
        });
        messenger.composeAction.setIcon({
          path: {
            "16": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "19": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "32": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "38": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "64": Utils.getLocalURL('/images/rocmarkdown.svg')
          },
          tabId: sender.tab.id
        });
        return false;
      }
      else {
        messenger.composeAction.disable(sender.tab.id);
        messenger.composeAction.setTitle({
          title: Utils.getMessage('toggle_button_tooltip_disabled'),
          tabId: sender.tab.id
        });
        messenger.composeAction.setIcon({
          path: {
            "16": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "19": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "32": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "38": Utils.getLocalURL('/images/rocmarkdown.svg'),
            "64": Utils.getLocalURL('/images/rocmarkdown.svg')
          },
          tabId: sender.tab.id
        });
        return false;
      }
    }
    else if (request.action === 'open-tab') {
      messenger.tabs.create({
        'url': request.url
      });
      return false;
    }
    else if (request.action === 'get-unrender-markdown-warning') {
      return openNotification(sender.tab.windowId,
        Utils.getMessage('unrendering_modified_markdown_warning'),
        messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
        ["Unrender", "Cancel"]
      );
    }
    else if (request.action === 'test-request') {
      responseCallback('test-request-good');
      return false;
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
    else {
      console.log('unmatched request action', request.action);
      throw 'unmatched request action: ' + request.action;
    }
  })

  // Defining a onDismissed listener
  messenger.notificationbar.onDismissed.addListener((windowId, notificationId) => {
    console.log(`notification ${notificationId} in window ${windowId} was dismissed`);
  })

  // Add the composeAction (the button in the format toolbar) listener.
  messenger.composeAction.onClicked.addListener(tab => {
    return composeRender(tab.id)
  });

  // Mail Extensions are not able to add composeScripts via manifest.json,
  // they must be added via the API.
  await messenger.composeScripts.register({
    "js": [
      { file: "utils.js" },
      { file: "common-logic.js" },
      { file: "jsHtmlToText.js" },
      { file: "marked.js" },
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
    let rv;
    // If this is a plain text message, do not check for markdown-like content
    if (details.isPlainText) {
      return Promise.resolve();
    }
    let forgotToRenderCheckEnabled = await forgotToRenderEnabled();
    if (!forgotToRenderCheckEnabled) {
      return Promise.resolve();
    }

    let isMarkdown = await messenger.tabs.sendMessage(
      tab.id, { action: "check-forgot-render" })
    if (isMarkdown) {
      const message = `${Utils.getMessage("forgot_to_render_prompt_info")}
          ${Utils.getMessage("forgot_to_render_prompt_question")}`;

      rv = await openNotification(tab.windowId,
        message,
        messenger.notificationbar.PRIORITY_CRITICAL_HIGH,
        [
          Utils.getMessage("forgot_to_render_send_button"),
          Utils.getMessage("forgot_to_render_back_button")
        ]
      );
    }
    else {
      rv = "ok";
    }
    if (rv === "ok") {
      return Promise.resolve();
    }
    else {
      return Promise.resolve({ cancel: true })
    }
  });

  async function composeRender(tabId) {
    // Send a message to the compose window to toggle markdown rendering
    let composeDetails = await messenger.compose.getComposeDetails(tabId)
    // Do not try to render plain text emails
    if (composeDetails.isPlainText) {
      return
    }
    messenger.tabs.sendMessage(tabId, { action: 'toggle-markdown', });
  }

  async function openNotification(windowId, message, priority, button_labels) {
    async function notificationClose(notificationId) {
      return new Promise(resolve => {
        let notificationResponse = "cancel";

        // Defining a onClosed listener
        function onClosedListener(closeWinId, closeNotificationId, closedByUser) {
          if (closeNotificationId === notificationId) {
            messenger.notificationbar.onClosed.removeListener(onClosedListener);
            messenger.notificationbar.onButtonClicked.removeListener(onButtonClickListener);
            resolve(notificationResponse);
          }
        }

        function onButtonClickListener(closeWinId, closeNotificationId, buttonId) {
          if (closeNotificationId === notificationId && buttonId) {
            if (["btn-ok"].includes(buttonId)) {
              notificationResponse = "ok";
            }
          }
        }

        messenger.notificationbar.onClosed.addListener(onClosedListener);
        messenger.notificationbar.onButtonClicked.addListener(onButtonClickListener);
      });
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
    });
    return await notificationClose(notificationId);
  }

  function forgotToRenderEnabled() {
    return new Promise(resolve => {
      let rv = false;
      OptionsStore.getAll().then(prefs => {
        rv = prefs["forgot-to-render-check-enabled"];
        resolve(rv);
      });
    });
  }

  // Show the shortcut hotkey on the ComposeAction button
  async function updateActionTooltip() {
    const hotkey = await OptionsStore.get("hotkey-input")
    const msg = messenger.i18n.getMessage("toggle_button_tooltip")
    await messenger.composeAction.setTitle({ title: `${msg}\n${hotkey["hotkey-input"]}` })
  }
  await updateActionTooltip();

})();
