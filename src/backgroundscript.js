/*
 * Copyright Adam Pritchard 2016
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict";
/*global messenger:false, OptionsStore:false, MarkdownRender:false,
  marked:false, hljs:false, Utils:false, CommonLogic:false */

/*
 * Chrome background script.
 */

messenger.runtime.onInstalled.addListener(async (details) => {
  if (details.temporary) return; // skip during development

  function updateCallback(winId, url) {
    const message = Utils.getMessage("upgrade_notification_text");
    openNotification(winId,
      message,
      messenger.notificationbar.PRIORITY_INFO_MEDIUM,
      ["Update Notes", "Cancel"]
    ).then(rv => {
      if (rv === "ok") {
        messenger.tabs.create({
          "url": onboardUrl.href,
          windowId: winId,
        });
      }
    });
  }
  function installCallback(winId, url) {
    messenger.tabs.create({
      "url": onboardUrl.href,
      windowId: winId,
    });
  }

  const appManifest = messenger.runtime.getManifest();
  const win = await messenger.windows.getCurrent();
  const winId = win.id;
  let onboardUrl = new URL(messenger.runtime.getURL("/mdh-revival.html"));
  let callback;
  OptionsStore.get(function(options) {
    switch (details.reason) {
      case "install":
        callback = installCallback;
        break;
      case "update":
        if (typeof(options["last-version"] !== "undefined")) {
          onboardUrl.searchParams.set("previousVersion", options["last-version"])
        }
        callback = updateCallback;
        break;
    }
    OptionsStore.set({ 'last-version': appManifest.version }, function() {
      callback(winId, onboardUrl);
    });
  });
});

const actionButton = messenger.composeAction;

// Handle rendering requests from the content script.
// See the comment in markdown-render.js for why we do this.
messenger.runtime.onMessage.addListener(function(request, sender, responseCallback) {
  // The content script can load in a not-real tab (like the search box), which
  // has an invalid `sender.tab` value. We should just ignore these pages.
  if (typeof(sender.tab) === 'undefined' ||
      typeof(sender.tab.id) === 'undefined' || sender.tab.id < 0) {
    return false;
  }
  if (!request.action && request.popupCloseMode) {
    return false;
  }

  if (request.action === 'render') {
    OptionsStore.get(function(prefs) {
      responseCallback({
        html: MarkdownRender.markdownRender(
          request.mdText,
          prefs,
          marked,
          hljs),
        css: (prefs['main-css'] + prefs['syntax-css'])
      });
    });
    return true;
  }
  else if (request.action === 'get-options') {
    OptionsStore.get(function(prefs) { responseCallback(prefs); });
    return true;
  }
  else if (request.action === 'show-toggle-button') {
    if (request.show) {
      actionButton.enable(sender.tab.id);
      actionButton.setTitle({
        title: Utils.getMessage('toggle_button_tooltip'),
        tabId: sender.tab.id });
      actionButton.setIcon({
        path: {
          "16": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "19": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "32": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "38": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "64": Utils.getLocalURL('/images/rocmarkdown.svg')
        },
        tabId: sender.tab.id });
      return false;
    }
    else {
      actionButton.disable(sender.tab.id);
      actionButton.setTitle({
        title: Utils.getMessage('toggle_button_tooltip_disabled'),
        tabId: sender.tab.id });
      actionButton.setIcon({
        path: {
          "16": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "19": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "32": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "38": Utils.getLocalURL('/images/rocmarkdown.svg'),
          "64": Utils.getLocalURL('/images/rocmarkdown.svg')
        },
        tabId: sender.tab.id });
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
  else if (request.action === 'update-hotkey') {
    updateHotKey();
    return false;
  }
  else {
    console.log('unmatched request action', request.action);
    throw 'unmatched request action: ' + request.action;
  }
});

// Defining a onDismissed listener
messenger.notificationbar.onDismissed.addListener((windowId, notificationId) => {
  console.log(`notification ${notificationId} in window ${windowId} was dismissed`);
});


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
    ]
  });
  return await notificationClose(notificationId);
}

// Add the composeAction (the button in the format toolbar) listener.
actionButton.onClicked.addListener(tab => {
  messenger.tabs.sendMessage(tab.id, { action: 'button-click', });
});

// Mail Extensions are not able to add composeScripts via manifest.json,
// they must be added via the API.
messenger.composeScripts.register({
  "js": [
    {file: "utils.js"},
    {file: "common-logic.js"},
    {file: "jsHtmlToText.js"},
    {file: "marked.js"},
    {file: "mdh-html-to-text.js"},
    {file: "markdown-here.js"},
    {file: "composescript.js"}
  ]
});

function updateHotKey() {
  messenger.runtime.getPlatformInfo()
    .then(platinfo => {
      const isMac = (platinfo.os === "mac");
      OptionsStore.get(function(prefs) {
        let hotkey = []
        if (prefs.hotkey.shiftKey) {
          hotkey.push("Shift")
        }
        if (prefs.hotkey.ctrlKey) {
          if (isMac) {
            hotkey.push("MacCtrl")
          }
          else {
            hotkey.push("Ctrl")
          }
        }
        if (prefs.hotkey.altKey) {
          hotkey.push("Alt")
        }
        hotkey.push(prefs.hotkey.key)
        messenger.commands.update({
          "name": "toggle-markdown",
          "shortcut": hotkey.join("+"),
        });
      });
    });
}
messenger.commands.onCommand.addListener(function(command) {
  if (command === "toggle-markdown") {
    messenger.windows.getAll({populate: true, windowTypes: ["messageCompose"]})
      .then(wins => {
        for (const win of wins) {
          if (win.focused) {
            messenger.tabs.sendMessage(win.tabs[0].id, { action: 'hotkey', });
          }
        }

      })
  }
})

function forgotToRenderEnabled() {
  return new Promise(resolve => {
    let rv = false;
    OptionsStore.get(function(prefs) {
      rv = prefs["forgot-to-render-check-enabled"];
      resolve(rv);
    });
  });
}

messenger.compose.onBeforeSend.addListener(async function(tab) {
  let rv;
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
  } else {
    rv = "ok";
  }
  if (rv === "ok") {
    return Promise.resolve();
  } else {
    return Promise.resolve({cancel: true})
  }
});
