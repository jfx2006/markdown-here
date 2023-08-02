/*eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }]*/

'use strict';

var { EventEmitter, EventManager, ExtensionAPI } = ExtensionCommon;
var { ExtensionError } = ExtensionUtils;
var Services = globalThis.Services || ChromeUtils.import(
  'resource://gre/modules/Services.jsm'
).Services;

class ExtensionNotification {
  constructor(notificationId, properties, parent) {
    this.closedByUser = true;
    this.properties = properties;
    this.parent = parent;
    this.notificationId = notificationId;
    this.tbVersion = this.getThunderbirdVersion().major;

    const { buttons, icon, label, priority, style, windowId } = properties;

    const iconURL =
      icon && !icon.includes(':')
        ? parent.extension.baseURI.resolve(icon)
        : null;

    const buttonSet = buttons.map(({ id, label, accesskey }) => ({
      id,
      label,
      accesskey,
      callback: () => {
        // Fire the event and keep the notification open, decided to close it
        // based on the return values later.
        this.parent.emitter
          .emit('buttonclicked', windowId, notificationId, id)
          .then((rv) => {
            let keepOpen = rv.some((value) => value?.close === false);
            if (!keepOpen) {
              this.remove(/* closedByUser */ true);
            }
          });

        // Keep the notification box open until we hear from the event
        // handlers.
        return true;
      },
    }));

    const getContainerElement = (element) => {
      // Supernova introduced a container element in TB112.
      if (this.tbVersion >= 112) {
        return element.shadowRoot.querySelector(".container");
      }
      return null;
    }

    const notificationBarCallback = (event) => {
      // Every dismissed notification will also generate a removed notification
      if (event === 'dismissed') {
        this.parent.emitter.emit('dismissed', windowId, notificationId);
      }

      if (event === 'removed') {
        this.parent.emitter.emit(
          'closed',
          windowId,
          notificationId,
          this.closedByUser
        );

        this.cleanup();
      }
    };

    let element;
    if (this.tbVersion < 94) {
      element = this.getNotificationBox().appendNotification(
        label,
        `extension-notification-${notificationId}`,
        iconURL,
        priority,
        buttonSet,
        notificationBarCallback
      );
    } else {
      element = this.getNotificationBox().appendNotification(
        `extension-notification-${notificationId}`,
        {
          label,
          image: iconURL,
          priority,
          eventCallback: notificationBarCallback,
        },
        buttonSet,
      );
    }

    if (!element)
      return;

    const allowedCssPropNames = [
      'background',
      'color',
      'margin',
      'padding',
      'font',
    ];

    if (style) {
      const sanitizedStyles = Object.keys(style).filter((cssPropertyName) => {
        const parts = cssPropertyName.split('-');
        return (
          // check if first part is in whitelist
          parts.length > 0 &&
          allowedCssPropNames.includes(parts[0]) &&
          // validate second part (if any) being a simple word
          (parts.length == 1 ||
            (parts.length == 2 && /^[a-zA-Z0-9]+$/.test(parts[1])))
        );
      });

      let containerElement = getContainerElement(element);
      for (let cssPropertyName of sanitizedStyles) {
        element.style[cssPropertyName] = style[cssPropertyName];
        if (containerElement) {
          containerElement.style[cssPropertyName] = style[cssPropertyName];
        }
      }
      if (containerElement && this.properties.icon) {
        containerElement.querySelector("span.icon").style.display = "none"; // because Supernova will display the default (i) icon
      }
    }
  }

  getThunderbirdVersion() {
    let [major, minor, revision = 0] = Services.appinfo.version
      .split('.')
      .map((chunk) => parseInt(chunk, 10));
    return {
      major,
      minor,
      revision,
    };
  }

  getNotificationBoxPreSupernova() {
    const w = this.parent.extension.windowManager.get(
      this.properties.windowId,
      this.parent.context
    ).window;
    switch (this.properties.placement) {
      case 'top':
        if (!w.gExtensionNotificationTopBox) {
          // try to add it before the toolbox, if that fails add it firstmost
          const toolbox = w.document.querySelector('toolbox');
          if (toolbox) {
            w.gExtensionNotificationTopBox = new w.MozElements.NotificationBox(
              (element) => {
                element.id = 'extension-notification-top-box';
                element.setAttribute('notificationside', 'top');
                toolbox.parentElement.insertBefore(
                  element,
                  toolbox.nextElementSibling
                );
              }
            );
          } else {
            w.gExtensionNotificationTopBox = new w.MozElements.NotificationBox(
              (element) => {
                element.id = 'extension-notification-top-box';
                element.setAttribute('notificationside', 'top');
                w.document.documentElement.insertBefore(
                  element,
                  w.document.documentElement.firstChild
                );
              }
            );
          }
        }
        return w.gExtensionNotificationTopBox;
        break;

      case 'message':
        // below the receipient list in the message preview window
        if (w.gMessageNotificationBar) {
          return w.gMessageNotificationBar.msgNotificationBar;
        }
      // break omitted

      default:
      case 'bottom':
        // default bottom notification in the mail3:pane
        if (w.specialTabs) {
          return w.specialTabs.msgNotificationBar;
        }
        // default bottom notification in message composer window and
        // most calendar dialogs (currently windows.onCreated event does not see these)
        if (w.gNotification) {
          return w.gNotification.notificationbox;
        }
        // if there is no default bottom box, use our own
        if (!w.gExtensionNotificationBottomBox) {
          let statusbar = w.document.querySelector('[class~="statusbar"]');
          w.gExtensionNotificationBottomBox = new w.MozElements.NotificationBox(
            (element) => {
              element.id = 'extension-notification-bottom-box';
              element.setAttribute('notificationside', 'bottom');
              if (statusbar) {
                statusbar.parentNode.insertBefore(element, statusbar);
              } else {
                w.document.documentElement.append(element);
              }
            }
          );
        }
        return w.gExtensionNotificationBottomBox;
        break;
    }
  }

  getNotificationBoxPostSupernova() {
    const w = this.parent.extension.windowManager.get(
      this.properties.windowId,
      this.parent.context
    ).window;
    switch (this.properties.placement) {
      case 'top':
        if (!w.gExtensionNotificationTopBox) {
          const messengerBody = w.document.getElementById('messengerBody');
          const toolbox = w.document.querySelector('toolbox');
          if (messengerBody) {
            w.gExtensionNotificationTopBox = new w.MozElements.NotificationBox(
              (element) => {
                element.id = 'extension-notification-top-box';
                element.setAttribute('notificationside', 'top');
                messengerBody.insertBefore(
                  element,
                  messengerBody.firstChild
                );
              }
            );
          } else if (toolbox) {
            w.gExtensionNotificationTopBox = new w.MozElements.NotificationBox(
              (element) => {
                element.id = 'extension-notification-top-box';
                element.setAttribute('notificationside', 'top');
                element.style.marginInlineStart = "var(--spaces-total-width)";
                toolbox.insertAdjacentElement(
                  'afterend', element
                );
              }
            );
          } else {
            w.gExtensionNotificationTopBox = new w.MozElements.NotificationBox(
              (element) => {
                element.id = 'extension-notification-top-box';
                element.setAttribute('notificationside', 'top');
                w.document.documentElement.insertBefore(
                  element,
                  w.document.documentElement.firstChild
                );
              }
            );
          }
        }
        return w.gExtensionNotificationTopBox;
        break;

      case 'message':
        if (!this.properties.tabId) {
          throw new Error("appendNotification - missing tab id");
        }
        const aTab = this.parent.context.extension.tabManager.get(this.properties.tabId);
        let messageBrowser = null;
        switch (aTab.nativeTab.mode?.name) {
          case "mailMessageTab":
            // message tab;
            messageBrowser = aTab.nativeTab.chromeBrowser.contentWindow;
            break;
          case "mail3PaneTab":
            // message in mail3pane tab
            messageBrowser = aTab.nativeTab.chromeBrowser.contentWindow.messageBrowser.contentWindow;
            break;
          default:
            // message window;
            messageBrowser = aTab.nativeTab.messageBrowser.contentWindow;
            break;
        }
        if (messageBrowser) {
          return messageBrowser.gMessageNotificationBar.msgNotificationBar;
        }
        console.error("appendNotification - could not get window for tabId " + this.properties.tabId);
        return null;
        break;

      default:
      case 'bottom':
        return this.getNotificationBoxPreSupernova();
        break;
    }
  }

  getNotificationBox() {
    if (this.tbVersion >= 112) {
      return this.getNotificationBoxPostSupernova();
    }
    return this.getNotificationBoxPreSupernova();
  }

  remove(closedByUser) {
    // The remove() method is called by button clicks and by notificationBox.clear()
    // but not by dismissal. In that case, the default value defined in the constructor
    // defines the value of closedByUser which is used by the event emitter.
    this.closedByUser = closedByUser;
    const notificationBox = this.getNotificationBox();
    const notification = notificationBox.getNotificationWithValue(
      `extension-notification-${this.notificationId}`
    );
    notificationBox.removeNotification(notification);
  }

  cleanup() {
    this.parent.notificationsMap.delete(this.notificationId);
  }
}

var notificationbar = class extends ExtensionAPI {
  constructor(extension) {
    super(extension);
    this.notificationsMap = new Map();
    this.emitter = new EventEmitter();
    this.nextId = 1;
    Services.obs.addObserver(this, 'domwindowclosed');
  }

  onShutdown() {
    Services.obs.removeObserver(this, 'domwindowclosed');
    for (let notification of this.notificationsMap.values()) {
      notification.remove(/* closedByUser */ false);
    }
  }

  // Observer for the domwindowclosed notification, to remove
  // obsolete notifications from the notificationsMap.
  observe(aSubject, aTopic, aData) {
    let win = this.context.extension.windowManager.convert(aSubject);
    this.notificationsMap.forEach((value, key) => {
      if (value.properties.windowId == win.id) {
        this.notificationsMap.delete(key);
      }
    });
  }

  getAPI(context) {
    this.context = context;
    const self = this;

    return {
      notificationbar: {
        async create(properties) {
          const notificationId = self.nextId++;
          self.notificationsMap.set(
            notificationId,
            new ExtensionNotification(notificationId, properties, self)
          );
          return notificationId;
        },

        async clear(notificationId) {
          if (self.notificationsMap.has(notificationId)) {
            self.notificationsMap
              .get(notificationId)
              .remove(/* closedByUser */ false);
            return true;
          }
          return false;
        },

        async getAll() {
          const result = {};
          self.notificationsMap.forEach((value, key) => {
            result[key] = value.properties;
          });
          return result;
        },

        onDismissed: new EventManager({
          context,
          name: 'notificationbar.onDismissed',
          register: (fire) => {
            const listener = (event, windowId, notificationId) =>
              fire.async(windowId, notificationId);

            self.emitter.on('dismissed', listener);
            return () => {
              self.emitter.off('dismissed', listener);
            };
          },
        }).api(),

        onClosed: new EventManager({
          context,
          name: 'notificationbar.onClosed',
          register: (fire) => {
            const listener = (event, windowId, notificationId, closedByUser) =>
              fire.async(windowId, notificationId, closedByUser);

            self.emitter.on('closed', listener);
            return () => {
              self.emitter.off('closed', listener);
            };
          },
        }).api(),

        onButtonClicked: new EventManager({
          context,
          name: 'notificationbar.onButtonClicked',
          register: (fire) => {
            const listener = (event, windowId, notificationId, buttonId) =>
              fire.async(windowId, notificationId, buttonId);

            self.emitter.on('buttonclicked', listener);
            return () => {
              self.emitter.off('buttonclicked', listener);
            };
          },
        }).api(),
      },
    };
  }
};
