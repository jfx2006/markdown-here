var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.js"(exports, module) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter2() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter2.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter2.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter2.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter2.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
    EventEmitter2.prefixed = prefix;
    EventEmitter2.EventEmitter = EventEmitter2;
    if ("undefined" !== typeof module) {
      module.exports = EventEmitter2;
    }
  }
});

// node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.mjs
var import_index = __toESM(require_eventemitter3(), 1);

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/SearchResult.ts
var MAIN = /\$&/g;
var PLACE = /\$(\d)/g;
var SearchResult = class {
  constructor(data, term, strategy) {
    this.data = data;
    this.term = term;
    this.strategy = strategy;
  }
  getReplacementData(beforeCursor) {
    let result = this.strategy.replace(this.data);
    if (result == null) return null;
    let afterCursor = "";
    if (Array.isArray(result)) {
      afterCursor = result[1];
      result = result[0];
    }
    const match = this.strategy.match(beforeCursor);
    if (match == null || match.index == null) return null;
    const replacement = result.replace(MAIN, match[0]).replace(PLACE, (_, p) => match[parseInt(p)]);
    return {
      start: match.index,
      end: match.index + match[0].length,
      beforeCursor: replacement,
      afterCursor
    };
  }
  replace(beforeCursor, afterCursor) {
    const replacement = this.getReplacementData(beforeCursor);
    if (replacement === null) return;
    afterCursor = replacement.afterCursor + afterCursor;
    return [
      [
        beforeCursor.slice(0, replacement.start),
        replacement.beforeCursor,
        beforeCursor.slice(replacement.end)
      ].join(""),
      afterCursor
    ];
  }
  render() {
    return this.strategy.renderTemplate(this.data, this.term);
  }
  getStrategyId() {
    return this.strategy.getId();
  }
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/Strategy.ts
var DEFAULT_INDEX = 1;
var Strategy = class {
  constructor(props) {
    this.props = props;
  }
  cache = {};
  destroy() {
    this.cache = {};
    return this;
  }
  replace(data) {
    return this.props.replace(data);
  }
  execute(beforeCursor, callback) {
    const match = this.matchWithContext(beforeCursor);
    if (!match) return false;
    const term = match[this.props.index ?? DEFAULT_INDEX];
    this.search(
      term,
      (results) => {
        callback(results.map((result) => new SearchResult(result, term, this)));
      },
      match
    );
    return true;
  }
  renderTemplate(data, term) {
    if (this.props.template) {
      return this.props.template(data, term);
    }
    if (typeof data === "string") return data;
    throw new Error(
      `Unexpected render data type: ${typeof data}. Please implement template parameter by yourself`
    );
  }
  getId() {
    return this.props.id || null;
  }
  match(text) {
    return typeof this.props.match === "function" ? this.props.match(text) : text.match(this.props.match);
  }
  search(term, callback, match) {
    if (this.props.cache) {
      this.searchWithCach(term, callback, match);
    } else {
      this.props.search(term, callback, match);
    }
  }
  matchWithContext(beforeCursor) {
    const context = this.context(beforeCursor);
    if (context === false) return null;
    return this.match(context === true ? beforeCursor : context);
  }
  context(beforeCursor) {
    return this.props.context ? this.props.context(beforeCursor) : true;
  }
  searchWithCach(term, callback, match) {
    if (this.cache[term] != null) {
      callback(this.cache[term]);
    } else {
      this.props.search(
        term,
        (results) => {
          this.cache[term] = results;
          callback(results);
        },
        match
      );
    }
  }
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/Completer.ts
var Completer = class extends import_index.default {
  strategies;
  constructor(strategyPropsList) {
    super();
    this.strategies = strategyPropsList.map((p) => new Strategy(p));
  }
  destroy() {
    this.strategies.forEach((s) => s.destroy());
    return this;
  }
  run(beforeCursor) {
    for (const strategy of this.strategies) {
      const executed = strategy.execute(beforeCursor, this.handleQueryResult);
      if (executed) return;
    }
    this.handleQueryResult([]);
  }
  handleQueryResult = (searchResults) => {
    this.emit("hit", { searchResults });
  };
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/utils.ts
var isCustomEventSupported = typeof window !== "undefined" && !!window.CustomEvent;
var createCustomEvent = (type, options) => {
  if (isCustomEventSupported) return new CustomEvent(type, options);
  const event = document.createEvent("CustomEvent");
  event.initCustomEvent(
    type,
    /* bubbles */
    false,
    options?.cancelable || false,
    options?.detail || void 0
  );
  return event;
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/Dropdown.ts
var DEFAULT_DROPDOWN_MAX_COUNT = 10;
var DEFAULT_DROPDOWN_PLACEMENT = "auto";
var DEFAULT_DROPDOWN_CLASS_NAME = "dropdown-menu textcomplete-dropdown";
var DEFAULT_DROPDOWN_ITEM_CLASS_NAME = "textcomplete-item";
var DEFAULT_DROPDOWN_ITEM_ACTIVE_CLASS_NAME = `${DEFAULT_DROPDOWN_ITEM_CLASS_NAME} active`;
var Dropdown = class _Dropdown extends import_index.default {
  constructor(el, option) {
    super();
    this.el = el;
    this.option = option;
  }
  shown = false;
  items = [];
  activeIndex = null;
  static create(option) {
    const ul = document.createElement("ul");
    ul.className = option.className || DEFAULT_DROPDOWN_CLASS_NAME;
    Object.assign(
      ul.style,
      {
        display: "none",
        position: "absolute",
        zIndex: "1000"
      },
      option.style
    );
    const parent = option.parent || document.body;
    parent?.appendChild(ul);
    return new _Dropdown(ul, option);
  }
  /**
   * Render the given search results. Previous results are cleared.
   *
   * @emits render
   * @emits rendered
   */
  render(searchResults, cursorOffset) {
    const event = createCustomEvent("render", { cancelable: true });
    this.emit("render", event);
    if (event.defaultPrevented) return this;
    this.clear();
    if (searchResults.length === 0) return this.hide();
    this.items = searchResults.slice(0, this.option.maxCount || DEFAULT_DROPDOWN_MAX_COUNT).map(
      (r, index) => new DropdownItem(this, index, r, this.option?.item || {})
    );
    this.setStrategyId(searchResults[0]).renderEdge(searchResults, "header").renderItems().renderEdge(searchResults, "footer").show().setOffset(cursorOffset).activate(0);
    this.emit("rendered", createCustomEvent("rendered"));
    return this;
  }
  destroy() {
    this.clear();
    this.el.parentNode?.removeChild(this.el);
    return this;
  }
  /**
   * Select the given item
   *
   * @emits select
   * @emits selected
   */
  select(item) {
    const detail = { searchResult: item.searchResult };
    const event = createCustomEvent("select", { cancelable: true, detail });
    this.emit("select", event);
    if (event.defaultPrevented) return this;
    this.hide();
    this.emit("selected", createCustomEvent("selected", { detail }));
    return this;
  }
  /**
   * Show the dropdown element
   *
   * @emits show
   * @emits shown
   */
  show() {
    if (!this.shown) {
      const event = createCustomEvent("show", { cancelable: true });
      this.emit("show", event);
      if (event.defaultPrevented) return this;
      this.el.style.display = "block";
      this.shown = true;
      this.emit("shown", createCustomEvent("shown"));
    }
    return this;
  }
  /**
   * Hide the dropdown element
   *
   * @emits hide
   * @emits hidden
   */
  hide() {
    if (this.shown) {
      const event = createCustomEvent("hide", { cancelable: true });
      this.emit("hide", event);
      if (event.defaultPrevented) return this;
      this.el.style.display = "none";
      this.shown = false;
      this.clear();
      this.emit("hidden", createCustomEvent("hidden"));
    }
    return this;
  }
  /** Clear search results */
  clear() {
    this.items.forEach((i) => i.destroy());
    this.items = [];
    this.el.innerHTML = "";
    this.activeIndex = null;
    return this;
  }
  up(e) {
    return this.shown ? this.moveActiveItem("prev", e) : this;
  }
  down(e) {
    return this.shown ? this.moveActiveItem("next", e) : this;
  }
  moveActiveItem(direction, e) {
    if (this.activeIndex != null) {
      const activeIndex = direction === "next" ? this.getNextActiveIndex() : this.getPrevActiveIndex();
      if (activeIndex != null) {
        this.activate(activeIndex);
        e.preventDefault();
      }
    }
    return this;
  }
  activate(index) {
    if (this.activeIndex !== index) {
      if (this.activeIndex != null) {
        this.items[this.activeIndex].deactivate();
      }
      this.activeIndex = index;
      this.items[index].activate();
    }
    return this;
  }
  isShown() {
    return this.shown;
  }
  getActiveItem() {
    return this.activeIndex != null ? this.items[this.activeIndex] : null;
  }
  setOffset(cursorOffset) {
    const doc = document.documentElement;
    if (doc) {
      const elementWidth = this.el.offsetWidth;
      if (cursorOffset.left) {
        const browserWidth = this.option.dynamicWidth ? doc.scrollWidth : doc.clientWidth;
        if (cursorOffset.left + elementWidth > browserWidth) {
          cursorOffset.left = browserWidth - elementWidth;
        }
        this.el.style.left = `${cursorOffset.left}px`;
      } else if (cursorOffset.right) {
        if (cursorOffset.right - elementWidth < 0) {
          cursorOffset.right = 0;
        }
        this.el.style.right = `${cursorOffset.right}px`;
      }
      let forceTop = false;
      const placement = this.option.placement || DEFAULT_DROPDOWN_PLACEMENT;
      if (placement === "auto") {
        const dropdownHeight = this.items.length * cursorOffset.lineHeight;
        forceTop = cursorOffset.clientTop != null && cursorOffset.clientTop + dropdownHeight > doc.clientHeight;
      }
      if (placement === "top" || forceTop) {
        this.el.style.bottom = `${doc.clientHeight - cursorOffset.top + cursorOffset.lineHeight}px`;
        this.el.style.top = "auto";
      } else {
        this.el.style.top = `${cursorOffset.top}px`;
        this.el.style.bottom = "auto";
      }
    }
    return this;
  }
  getNextActiveIndex() {
    if (this.activeIndex == null) throw new Error();
    return this.activeIndex < this.items.length - 1 ? this.activeIndex + 1 : this.option.rotate ? 0 : null;
  }
  getPrevActiveIndex() {
    if (this.activeIndex == null) throw new Error();
    return this.activeIndex !== 0 ? this.activeIndex - 1 : this.option.rotate ? this.items.length - 1 : null;
  }
  renderItems() {
    const fragment = document.createDocumentFragment();
    for (const item of this.items) {
      fragment.appendChild(item.el);
    }
    this.el.appendChild(fragment);
    return this;
  }
  setStrategyId(searchResult) {
    const id = searchResult.getStrategyId();
    if (id) this.el.dataset.strategy = id;
    return this;
  }
  renderEdge(searchResults, type) {
    const option = this.option[type];
    const li = document.createElement("li");
    li.className = `textcomplete-${type}`;
    li.innerHTML = typeof option === "function" ? option(searchResults.map((s) => s.data)) : option || "";
    this.el.appendChild(li);
    return this;
  }
};
var DropdownItem = class {
  constructor(dropdown, index, searchResult, props) {
    this.dropdown = dropdown;
    this.index = index;
    this.searchResult = searchResult;
    this.props = props;
    this.className = this.props.className || DEFAULT_DROPDOWN_ITEM_CLASS_NAME;
    this.activeClassName = this.props.activeClassName || DEFAULT_DROPDOWN_ITEM_ACTIVE_CLASS_NAME;
    const li = document.createElement("li");
    li.className = this.active ? this.activeClassName : this.className;
    const span = document.createElement("span");
    span.tabIndex = -1;
    span.innerHTML = this.searchResult.render();
    li.appendChild(span);
    li.addEventListener("mousedown", this.onClick);
    this.el = li;
  }
  el;
  active = false;
  className;
  activeClassName;
  destroy() {
    const li = this.el;
    li.parentNode?.removeChild(li);
    li.removeEventListener("click", this.onClick, false);
    return this;
  }
  activate() {
    if (!this.active) {
      this.active = true;
      this.el.className = this.activeClassName;
      this.dropdown.el.scrollTop = this.el.offsetTop;
    }
    return this;
  }
  deactivate() {
    if (this.active) {
      this.active = false;
      this.el.className = this.className;
    }
    return this;
  }
  onClick = (e) => {
    e.preventDefault();
    this.dropdown.select(this);
  };
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/Editor.ts
var Editor = class extends import_index.default {
  /**
   * Finalize the editor object.
   *
   * It is called when associated textcomplete object is destroyed.
   */
  destroy() {
    return this;
  }
  /**
   * It is called when a search result is selected by a user.
   */
  applySearchResult(_searchResult) {
    throw new Error("Not implemented.");
  }
  /**
   * The input cursor's absolute coordinates from the window's left
   * top corner.
   */
  getCursorOffset() {
    throw new Error("Not implemented.");
  }
  /**
   * Editor string value from head to the cursor.
   * Returns null if selection type is range not cursor.
   */
  getBeforeCursor() {
    throw new Error("Not implemented.");
  }
  /**
   * Emit a move event, which moves active dropdown element.
   * Child class must call this method at proper timing with proper parameter.
   *
   * @see {@link Textarea} for live example.
   */
  emitMoveEvent(code) {
    const moveEvent = createCustomEvent("move", {
      cancelable: true,
      detail: {
        code
      }
    });
    this.emit("move", moveEvent);
    return moveEvent;
  }
  /**
   * Emit a enter event, which selects current search result.
   * Child class must call this method at proper timing.
   *
   * @see {@link Textarea} for live example.
   */
  emitEnterEvent() {
    const enterEvent = createCustomEvent("enter", { cancelable: true });
    this.emit("enter", enterEvent);
    return enterEvent;
  }
  /**
   * Emit a change event, which triggers auto completion.
   * Child class must call this method at proper timing.
   *
   * @see {@link Textarea} for live example.
   */
  emitChangeEvent() {
    const changeEvent = createCustomEvent("change", {
      detail: {
        beforeCursor: this.getBeforeCursor()
      }
    });
    this.emit("change", changeEvent);
    return changeEvent;
  }
  /**
   * Emit a esc event, which hides dropdown element.
   * Child class must call this method at proper timing.
   *
   * @see {@link Textarea} for live example.
   */
  emitEscEvent() {
    const escEvent = createCustomEvent("esc", { cancelable: true });
    this.emit("esc", escEvent);
    return escEvent;
  }
  /**
   * Helper method for parsing KeyboardEvent.
   *
   * @see {@link Textarea} for live example.
   */
  getCode(e) {
    switch (e.keyCode) {
      case 9:
      case 13:
        return "ENTER";
      case 27:
        return "ESC";
      case 38:
        return "UP";
      case 40:
        return "DOWN";
      case 78:
        if (e.ctrlKey) return "DOWN";
        break;
      case 80:
        if (e.ctrlKey) return "UP";
        break;
    }
    return "OTHER";
  }
};

// node_modules/.pnpm/@textcomplete+core@0.1.13/node_modules/@textcomplete/core/src/Textcomplete.ts
var PASSTHOUGH_EVENT_NAMES = [
  "show",
  "shown",
  "render",
  "rendered",
  "selected",
  "hidden",
  "hide"
];
var Textcomplete = class extends import_index.default {
  constructor(editor, strategies, option) {
    super();
    this.editor = editor;
    this.completer = new Completer(strategies);
    this.dropdown = Dropdown.create(option?.dropdown || {});
    this.startListening();
  }
  completer;
  dropdown;
  isQueryInFlight = false;
  nextPendingQuery = null;
  destroy(destroyEditor = true) {
    this.completer.destroy();
    this.dropdown.destroy();
    if (destroyEditor) this.editor.destroy();
    this.stopListening();
    return this;
  }
  isShown() {
    return this.dropdown.isShown();
  }
  hide() {
    this.dropdown.hide();
    return this;
  }
  trigger(beforeCursor) {
    if (this.isQueryInFlight) {
      this.nextPendingQuery = beforeCursor;
    } else {
      this.isQueryInFlight = true;
      this.nextPendingQuery = null;
      this.completer.run(beforeCursor);
    }
    return this;
  }
  handleHit = ({
    searchResults
  }) => {
    if (searchResults.length) {
      this.dropdown.render(searchResults, this.editor.getCursorOffset());
    } else {
      this.dropdown.hide();
    }
    this.isQueryInFlight = false;
    if (this.nextPendingQuery !== null) this.trigger(this.nextPendingQuery);
  };
  handleMove = (e) => {
    e.detail.code === "UP" ? this.dropdown.up(e) : this.dropdown.down(e);
  };
  handleEnter = (e) => {
    const activeItem = this.dropdown.getActiveItem();
    if (activeItem) {
      this.dropdown.select(activeItem);
      e.preventDefault();
    } else {
      this.dropdown.hide();
    }
  };
  handleEsc = (e) => {
    if (this.dropdown.isShown()) {
      this.dropdown.hide();
      e.preventDefault();
    }
  };
  handleChange = (e) => {
    if (e.detail.beforeCursor != null) {
      this.trigger(e.detail.beforeCursor);
    } else {
      this.dropdown.hide();
    }
  };
  handleSelect = (selectEvent) => {
    this.emit("select", selectEvent);
    if (!selectEvent.defaultPrevented) {
      this.editor.applySearchResult(selectEvent.detail.searchResult);
    }
  };
  handleResize = () => {
    if (this.dropdown.isShown()) {
      this.dropdown.setOffset(this.editor.getCursorOffset());
    }
  };
  startListening() {
    this.editor.on("move", this.handleMove).on("enter", this.handleEnter).on("esc", this.handleEsc).on("change", this.handleChange);
    this.dropdown.on("select", this.handleSelect);
    for (const eventName of PASSTHOUGH_EVENT_NAMES) {
      this.dropdown.on(eventName, (e) => this.emit(eventName, e));
    }
    this.completer.on("hit", this.handleHit);
    this.dropdown.el.ownerDocument.defaultView?.addEventListener(
      "resize",
      this.handleResize
    );
  }
  stopListening() {
    this.dropdown.el.ownerDocument.defaultView?.removeEventListener(
      "resize",
      this.handleResize
    );
    this.completer.removeAllListeners();
    this.dropdown.removeAllListeners();
    this.editor.removeListener("move", this.handleMove).removeListener("enter", this.handleEnter).removeListener("esc", this.handleEsc).removeListener("change", this.handleChange);
  }
};

// node_modules/.pnpm/@textcomplete+utils@0.1.13/node_modules/@textcomplete/utils/src/getLineHeightPx.ts
var CHAR_CODE_ZERO = "0".charCodeAt(0);
var CHAR_CODE_NINE = "9".charCodeAt(0);
var isDigit = (charCode) => CHAR_CODE_ZERO <= charCode && charCode <= CHAR_CODE_NINE;
var getLineHeightPx = (el) => {
  const computedStyle = getComputedStyle(el);
  const lineHeight = computedStyle.lineHeight;
  if (isDigit(lineHeight.charCodeAt(0))) {
    const floatLineHeight = parseFloat(lineHeight);
    return isDigit(lineHeight.charCodeAt(lineHeight.length - 1)) ? floatLineHeight * parseFloat(computedStyle.fontSize) : floatLineHeight;
  }
  return calculateLineHeightPx(el.nodeName, computedStyle);
};
var calculateLineHeightPx = (nodeName, computedStyle) => {
  const body = document.body;
  if (!body) return 0;
  const tempNode = document.createElement(nodeName);
  tempNode.innerHTML = "&nbsp;";
  Object.assign(tempNode.style, {
    fontSize: computedStyle.fontSize,
    fontFamily: computedStyle.fontFamily,
    padding: "0"
  });
  body.appendChild(tempNode);
  if (tempNode instanceof HTMLTextAreaElement) {
    tempNode.rows = 1;
  }
  const height = tempNode.offsetHeight;
  body.removeChild(tempNode);
  return height;
};

// node_modules/.pnpm/@textcomplete+utils@0.1.13/node_modules/@textcomplete/utils/src/isSafari.ts
var isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// node_modules/.pnpm/@textcomplete+contenteditable@0.1.13_@textcomplete+core@0.1.13/node_modules/@textcomplete/contenteditable/src/ContenteditableEditor.ts
var ContenteditableEditor = class extends Editor {
  constructor(el) {
    super();
    this.el = el;
    this.startListening();
  }
  destroy() {
    super.destroy();
    this.stopListening();
    return this;
  }
  /**
   * @implements {@link Editor#applySearchResult}
   */
  applySearchResult(searchResult) {
    const before = this.getBeforeCursor();
    const after = this.getAfterCursor();
    if (before != null && after != null) {
      const replace = searchResult.replace(before, after);
      if (Array.isArray(replace)) {
        let beforeCursor = replace[0];
        if (isSafari()) beforeCursor = beforeCursor.replace(before, "");
        const range = this.getRange();
        range.selectNode(range.startContainer);
        this.el.ownerDocument.execCommand(
          "insertText",
          false,
          beforeCursor + replace[1]
        );
        range.detach();
        const newRange = this.getRange();
        newRange.setStart(newRange.startContainer, beforeCursor.length);
        newRange.collapse(true);
      }
    }
  }
  /**
   * @implements {@link Editor#getCursorOffset}
   */
  getCursorOffset() {
    const range = this.getRange();
    const rangeRects = range.getBoundingClientRect();
    const docRects = this.el.ownerDocument.body.getBoundingClientRect();
    const container = range.startContainer;
    const el = container instanceof Text ? container.parentElement : container;
    const left = rangeRects.left;
    const lineHeight = getLineHeightPx(el);
    const top = rangeRects.top - docRects.top + lineHeight;
    return this.el.dir !== "rtl" ? { left, lineHeight, top } : { right: document.documentElement.clientWidth - left, lineHeight, top };
  }
  /**
   * @implements {@link Editor#getBeforeCursor}
   */
  getBeforeCursor() {
    const range = this.getRange();
    if (range.collapsed && range.startContainer instanceof Text) {
      return range.startContainer.wholeText.substring(0, range.startOffset);
    }
    return null;
  }
  getAfterCursor() {
    const range = this.getRange();
    if (range.collapsed && range.startContainer instanceof Text) {
      return range.startContainer.wholeText.substring(range.startOffset);
    }
    return null;
  }
  getRange(force) {
    const selection = this.el.ownerDocument.defaultView?.getSelection();
    if (selection == null) {
      throw new Error("The element does not belong to view");
    }
    for (let i = 0, l = selection.rangeCount; i < l; i++) {
      const range2 = selection.getRangeAt(i);
      if (this.el.contains(range2.startContainer)) {
        return range2;
      }
    }
    if (force) {
      throw new Error("Unexpected");
    }
    const activeElement = this.el.ownerDocument.activeElement;
    this.el.focus();
    const range = this.getRange(true);
    if (activeElement) {
      const el = activeElement;
      el.focus && el.focus();
    }
    return range;
  }
  onInput = () => {
    this.emitChangeEvent();
  };
  onKeydown = (e) => {
    const code = this.getCode(e);
    let event;
    if (code === "UP" || code === "DOWN") {
      event = this.emitMoveEvent(code);
    } else if (code === "ENTER") {
      event = this.emitEnterEvent();
    } else if (code === "ESC") {
      event = this.emitEscEvent();
    }
    if (event && event.defaultPrevented) {
      e.preventDefault();
    }
  };
  startListening = () => {
    this.el.addEventListener("input", this.onInput);
    this.el.addEventListener("keydown", this.onKeydown);
  };
  stopListening = () => {
    this.el.removeEventListener("input", this.onInput);
    this.el.removeEventListener("keydown", this.onKeydown);
  };
};
export {
  ContenteditableEditor,
  Textcomplete
};
