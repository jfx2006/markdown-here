// This Source Code Form is subject to the terms of the Mozilla Public
// license, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

interface EvListener<T extends Function> {
  addListener: (callback: T) => void;
  removeListener: (listener: T) => void;
  hasListener: (listener: T) => boolean;
}

type Listener<T> = EvListener<(arg: T) => void>;

declare namespace browser.accounts {
  type MailAccount = {
    folders: browser.folders.MailFolder[];
    id: string;
    name: string;
    type: string; // e.g. imap, nntp, or pop3.
  };

  function list(): Promise<MailAccount[]>;
  function get(accountId: string): Promise<MailAccount>;
}

declare namespace browser.addressBooks {
  type AddressBookNode = {
    id: string;
    name: string;
    type: NodeType;
    contacts?: browser.contacts.ContactNode[];
    mailingLists?: browser.mailingLists.MailingListNode[];
    parentId?: string;
    readOnly?: boolean;
  };

  type NodeType =
    | "addressBook"
    | "contact"
    | "mailingList";

  type AddressBookProperties = { name: string, [key: string]: string };

  function openUI(): Promise<void>;
  function closeUI(): Promise<void>;
  function list(complete?: boolean): Promise<AddressBookNode[]>;
  function get(id: string, complete?: boolean): Promise<AddressBookNode>;
  function create(properties: AddressBookProperties): Promise<string>;
  function update(id: string, properties: AddressBookProperties): Promise<void>;
  // function delete(id: string): Promise<void>; // FIXME: reverved "delete".

  const onCreated: Listener<AddressBookNode>;
  const onUpdated: Listener<AddressBookNode>;
  const onDeleted: Listener<string>;
}

declare namespace browser.browserAction {
  type ColorArray = [number, number, number, number];

  type Details = {
    tabId?: number;
    windowId?: number;
  };

  type ImageDataType = ImageData;

  type OnClickData = {
    modifiers: ModfierType[];
    button?: number;
  }; // NOTE: Added in Thunderbird 74.0b2

  type ModfierType = "Shift" | "Alt" | "Command" | "Ctrl" | "MacCtrl";

  function setTitle(details: { title: string | null }): Promise<void>;
  function getTitle(details: Details): Promise<string>;
  function setIcon(details: {
    imageData?: ImageDataType | object;
    path?: string | object;
  }): Promise<void>;
  function setPopup(details: { popup: string | null }): Promise<void>;
  function getPopup(details: Details): Promise<string>;
  function setBadgeText(details: { text: string }): Promise<void>;
  function getBadgeText(details: Details): Promise<string>;
  function setBadgeBackgroundColor(details: {
    color: string | ColorArray | null
  }): Promise<void>;
  function getBadgeBackgroundColor(details: Details): Promise<ColorArray>;
  function enable(tabId?: number): Promise<void>;
  function disable(tabId?: number): Promise<void>;
  function isEnabled(details: Details): Promise<boolean>;
  function openPopup(): Promise<void>;

  const onClicked: EvListener<(
    tab: browser.tabs.Tab, // NOTE: Added in Thunderbird 74.0b2
    info?: OnClickData // NOTE: Added in Thunderbird 74.0b2
  ) => void>;
}

declare namespace browser.cloudFile {
  type CloudFile = {
    data: ArrayBuffer | File;
    id: number;
    name: string;
  };

  type CloudFileAccount = {
    configured: boolean;
    id: string;
    managementUrl: string;
    name: string;
    spaceRemaining?: number;
    spaceUsed?: number;
    uploadSizeLimit?: number;
  };

  function getAccount(accountId: string): Promise<CloudFileAccount>;
  function getAllAccounts(): Promise<CloudFileAccount[]>;
  function updateAccount(accountId: string, updateProperties: {
    configured?: boolean;
    managementUrl?: string;
    spaceRemaining?: number;
    spaceUsed?: number;
    uploadSizeLimit?: number;
  }): Promise<CloudFileAccount>;

  const onFileUpload: EvListener<(account: CloudFileAccount, fileInfo: CloudFile) => void>;
  const onFileUploadAbort: EvListener<(account: CloudFileAccount, fileId: number) => void>;
  const onFileDeleted: EvListener<(account: CloudFileAccount, fileId: number) => void>;
  const onAccountAdded: EvListener<(account: CloudFileAccount) => void>;
  const onAccountDeleted: EvListener<(accountId: string) => void>;
}

declare namespace browser.commands {
  type Command = {
    name?: string;
    description?: string;
    shortcut?: string;
  };

  function update(detail: {
    name: string;
    description?: string;
    shortcut?: string;
  }): Promise<void>;

  function reset(name: string): Promise<void>;
  function getAll(): Promise<Command[]>;

  const onCommand: Listener<string>;
}

declare namespace browser.compose {
  type ComposeDetails = {
    bcc: ComposeRecipientList;
    body: string;
    cc: ComposeRecipientList;
    followupTo: ComposeRecipientList; // NOTE: Added in Thunderbird 74
    isPlainText: boolean; // NOTE: Added in Thunderbird 75
    newsgroups: string | string[]; // NOTE: Added in Thunderbird 74
    plainTextBody: string; // NOTE: Added in Thunderbird 75
    replyTo: ComposeRecipientList;
    subject: string;
    to: ComposeRecipientList;
  };

  type ComposeRecipient = string | { id: string; type: "contact" | "mailingList"; };

  type ComposeRecipientList = string | ComposeRecipient[]; // NOTE: Added in Thunderbird 74

  function beginNew(details?: ComposeDetails): Promise<void>;
  function beginReply(messageId?: number, replyType?: "replyToSender" | "replyToList" | "replyToAll"): Promise<void>;
  function beginForward(messageId?: number, forwardType?: "forwardInline" | "forwardAsAttachment", details?: ComposeDetails): Promise<void>;
  function getComposeDetails(tabId: number): Promise<ComposeDetails>; // NOTE: Added in Thunderbird 74
  function setComposeDetails(tabId: number, details: ComposeDetails): Promise<void>; // NOTE: Added in Thunderbird 74

  const onBeforeSend: EvListener<(
    tab: browser.tabs.Tab, // NOTE: Added in Thunderbird 74.0b2
    details: ComposeDetails
  ) => {
    cancel?: boolean;
    details?: ComposeDetails;
  } | Promise<{
    cancel?: boolean;
    details?: ComposeDetails;
  }>>; // NOTE: Added in Thunderbird 74
}

declare namespace browser.composeAction {
  type ColorArray = [number, number, number, number];

  type Details = {
    tabId?: number;
    windowId?: number;
  };

  type ImageDataType = ImageData;

  type OnClickData = {
    modifiers: ModfierType[];
    button?: number;
  }; // NOTE: Added in Thunderbird 74.0b2

  type ModfierType = "Shift" | "Alt" | "Command" | "Ctrl" | "MacCtrl";

  function setTitle(details: { title: string | null }): Promise<void>;
  function getTitle(details: Details): Promise<string>;
  function setIcon(details: {
    imageData?: ImageDataType | object;
    path?: string | object;
  }): Promise<void>;
  function setPopup(details: { popup: string | null }): Promise<void>;
  function getPopup(details: Details): Promise<string>;
  function setBadgeText(details: { text: string }): Promise<void>;
  function getBadgeText(details: Details): Promise<string>;
  function setBadgeBackgroundColor(details: {
    color: string | ColorArray | null
  }): Promise<void>;
  function getBadgeBackgroundColor(details: Details): Promise<ColorArray>;
  function enable(tabId?: number): Promise<void>;
  function disable(tabId?: number): Promise<void>;
  function isEnabled(details: Details): Promise<boolean>;
  function openPopup(): Promise<void>;

  const onClicked: EvListener<(
    tab: browser.tabs.Tab, // NOTE: Added in Thunderbird 74.0b2
    info?: OnClickData // NOTE: Added in Thunderbird 74.0b2
  ) => void>;
}

declare namespace browser.contacts {
  type ContactNode = {
    id: string;
    properties: ContactProperties;
    type: browser.addressBooks.NodeType;
    parentId?: string;
    readOnly?: boolean;
  };

  type ContactProperties = object[]; // e.g. [{ PreferDisplayName?: string PreferMailFormat?: string, PrimaryEmail?: string, ... }, ... ]

  function list(parentId: string): Promise<ContactNode[]>;
  function quickSearch(parentId: string, searchString: string): Promise<ContactNode[]>;
  function quickSearch(searchString: string): Promise<ContactNode[]>;
  function get(id: string): Promise<ContactNode>;
  function create(parentId: string, id: string | null, properties: ContactProperties): Promise<string>;
  function create(parentId: string, properties: ContactProperties): Promise<string>;
  function update(id: string, properties: ContactProperties): Promise<void>;
  // function delete(id: string): Promise<void>; // FIXME: reverved "delete".

  const onCreated: EvListener<(node: ContactNode, id: string) => void>;
  const onUpdated: EvListener<(node: ContactNode) => void>;
  const onDeleted: EvListener<(parentId: string, id: string) => void>;
}

declare namespace browser.folders {
  type MailFolder = {
    accountId: string;
    path: string;
    name?: string;
    subFolders?: MailFolder[]; // NOTE: Added in Thunderbird 74
    type?:
      | "inbox"
      | "drafts"
      | "sent"
      | "trash"
      | "templates"
      | "archives"
      | "junk"
      | "outbox";
  };

  function create(parentFolder: MailFolder, childName: string): Promise<void>;
  function rename(folder: MailFolder, newName: string): Promise<void>;
  // function delete(folder: MailFolder): Promise<void>; // FIXME: reverved "delete".
}

// NOTE: can't declare types
// declare namespace browser.legacy { }

declare namespace browser.mailingLists {
  type MailingListNode = {
    description: string;
    id: string;
    name: string;
    nickName: string;
    type: browser.addressBooks.NodeType;
    contacts?: browser.contacts.ContactNode[];
    parentId?: string;
    readOnly?: boolean;
  };

  function list(parentId: string): Promise<MailingListNode[]>;
  function get(id: string): Promise<MailingListNode>;

  function create(parentId: string, properties: {
    name: string;
    description?: string;
    nickName?: string;
  }): Promise<string>;

  function update(id: string, properties: {
    name: string;
    description?: string;
    nickName?: string;
  }): Promise<void>;

  // function delete(id: string): Promise<void>; // FIXME: reverved "delete".
  function addMember(id: string, contactId: string): Promise<void>;
  function listMembers(id: string): Promise<browser.contacts.ContactNode[]>;
  function removeMember(id: string, contactId: string): Promise<void>;

  const onCreated: Listener<MailingListNode>;
  const onUpdated: Listener<MailingListNode>;
  const onDeleted: EvListener<(parentId: string, id: string) => void>;
  const onMemberAdded: Listener<MailingListNode>;
  const onMemberRemoved: EvListener<(parentId: string, id: string) => void>;
}

declare namespace browser.mailTabs {
  type MailTab = {
    active: boolean;
    displayedFolder: browser.folders.MailFolder;
    folderPaneVisible: boolean;
    id: number;
    layout: "standard" | "wide" | "vertical";
    messagePaneVisible: boolean;
    sortOrder: "none" | "ascending" | "descending";
    sortType:
      | "none"
      | "date"
      | "subject"
      | "author"
      | "id"
      | "thread"
      | "priority"
      | "status"
      | "size"
      | "flagged"
      | "unread"
      | "recipient"
      | "location"
      | "tags"
      | "junkStatus"
      | "attachments"
      | "account"
      | "custom"
      | "received"
      | "correspondent";
    windowId: number;
  };

  type QuickFilterTextDetail = {
    text: string;
    author?: boolean;
    body?: boolean;
    recipients?: boolean;
    subject?: boolean;
  };

  function query(queryInfo: {
    active?: boolean;
    currentWindow?: boolean;
    lastFocusedWindow?: boolean;
    windowId?: number;
  }): Promise<MailTab[]>;

  function update(tabId: number, updateProperties: {
    displayedFolder?: browser.folders.MailFolder;
    folderPaneVisible?: boolean;
    layout?: "standard" | "wide" | "vertical";
    messagePaneVisible?: boolean;
    sortOrder?:  "none" | "ascending" | "descending";
    sortType?:
      | "none"
      | "date"
      | "subject"
      | "author"
      | "id"
      | "thread"
      | "priority"
      | "status"
      | "size"
      | "flagged"
      | "unread"
      | "recipient"
      | "location"
      | "tags"
      | "junkStatus"
      | "attachments"
      | "account"
      | "custom"
      | "received"
      | "correspondent";
  }): Promise<void>;

  function update(updateProperties: {
    displayedFolder?: browser.folders.MailFolder;
    folderPaneVisible?: boolean;
    layout?: "standard" | "wide" | "vertical";
    messagePaneVisible?: boolean;
    sortOrder?:  "none" | "ascending" | "descending";
    sortType?:
      | "none"
      | "date"
      | "subject"
      | "author"
      | "id"
      | "thread"
      | "priority"
      | "status"
      | "size"
      | "flagged"
      | "unread"
      | "recipient"
      | "location"
      | "tags"
      | "junkStatus"
      | "attachments"
      | "account"
      | "custom"
      | "received"
      | "correspondent";
  }): Promise<void>;

  function getSelectedMessages(
    tabId?: number
  ): Promise<browser.messages.MessageList>;

  function setQuickFilter(tabId: number, properties: {
    attachment?: boolean;
    contact?: boolean;
    flagged?: boolean;
    show?: boolean;
    tags?: boolean;
    text?: browser.mailTabs.QuickFilterTextDetail;
    unread?: boolean;
  }): Promise<void>;

  function setQuickFilter(properties: {
    attachment?: boolean;
    contact?: boolean;
    flagged?: boolean;
    show?: boolean;
    tags?: boolean;
    text?: browser.mailTabs.QuickFilterTextDetail;
    unread?: boolean;
  }): Promise<void>;

  const onDisplayedFolderChanged: EvListener<() => void>
  const onSelectedMessagesChanged: EvListener<() => void>
}

declare namespace browser.menus {
  const ACTION_MENU_TOP_LEVEL_LIMIT: number;

  type ContextType =
    | "all"
    | "page"
    | "frame"
    | "selection"
    | "link"
    | "editable"
    | "password"
    | "image"
    | "video"
    | "audio"
    | "browser_action"
    | "tab"
    | "message_list"
    | "folder_pane";

  type ItemType = "normal" | "checkbox" | "radio" | "separator";

  type OnClickData = {
    editable: boolean;
    menuItemId: number | string;
    modifiers: ModfierType[];
    button?: number;
    checked?: boolean;
    displayedFolder?: browser.folders.MailFolder;
    frameId?: number;
    frameUrl?: string;
    linkText?: string;
    linkUrl?: string;
    mediaType?: string;
    pageUrl?: string;
    parentMenuItemId?: number | string;
    selectedFolder?: browser.folders.MailFolder;
    selectedMessages?: browser.messages.MessageList;
    selectionText?: string;
    srcUrl?: string;
    targetElementId?: number;
    viewType?: browser.extension.ViewType;
    wasChecked?: boolean;
  };

  type ModfierType = "Shift" | "Alt" | "Command" | "Ctrl" | "MacCtrl";

  function create(
    createProperties: {
      checked?: boolean;
      command?:
        | "_execute_browser_action";
        // | "_execute_page_action" unsupported
        // | "_execute_sidebar_action" unsupported
      contexts?: ContextType[];
      documentUrlPatterns?: string[];
      enabled?: boolean;
      icons?: object;
      id?: string;
      onclick?: (info: OnClickData, tab: browser.tabs.Tab) => void;
      parentId?: number | string;
      targetUrlPatterns?: string[];
      title?: string;
      type?: ItemType;
      viewTypes?: browser.extension.ViewType[];
      visible?: boolean;
    },
    callback?: () => void
  ): Promise<number | string>;

  function update(
    id: number | string,
    updateProperties: {
      checked?: boolean;
      contexts?: ContextType[];
      documentUrlPatterns?: string[];
      enabled?: boolean;
      icons?: object;
      onclick?: (info: OnClickData, tab: browser.tabs.Tab) => void;
      parentId?: number | string;
      targetUrlPatterns?: string[];
      title?: string;
      type?: ItemType;
      viewTypes?: browser.extension.ViewType[];
      visible?: boolean;
    }
  ): Promise<void>;

  function remove(menuItemId: number | string): Promise<void>;

  function removeAll(): Promise<void>;

  function overrideContext(
    contextOptions: {
      contenxt?: "tab";
      showDefaults?: boolean;
      tabId?: number;
    }
  ): Promise<void>;

  function refresh(): Promise<void>;

  const onClicked: EvListener<(info: OnClickData, tab?: browser.tabs.Tab) => void>;
  const onShown: EvListener<(info: OnClickData, tab: browser.tabs.Tab) => void>;
  const onHidden: EvListener<() => void>;
}

declare namespace browser.messageDisplay {
  function getDisplayedMessage(tabId: number): Promise<browser.messages.MessageHeader>;

  const onMessageDisplayed: EvListener<(
    tabId: number,
    message: browser.messages.MessageHeader
  ) => void>;
}

declare namespace browser.messageDisplayAction {
  type ColorArray = [number, number, number, number];

  type Details = {
    tabId?: number;
    windowId?: number;
  };

  type ImageDataType = ImageData;

  type OnClickData = {
    modifiers: ModfierType[];
    button?: number;
  }; // NOTE: Added in Thunderbird 74.0b2

  type ModfierType = "Shift" | "Alt" | "Command" | "Ctrl" | "MacCtrl";

  function setTitle(details: { title: string | null }): Promise<void>;
  function getTitle(details: Details): Promise<string>;
  function setIcon(details: {
    imageData?: ImageDataType | object;
    path?: string | object;
  }): Promise<void>;
  function setPopup(details: { popup: string | null }): Promise<void>;
  function getPopup(details: Details): Promise<string>;
  function setBadgeText(details: { text: string }): Promise<void>;
  function getBadgeText(details: Details): Promise<string>;
  function setBadgeBackgroundColor(details: {
    color: string | ColorArray | null
  }): Promise<void>;
  function getBadgeBackgroundColor(details: Details): Promise<ColorArray>;
  function enable(tabId?: number): Promise<void>;
  function disable(tabId?: number): Promise<void>;
  function isEnabled(details: Details): Promise<boolean>;
  function openPopup(): Promise<void>;

  const onClicked: EvListener<(
    tab: browser.tabs.Tab, // NOTE: Added in Thunderbird 74.0b2
    info?: OnClickData // NOTE: Added in Thunderbird 74.0b2
  ) => void>;
}

declare namespace browser.messages {
  type MessageHeader = {
    author: string;
    bccList: string[];
    ccList: string[];
    date: Date;
    flagged: boolean;
    folder: browser.folders.MailFolder;
    id: number;
    junk: boolean; // NOTE: Added in Thunderbird 74
    junkScore: number; // NOTE: Added in Thunderbird 74
    read: boolean;
    recipients: string[];
    subject: string;
    tags: string[];
  };

  type MessageList = {
    id: string;
    messages: MessageHeader[];
  };

  type MessagePart = {
    body: string;
    contentType: string;
    headers: object;
    name: string;
    partName: string;
    parts: MessagePart[];
    size: number;
  };

  type MessageTag = {
    color: string;
    key: string;
    ordinal: string;
    tag: string;
  };

  type TagsDetail = {
    mode: "all" | "any";
    tags: object;
  };

  function list(folder: browser.folders.MailFolder): Promise<MessageList>;
  function continueList(messageListId: string): Promise<MessageList>;
  function get(messageId: number): Promise<MessageHeader>;
  function getFull(messageId: number): Promise<MessagePart>;
  function getRaw(messageId: number): Promise<string>;

  function query(queryInfo: {
    author?: string;
    body?: string;
    flagged?: boolean;
    folder?: browser.folders.MailFolder;
    fromDate?: Date;
    fromMe?: boolean;
    fullText?: string;
    recipients?: string;
    subject?: string;
    tags?: TagsDetail;
    toDate?: Date;
    toMe?: boolean;
    unread?: boolean;
  }): Promise<MessageList>;

  function update(messageId: number, newProperties: {
    flagged?: boolean;
    junk?: boolean;
    read?: boolean;
    tags?: string[]; // NOTE: Added in Thunderbird 74
  }): Promise<void>;

  function move(messageIds: number[], destination: browser.folders.MailFolder): Promise<void>;
  function copy(messageIds: number[], destination: browser.folders.MailFolder): Promise<void>;
  // function delete(messageIds: number[], skipTrash?: boolean): Promise<void>; // FIXME: reverved "delete".
  function archive(messageIds: number[]): Promise<void>;
  function listTags(): Promise<MessageTag[]>;

  const onNewMailReceived: EvListener<(folder: browser.folders.MailFolder, messages: MessageList) => void>; // NOTE: Added in Thunderbird 75
}

declare namespace browser.tabs {
  const TAB_ID_NONE: number;

  type Tab = {
    active: boolean;
    highlighted: boolean;
    index: number;
    selected: boolean;
    favIconUrl?: string;
    height?: number;
    id?: number;
    mailTab?: boolean;
    status?: string;
    title?: string;
    url?: string;
    width?: number;
    windowId: number;
  };

  type TabStatus = "loading" | "complete";

  type UpdateFilter = {
    properties?: UpdatePropertyName[];
    tabId?: number;
    urls?: string[];
    windowId?: number;
  };

  type UpdatePropertyName =
    | "favIconUrl"
    | "status"
    | "title";

  type WindowType = "normal" | "popup" | "panel" | "app" | "devtools";

  function get(tabId: number): Promise<Tab>;
  function getCurrent(): Promise<Tab>;
  function create(createProperties: {
    active?: boolean;
    index?: number;
    // selected: boolean; // WARNING: Deprecated.
    url?: string;
    windowId?: number;
  }): Promise<Tab>;

  function duplicate(tabId: number): Promise<Tab>;

  function query(queryInfo: {
    active?: boolean;
    currentWindow?: boolean;
    highlighted?: boolean;
    index?: number;
    lastFocusedWindow?: boolean;
    mailTab?: boolean;
    status?: TabStatus;
    title?: string;
    url?: string | string[];
    windowId?: number;
    windowType?: WindowType;
  }): Promise<Tab[]>;

  function update(tabId: number, updateProperties: {
    active?: boolean;
    url?: string;
  }): Promise<Tab>;

  function update(updateProperties: {
    active?: boolean;
    url?: string;
  }): Promise<Tab>;

  function move(tabIds: number | number[], moveProperties: {
      windowId?: number;
      index: number;
  }): Promise<Tab | Tab[]>;

  function reload(tabId?: number, reloadProperties?: {
    bypassCache?: boolean
  }): Promise<void>;

  function remove(tabIds: number | number[]): Promise<void>;

  function executeScript(
    tabId: number,
    details: browser.extensionTypes.InjectDetails
  ): Promise<object[]>;

  function executeScript(
    details: browser.extensionTypes.InjectDetails
  ): Promise<object[]>;

  function insertCSS(
    tabId: number,
    details: browser.extensionTypes.InjectDetailsCSS
  ): Promise<void>;

  function insertCSS(
    details: browser.extensionTypes.InjectDetailsCSS
  ): Promise<void>;

  function removeCSS(
    tabId: number,
    details: browser.extensionTypes.InjectDetails
  ): Promise<void>;

  function removeCSS(
    details: browser.extensionTypes.InjectDetails
  ): Promise<void>;

  const onCreated: Listener<Tab>;

  const onUpdated: EvListener<(
    tabId: number,
    changeInfo: {
      favIconUrl?: string;
      status?: string;
      url?: string;
    },
    tab: Tab
  ) => void>;

  const onMoved: EvListener<(
    tabId: number,
    moveInfo: {
        fromIndex: number;
        toIndex: number;
        windowId: number;
    }
  ) => void>;

  const onActivated: Listener<{ tabId: number; windowId: number }>;

  const onDetached: EvListener<(
    tabId: number,
    detachInfo: {
      oldPosition: number;
      oldWindowId: number;
    }
  ) => void>;

  const onAttached: EvListener<(
    tabId: number,
    attachInfo: {
      newPosition: number;
      newWindowId: number;
    }
  ) => void>;

  const onRemoved: EvListener<(
    tabId: number,
    removeInfo: {
      isWindowClosing: boolean;
      windowId: number;
    }
  ) => void>;
}

declare namespace browser.windows {
  const WINDOW_ID_NONE: number;
  const WINDOW_ID_CURRENT: number;

  type CreateType = "normal" | "popup" | "panel" | "detached_panel";

  type Window = {
    alwaysOnTop: boolean;
    focused: boolean;
    incognito: boolean;

    height?: number;
    id?: number;
    left?: number;
    state?: WindowState;
    tabs?: browser.tabs.Tab[];
    title?: string;
    top?: number;
    type?: WindowType;
    width?: number;
  };

  type WindowState =
    | "normal"
    | "minimized"
    | "maximized"
    | "fullscreen"
    | "docked";

  type WindowType = "normal" | "popup" | "panel" | "app" | "devtools" | "addressBook" | "messageCompose" | "messageDisplay";

  function get(
    windowId: number,
    getInfo?: {
      populate?: boolean;
      windowTypes?: WindowType[];
    }
  ): Promise<browser.windows.Window>;

  function getCurrent(getInfo?: {
    populate?: boolean;
    windowTypes?: WindowType[];
  }): Promise<browser.windows.Window>;

  function getLastFocused(getInfo?: {
    populate?: boolean;
    windowTypes?: WindowType[];
  }): Promise<browser.windows.Window>;

  function getAll(getInfo?: {
    populate?: boolean;
    windowTypes?: WindowType[];
  }): Promise<browser.windows.Window[]>;

  function create(createData?: {
    allowScriptsToClose?: boolean;
    focused?: boolean;
    height?: number;
    incognito?: boolean;
    left?: number;
    state?: WindowState;
    tabId?: number;
    titlePreface?: string;
    top?: number;
    type?: CreateType;
    url?: string | string[];
    width?: number;
  }): Promise<browser.windows.Window>;

  function update(
    windowId: number,
    updateInfo: {
      drawAttention?: boolean;
      focused?: boolean;
      height?: number;
      left?: number;
      state?: WindowState;
      top?: number;
      width?: number;
    }
  ): Promise<browser.windows.Window>;

  function remove(windowId: number): Promise<void>;

  const onCreated: Listener<browser.windows.Window>;
  const onRemoved: Listener<number>;
  const onFocusChanged: Listener<number>;
}

// The following APIs are also included and work as they do in Firefox

declare namespace browser.contentScripts {
  type RegisteredContentScriptOptions = {
    allFrames?: boolean;
    css?: ({ file: string } | { code: string })[];
    excludeGlobs?: string[];
    excludeMatches?: string[];
    includeGlobs?: string[];
    js?: ({ file: string } | { code: string })[];
    matchAboutBlank?: boolean;
    matches: string[];
    runAt?: "document_start" | "document_end" | "document_idle";
  };

  type RegisteredContentScript = {
    unregister: () => void;
  };

  function register(
    contentScriptOptions: RegisteredContentScriptOptions
  ): Promise<RegisteredContentScript>;
}

declare namespace browser.extension {
  type ViewType = "tab" | "popup" | "sidebar"; // | "notification";

  const lastError: string | null;
  const inIncognitoContext: boolean;

  function getURL(path: string): string;
  function getViews(fetchProperties?: {
    type?: ViewType;
    windowId?: number;
  }): Window[];
  function getBackgroundPage(): Window;
  function isAllowedIncognitoAccess(): Promise<boolean>;
  function isAllowedFileSchemeAccess(): Promise<boolean>;
  // unsupported: events as they are deprecated
}

declare namespace browser.extensionTypes {
  type ImageFormat = "jpeg" | "png";
  type ImageDetails = {
    format: ImageFormat;
    quality: number;
  };
  type RunAt = "document_start" | "document_end" | "document_idle";
  type InjectDetails = {
    allFrames?: boolean;
    code?: string;
    file?: string;
    frameId?: number;
    matchAboutBlank?: boolean;
    runAt?: RunAt;
  };
  type InjectDetailsCSS = InjectDetails & { cssOrigin?: "user" | "author" };
}

declare namespace browser.i18n {
  type LanguageCode = string;

  function getAcceptLanguages(): Promise<LanguageCode[]>;

  function getMessage(
    messageName: string,
    substitutions?: string | string[]
  ): string;

  function getUILanguage(): LanguageCode;

  function detectLanguage(
    text: string
  ): Promise<{
    isReliable: boolean;
    languages: { language: LanguageCode; percentage: number }[];
  }>;
}

declare namespace browser.management {
  type ExtensionInfo = {
    description: string;
    // unsupported: disabledReason: string,
    enabled: boolean;
    homepageUrl: string;
    hostPermissions: string[];
    icons: { size: number; url: string }[];
    id: string;
    installType: "admin" | "development" | "normal" | "sideload" | "other";
    mayDisable: boolean;
    name: string;
    // unsupported: offlineEnabled: boolean,
    optionsUrl: string;
    permissions: string[];
    shortName: string;
    // unsupported: type: string,
    updateUrl: string;
    version: string;
    // unsupported: versionName: string,
  };

  function getSelf(): Promise<ExtensionInfo>;
  function uninstallSelf(options: {
    showConfirmDialog: boolean;
    dialogMessage: string;
  }): Promise<void>;
}

declare namespace browser.permissions {
  type Permission =
    | "activeTab"
    | "alarms"
    | "background"
    | "bookmarks"
    | "browsingData"
    | "browserSettings"
    | "clipboardRead"
    | "clipboardWrite"
    | "contextMenus"
    | "contextualIdentities"
    | "cookies"
    | "downloads"
    | "downloads.open"
    | "find"
    | "geolocation"
    | "history"
    | "identity"
    | "idle"
    | "management"
    | "menus"
    | "nativeMessaging"
    | "notifications"
    | "pkcs11"
    | "privacy"
    | "proxy"
    | "sessions"
    | "storage"
    | "tabs"
    | "theme"
    | "topSites"
    | "unlimitedStorage"
    | "webNavigation"
    | "webRequest"
    | "webRequestBlocking";

  type Permissions = {
    origins?: string[];
    permissions?: Permission[];
  };

  function contains(permissions: Permissions): Promise<boolean>;

  function getAll(): Promise<Permissions>;

  function remove(permissions: Permissions): Promise<boolean>;

  function request(permissions: Permissions): Promise<boolean>;

  // Not yet support in Edge and Firefox:
  // const onAdded: Listener<Permissions>;
  // const onRemoved: Listener<Permissions>;
}

declare namespace browser.pkcs11 {
  function getModuleSlots(name: string): Promise<{name: string, token?: {
    name: string;
    manufacturer: string;
    HWVersion: string;
    FWVersion: string;
    serial: string;
    isLoggedIn: boolean;
  }}>;
  function installModule(name: string, flags?: number): Promise<void>;
  function isModuleInstalled(name: string): Promise<boolean>;
  function uninstallModule(name: string): Promise<void>;
}

declare namespace browser.runtime {
  const lastError: string | null;
  const id: string;

  type Port = {
    name: string;
    disconnect(): void;
    error: object;
    onDisconnect: Listener<Port>;
    onMessage: Listener<object>;
    postMessage: <T = object>(message: T) => void;
    sender?: runtime.MessageSender;
  };

  type MessageSender = {
    tab?: browser.tabs.Tab;
    frameId?: number;
    id?: string;
    url?: string;
    tlsChannelId?: string;
  };

  type PlatformOs = "mac" | "win" | "android" | "cros" | "linux" | "openbsd";
  type PlatformArch = "arm" | "x86-32" | "x86-64";
  type PlatformNaclArch = "arm" | "x86-32" | "x86-64";

  type PlatformInfo = {
    os: PlatformOs;
    arch: PlatformArch;
  };

  // type RequestUpdateCheckStatus = "throttled" | "no_update" | "update_available";
  type OnInstalledReason =
    | "install"
    | "update"
    | "chrome_update"
    | "shared_module_update";
  type OnRestartRequiredReason = "app_update" | "os_update" | "periodic";

  type FirefoxSpecificProperties = {
    id?: string;
    strict_min_version?: string;
    strict_max_version?: string;
    update_url?: string;
  };

  type IconPath = { [urlName: string]: string } | string;

  type Manifest = {
    // Required
    manifest_version: 2;
    name: string;
    version: string;
    /** Required in Microsoft Edge */
    author?: string;

    // Optional

    // ManifestBase
    description?: string;
    homepage_url?: string;
    short_name?: string;

    // WebExtensionManifest
    background?: {
      page: string;
      scripts: string[];
      persistent?: boolean;
    };
    content_scripts?: {
      matches: string[];
      exclude_matches?: string[];
      include_globs?: string[];
      exclude_globs?: string[];
      css?: string[];
      js?: string[];
      all_frames?: boolean;
      match_about_blank?: boolean;
      run_at?: "document_start" | "document_end" | "document_idle";
    }[];
    content_security_policy?: string;
    developer?: {
      name?: string;
      url?: string;
    };
    icons?: {
      [imgSize: string]: string;
    };
    incognito?: "spanning" | "split" | "not_allowed";
    optional_permissions?: browser.permissions.Permission[];
    options_ui?: {
      page: string;
      browser_style?: boolean;
      chrome_style?: boolean;
      open_in_tab?: boolean;
    };
    permissions?: browser.permissions.Permission[];
    web_accessible_resources?: string[];

    // WebExtensionLangpackManifest
    languages: {
      [langCode: string]: {
        chrome_resources: {
          [resName: string]: string | { [urlName: string]: string };
        };
        version: string;
      };
    };
    langpack_id?: string;
    sources?: {
      [srcName: string]: {
        base_path: string;
        paths?: string[];
      };
    };

    // Extracted from components
    browser_action?: {
      default_title?: string;
      default_icon?: IconPath;
      theme_icons?: {
        light: string;
        dark: string;
        size: number;
      }[];
      default_popup?: string;
      browser_style?: boolean;
      default_area?: "navbar" | "menupanel" | "tabstrip" | "personaltoolbar";
    };
    commands?: {
      [keyName: string]: {
        suggested_key?: {
          default?: string;
          mac?: string;
          linux?: string;
          windows?: string;
          chromeos?: string;
          android?: string;
          ios?: string;
        };
        description?: string;
      };
    };
    default_locale?: browser.i18n.LanguageCode;
    devtools_page?: string;
    omnibox?: {
      keyword: string;
    };
    page_action?: {
      default_title?: string;
      default_icon?: IconPath;
      default_popup?: string;
      browser_style?: boolean;
      show_matches?: string[];
      hide_matches?: string[];
    };
    sidebar_action?: {
      default_panel: string;
      default_title?: string;
      default_icon?: IconPath;
      browser_style?: boolean;
    };

    // Firefox specific
    applications?: {
      gecko?: FirefoxSpecificProperties;
    };
    browser_specific_settings?: {
      gecko?: FirefoxSpecificProperties;
    };
    experiment_apis?: any;
    protocol_handlers?: {
      name: string;
      protocol: string;
      uriTemplate: string;
    };

    // Opera specific
    minimum_opera_version?: string;

    // Chrome specific
    action?: any;
    automation?: any;
    background_page?: any;
    chrome_settings_overrides?: {
      homepage?: string;
      search_provider?: {
        name: string;
        search_url: string;
        keyword?: string;
        favicon_url?: string;
        suggest_url?: string;
        instant_url?: string;
        is_default?: string;
        image_url?: string;
        search_url_post_params?: string;
        instant_url_post_params?: string;
        image_url_post_params?: string;
        alternate_urls?: string[];
        prepopulated_id?: number;
      };
    };
    chrome_ui_overrides?: {
      bookmarks_ui?: {
        remove_bookmark_shortcut?: true;
        remove_button?: true;
      };
    };
    chrome_url_overrides?: {
      newtab?: string;
      bookmarks?: string;
      history?: string;
    };
    content_capabilities?: any;
    converted_from_user_script?: any;
    current_locale?: any;
    declarative_net_request?: any;
    event_rules?: any[];
    export?: {
      whitelist?: string[];
    };
    externally_connectable?: {
      ids?: string[];
      matches?: string[];
      accepts_tls_channel_id?: boolean;
    };
    file_browser_handlers?: {
      id: string;
      default_title: string;
      file_filters: string[];
    }[];
    file_system_provider_capabilities?: {
      source: "file" | "device" | "network";
      configurable?: boolean;
      multiple_mounts?: boolean;
      watchable?: boolean;
    };
    import?: {
      id: string;
      minimum_version?: string;
    }[];
    input_components?: any;
    key?: string;
    minimum_chrome_version?: string;
    nacl_modules?: {
      path: string;
      mime_type: string;
    }[];
    oauth2?: any;
    offline_enabled?: boolean;
    options_page?: string;
    platforms?: any;
    requirements?: any;
    sandbox?: {
      pages: string[];
      content_security_policy?: string;
    }[];
    signature?: any;
    spellcheck?: any;
    storage?: {
      managed_schema: string;
    };
    system_indicator?: any;
    tts_engine?: {
      voice: {
        voice_name: string;
        lang?: string;
        gender?: "male" | "female";
        event_types: (
          | "start"
          | "word"
          | "sentence"
          | "marker"
          | "end"
          | "error")[];
      }[];
    };
    update_url?: string;
    version_name?: string;
  };

  function getBackgroundPage(): Promise<Window>;
  function openOptionsPage(): Promise<void>;
  function getManifest(): Manifest;

  function getURL(path: string): string;
  function setUninstallURL(url: string): Promise<void>;
  function reload(): void;
  // Will not exist: https://bugzilla.mozilla.org/show_bug.cgi?id=1314922
  // function RequestUpdateCheck(): Promise<RequestUpdateCheckStatus>;
  function connect(
    connectInfo?: { name?: string; includeTlsChannelId?: boolean }
  ): Port;
  function connect(
    extensionId?: string,
    connectInfo?: { name?: string; includeTlsChannelId?: boolean }
  ): Port;
  function connectNative(application: string): Port;

  function sendMessage<T = any, U = any>(message: T): Promise<U>;
  function sendMessage<T = any, U = any>(
    message: T,
    options: { includeTlsChannelId?: boolean; toProxyScript?: boolean }
  ): Promise<U>;
  function sendMessage<T = any, U = any>(
    extensionId: string,
    message: T
  ): Promise<U>;
  function sendMessage<T = any, U = any>(
    extensionId: string,
    message: T,
    options?: { includeTlsChannelId?: boolean; toProxyScript?: boolean }
  ): Promise<U>;

  function sendNativeMessage(
    application: string,
    message: object
  ): Promise<object | void>;
  function getPlatformInfo(): Promise<PlatformInfo>;
  function getBrowserInfo(): Promise<{
    name: string;
    vendor: string;
    version: string;
    buildID: string;
  }>;
  // Unsupported: https://bugzilla.mozilla.org/show_bug.cgi?id=1339407
  // function getPackageDirectoryEntry(): Promise<any>;

  const onStartup: Listener<void>;
  const onInstalled: Listener<{
    reason: OnInstalledReason;
    previousVersion?: string;
    id?: string;
  }>;
  // Unsupported
  // const onSuspend: Listener<void>;
  // const onSuspendCanceled: Listener<void>;
  // const onBrowserUpdateAvailable: Listener<void>;
  // const onRestartRequired: Listener<OnRestartRequiredReason>;
  const onUpdateAvailable: Listener<{ version: string }>;
  const onConnect: Listener<Port>;

  const onConnectExternal: Listener<Port>;

  type onMessagePromise = (
    message: object,
    sender: MessageSender,
    sendResponse: (response: object) => boolean
  ) => Promise<void>;

  type onMessageBool = (
    message: object,
    sender: MessageSender,
    sendResponse: (response: object) => Promise<void>
  ) => boolean;

  type onMessageVoid = (
    message: object,
    sender: MessageSender,
    sendResponse: (response: object) => Promise<void>
  ) => void;

  type onMessageEvent = onMessagePromise | onMessageBool | onMessageVoid;
  const onMessage: EvListener<onMessageEvent>;

  const onMessageExternal: EvListener<onMessageEvent>;
}

declare namespace browser.theme {
  type Theme = {
    images: ThemeImages;
    colors: ThemeColors;
    properties?: ThemeProperties;
  };

  type ThemeImages = {
    headerURL: string;
    theme_frame?: string;
    additional_backgrounds?: string[];
  };

  type ThemeColors = {
    accentcolor: string;
    textcolor: string;
    frame?: [number, number, number];
    tab_text?: [number, number, number];
    toolbar?: string;
    toolbar_text?: string;
    toolbar_field?: string;
    toolbar_field_text?: string;
  };

  type ThemeProperties = {
    additional_backgrounds_alignment: Alignment[];
    additional_backgrounds_tiling: Tiling[];
  };

  type Alignment =
    | "bottom"
    | "center"
    | "left"
    | "right"
    | "top"
    | "center bottom"
    | "center center"
    | "center top"
    | "left bottom"
    | "left center"
    | "left top"
    | "right bottom"
    | "right center"
    | "right top";

  type Tiling = "no-repeat" | "repeat" | "repeat-x" | "repeat-y";

  function getCurrent(): Promise<Theme>;
  function getCurrent(windowId: number): Promise<Theme>;
  function update(theme: Theme): Promise<void>;
  function update(windowId: number, theme: Theme): Promise<void>;
  function reset(): Promise<void>;
  function reset(windowId: number): Promise<void>;
}
