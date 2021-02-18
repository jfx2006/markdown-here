/*
 * Copyright Adam Pritchard 2016
 * MIT License : http://adampritchard.mit-license.org/
 */

"use strict";
/*global chrome:false, OptionsStore:false, MarkdownRender:false,
  marked:false, hljs:false, Utils:false, CommonLogic:false */
/*jshint devel:true, browser:true*/

/*
 * Chrome background script.
 */

// On each load, check if we should show the options/changelist page.
function onLoad() {
  // This timeout is a dirty hack to fix bug #119: "Markdown Here Upgrade
  // Notification every time I open Chrome". That issue on Github for details.
  // https://github.com/adam-p/markdown-here/issues/119
  window.setTimeout(upgradeCheck, 30000);
}

// In the interest of improved browser load performace, call `onLoad` after a tick.
window.addEventListener('load', Utils.nextTickFn(onLoad), false);

function upgradeCheck() {
  OptionsStore.get(function(options) {
    var appManifest = chrome.runtime.getManifest();

    var optionsURL = 'options.html';

    if (typeof(options['last-version']) === 'undefined') {
      // Update our last version. Only when the update is complete will we take
      // the next action, to make sure it doesn't happen every time we start up.
      OptionsStore.set({ 'last-version': appManifest.version }, function() {
        // This is the very first time the extensions has been run, so show the
        // options page.
        chrome.tabs.create({ url: chrome.extension.getURL(optionsURL) });
      });
    }
    else if (options['last-version'] !== appManifest.version) {
      // Update our last version. Only when the update is complete will we take
      // the next action, to make sure it doesn't happen every time we start up.
      OptionsStore.set({ 'last-version': appManifest.version }, function() {
        // The extension has been newly updated
        optionsURL += '?prevVer=' + options['last-version'];

        showUpgradeNotification(chrome.extension.getURL(optionsURL));
      });
    }
  });
}

const actionButton = messenger.composeAction;

// Handle rendering requests from the content script.
// See the comment in markdown-render.js for why we do this.
chrome.runtime.onMessage.addListener(function(request, sender, responseCallback) {
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
  else if (request.action === 'upgrade-notification-shown') {
    clearUpgradeNotification();
    return false;
  }
  else if (request.action === 'get-forgot-to-render-prompt') {
    CommonLogic.getForgotToRenderPromptContent(function(html) {
      responseCallback({html: html});
    });
    return true;
  }
  else if (request.action === 'open-tab') {
    chrome.tabs.create({
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
  chrome.tabs.sendMessage(tab.id, { action: 'button-click', });
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
    {file: "contentscript.js"}
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
            chrome.tabs.sendMessage(win.tabs[0].id, { action: 'hotkey', });
          }
        }

      })
  }
})

/*
Showing an notification after upgrade is complicated by the fact that the
background script can't communicate with "stale" content scripts. (See https://code.google.com/p/chromium/issues/detail?id=168263)
So, content scripts need to be reloaded before they can receive the "show
upgrade notification message". So we're going to keep sending that message from
the background script until a content script acknowledges it.
*/
var showUpgradeNotificationInterval = null;
function showUpgradeNotification(optionsURL) {
  // Get the content of notification element
  CommonLogic.getUpgradeNotification(optionsURL, function(html) {
    var tabGotTheMessage = function(gotIt) {
      // From tabs that haven't been reloaded, this will get called with no arguments.
      if (!gotIt) {
        return;
      }

      // As soon as any content script gets the message, stop trying
      // to send it.
      // NOTE: This could result in under-showing the notification, but that's
      // better than over-showing it (e.g., issue #109).
      if (showUpgradeNotificationInterval !== null) {
        clearInterval(showUpgradeNotificationInterval);
        showUpgradeNotificationInterval = null;
      }
    };

    var askTabsToShowNotification = function() {
      chrome.tabs.query({windowType: 'normal'}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(
            tabs[i].id,
            { action: 'show-upgrade-notification', html: html },
            tabGotTheMessage);
        }
      });
    };

    showUpgradeNotificationInterval = setInterval(askTabsToShowNotification, 5000);
  });
}

function clearUpgradeNotification() {
  if (showUpgradeNotificationInterval !== null) {
    clearInterval(showUpgradeNotificationInterval);
    showUpgradeNotificationInterval = null;
  }

  chrome.tabs.query({windowType: 'normal'}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(
        tabs[i].id,
        { action: 'clear-upgrade-notification' });
    }
  });
}
