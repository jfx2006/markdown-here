/* eslint-disable no-undefined,no-param-reassign,no-shadow */
/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param  {number}    delay -          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {boolean}   [noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
 *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
 *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
 *                                    the internal counter is reset).
 * @param  {Function}  callback -       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param  {boolean}   [debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
 *                                    schedule `callback` to execute after `delay` ms.
 *
 * @returns {Function}  A new, throttled, function.
 */
function throttle(delay, noTrailing, callback, debounceMode) {
    /*
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */
    var timeoutID;
    var cancelled = false;
 // Keep track of the last time `callback` was executed.
        var lastExec = 0;
 // Function to clear existing timeout
        function clearExistingTimeout() {
        timeoutID && clearTimeout(timeoutID);
    }
 // Function to cancel next exec
        // `noTrailing` defaults to falsy.
    if ("boolean" != typeof noTrailing) {
        debounceMode = callback;
        callback = noTrailing;
        noTrailing = void 0;
    }
    /*
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */    function wrapper() {
        for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) arguments_[_key] = arguments[_key];
        var self = this;
        var elapsed = Date.now() - lastExec;
        if (!cancelled) {
            debounceMode && !timeoutID && 
            /*
       * Since `wrapper` is being called for the first time and
       * `debounceMode` is true (at begin), execute `callback`.
       */
            exec();
            clearExistingTimeout();
            void 0 === debounceMode && elapsed > delay ? 
            /*
       * In throttle mode, if `delay` time has been exceeded, execute
       * `callback`.
       */
            exec() : true !== noTrailing && (
            /*
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute
       * after `delay` ms.
       *
       * If `debounceMode` is false (at end), schedule `callback` to
       * execute after `delay` ms.
       */
            timeoutID = setTimeout(debounceMode ? clear : exec, void 0 === debounceMode ? delay - elapsed : delay));
        }
 // Execute `callback` and update the `lastExec` timestamp.
                function exec() {
            lastExec = Date.now();
            callback.apply(self, arguments_);
        }
        /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */        function clear() {
            timeoutID = void 0;
        }
    }
    wrapper.cancel = function() {
        clearExistingTimeout();
        cancelled = true;
    };
 // Return the wrapper function.
        return wrapper;
}

/* eslint-disable no-undefined */
/**
 * Debounce execution of a function. Debouncing, unlike throttling,
 * guarantees that a function is only executed a single time, either at the
 * very beginning of a series of calls, or at the very end.
 *
 * @param  {number}   delay -         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {boolean}  [atBegin] -     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
 *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
 *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
 * @param  {Function} callback -      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                  to `callback` when the debounced-function is executed.
 *
 * @returns {Function} A new, debounced function.
 */ class TypeRegistry {
    constructor(initial = {}) {
        this.registeredTypes = initial;
    }
    get(type) {
        return void 0 !== this.registeredTypes[type] ? this.registeredTypes[type] : this.registeredTypes.default;
    }
    register(type, item) {
        void 0 === this.registeredTypes[type] && (this.registeredTypes[type] = item);
    }
    registerDefault(item) {
        this.register("default", item);
    }
}

class KeyExtractors extends TypeRegistry {
    constructor(options) {
        super(options);
        this.registerDefault((el => el.getAttribute("name") || ""));
    }
}

class InputReaders extends TypeRegistry {
    constructor(options) {
        super(options);
        this.registerDefault((el => el.value));
        this.register("checkbox", (el => null !== el.getAttribute("value") ? el.checked ? el.getAttribute("value") : null : el.checked));
        this.register("select", (el => 
        /**
 * Read select values
 *
 * @see {@link https://github.com/jquery/jquery/blob/master/src/attributes/val.js|Github}
 * @param {object} Select element
 * @return {string|Array} Select value(s)
 */
        function(elem) {
            var value, option, i;
            var options = elem.options;
            var index = elem.selectedIndex;
            var one = "select-one" === elem.type;
            var values = one ? null : [];
            var max = one ? index + 1 : options.length;
            i = index < 0 ? max : one ? index : 0;
            // Loop through all the selected options
                        for (;i < max; i++) 
            // Support: IE <=9 only
            // IE8-9 doesn't update selected after form reset
            if (((option = options[i]).selected || i === index) && 
            // Don't return options that are disabled or in a disabled optgroup
            !option.disabled && !(option.parentNode.disabled && "optgroup" === option.parentNode.tagName.toLowerCase())) {
                // Get the specific value for the option
                value = option.value;
                // We don't need an array for one selects
                                if (one) return value;
                // Multi-Selects return an array
                                values.push(value);
            }
            return values;
        }(el)));
    }
}

class KeyAssignmentValidators extends TypeRegistry {
    constructor(options) {
        super(options);
        this.registerDefault((() => true));
        this.register("radio", (el => el.checked));
    }
}

function keySplitter(key) {
    let matches = key.match(/[^[\]]+/g);
    let lastKey;
    if (key.length > 1 && key.indexOf("[]") === key.length - 2) {
        lastKey = matches.pop();
        matches.push([ lastKey ]);
    }
    return matches;
}

var proto = "undefined" != typeof Element ? Element.prototype : {};

var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;

var matchesSelector = 
/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */
function(el, selector) {
    if (!el || 1 !== el.nodeType) return false;
    if (vendor) return vendor.call(el, selector);
    var nodes = el.parentNode.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) if (nodes[i] == el) return true;
    return false;
};

function getElementType(el) {
    let typeAttr;
    let tagName = el.tagName;
    let type = tagName;
    if ("input" === tagName.toLowerCase()) {
        typeAttr = el.getAttribute("type");
        type = typeAttr || "text";
    }
    return type.toLowerCase();
}

function getInputElements(element, options) {
    return Array.prototype.filter.call(element.querySelectorAll("input,select,textarea"), (el => {
        if ("input" === el.tagName.toLowerCase() && ("submit" === el.type || "reset" === el.type)) return false;
        let myType = getElementType(el);
        let identifier = options.keyExtractors.get(myType)(el);
        let foundInInclude = -1 !== (options.include || []).indexOf(identifier);
        let foundInExclude = -1 !== (options.exclude || []).indexOf(identifier);
        let foundInIgnored = false;
        let reject = false;
        if (options.ignoredTypes) for (let selector of options.ignoredTypes) matchesSelector(el, selector) && (foundInIgnored = true);
        reject = !foundInInclude && (!!options.include || (foundInExclude || foundInIgnored));
        return !reject;
    }));
}

function assignKeyValue(obj, keychain, value) {
    if (!keychain) return obj;
    var key = keychain.shift();
    // build the current object we need to store data
        obj[key] || (obj[key] = Array.isArray(key) ? [] : {});
    // if it's the last key in the chain, assign the value directly
        0 === keychain.length && (Array.isArray(obj[key]) ? null !== value && obj[key].push(value) : obj[key] = value);
    // recursive parsing of the array, depth-first
        keychain.length > 0 && assignKeyValue(obj[key], keychain, value);
    return obj;
}

/**
 * Get a JSON object that represents all of the form inputs, in this element.
 *
 * @param {HTMLElement} Root element
 * @param {object} options
 * @param {object} options.inputReaders
 * @param {object} options.keyAssignmentValidators
 * @param {object} options.keyExtractors
 * @param {object} options.keySplitter
 * @param {string[]} options.include
 * @param {string[]} options.exclude
 * @param {string[]} options.ignoredTypes
 * @return {object}
 */ function serialize(element, options = {}) {
    let data = {};
    options.keySplitter = options.keySplitter || keySplitter;
    options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
    options.inputReaders = new InputReaders(options.inputReaders || {});
    options.keyAssignmentValidators = new KeyAssignmentValidators(options.keyAssignmentValidators || {});
    Array.prototype.forEach.call(getInputElements(element, options), (el => {
        let type = getElementType(el);
        let key = options.keyExtractors.get(type)(el);
        let value = options.inputReaders.get(type)(el);
        if (options.keyAssignmentValidators.get(type)(el, key, value)) {
            let keychain = options.keySplitter(key);
            data = assignKeyValue(data, keychain, value);
        }
    }));
    return data;
}

class InputWriters extends TypeRegistry {
    constructor(options) {
        super(options);
        this.registerDefault(((el, value) => {
            el.value = value;
        }));
        this.register("checkbox", ((el, value) => {
            null === value ? el.indeterminate = true : el.checked = Array.isArray(value) ? -1 !== value.indexOf(el.value) : value;
        }));
        this.register("radio", (function(el, value) {
            void 0 !== value && (el.checked = el.value === value.toString());
        }));
        this.register("select", setSelectValue);
    }
}

/**
 * Write select values
 *
 * @see {@link https://github.com/jquery/jquery/blob/master/src/attributes/val.js|Github}
 * @param {object} Select element
 * @param {string|array} Select value
 */
function setSelectValue(elem, value) {
    var optionSet, option;
    var options = elem.options;
    var values = function(arr) {
        var ret = [];
        null !== arr && (Array.isArray(arr) ? ret.push.apply(ret, arr) : ret.push(arr));
        return ret;
    }(value);
    var i = options.length;
    for (;i--; ) {
        option = options[i];
        /* eslint-disable no-cond-assign */        if (values.indexOf(option.value) > -1) {
            option.setAttribute("selected", true);
            optionSet = true;
        }
        /* eslint-enable no-cond-assign */    }
    // Force browsers to behave consistently when non-matching value is set
        optionSet || (elem.selectedIndex = -1);
}

function keyJoiner(parentKey, childKey) {
    return parentKey + "[" + childKey + "]";
}

function flattenData(data, parentKey, options = {}) {
    let flatData = {};
    let keyJoiner$1 = options.keyJoiner || keyJoiner;
    for (let keyName in data) {
        if (!data.hasOwnProperty(keyName)) continue;
        let value = data[keyName];
        let hash = {};
        // If there is a parent key, join it with
        // the current, child key.
                parentKey && (keyName = keyJoiner$1(parentKey, keyName));
        if (Array.isArray(value)) {
            hash[keyName + "[]"] = value;
            hash[keyName] = value;
        } else "object" == typeof value ? hash = flattenData(value, keyName, options) : hash[keyName] = value;
        Object.assign(flatData, hash);
    }
    return flatData;
}

/**
 * Use the given JSON object to populate all of the form inputs, in this element.
 *
 * @param {HTMLElement} Root element
 * @param {object} options
 * @param {object} options.inputWriters
 * @param {object} options.keyExtractors
 * @param {object} options.keySplitter
 * @param {string[]} options.include
 * @param {string[]} options.exclude
 * @param {string[]} options.ignoredTypes
 */ function deserialize(form, data, options = {}) {
    let flattenedData = flattenData(data, null, options);
    options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
    options.inputWriters = new InputWriters(options.inputWriters || {});
    Array.prototype.forEach.call(getInputElements(form, options), (el => {
        let type = getElementType(el);
        let key = options.keyExtractors.get(type)(el);
        options.inputWriters.get(type)(el, flattenedData[key]);
    }));
}

/* Modified version of webext-options-sync from
  https://github.com/fregante/webext-options-sync

  Renamed chrome.* to messenger.*
  Use mail-ext-types.d.ts
  Remove lz4 compression
 */ var _a, _b;

const _backgroundPage = null === (_b = (_a = messenger.extension).getBackgroundPage) || void 0 === _b ? void 0 : _b.call(_a);

const _isExtensionContext = "object" == typeof messenger && messenger && "object" == typeof messenger.extension;

const globalWindow = "object" == typeof window ? window : void 0;

class OptionsSync {
    /**
    @constructor Returns an instance linked to the chosen storage.
    @param setup - Configuration for `webext-options-sync`
    */
    constructor({defaults: 
    // `as` reason: https://github.com/fregante/webext-options-sync/pull/21#issuecomment-500314074
    defaults = {}, storageName: storageName = "options", migrations: migrations = [], logging: logging = true} = {}) {
        Object.defineProperty(this, "storageName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_form", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_migrations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.storageName = storageName;
        this.defaults = defaults;
        this._handleFormInput = (delay = 300, atBegin = this._handleFormInput.bind(this), 
        void 0 === callback ? throttle(delay, atBegin, false) : throttle(delay, callback, false !== atBegin));
        var delay, atBegin, callback;
        this._handleStorageChangeOnForm = this._handleStorageChangeOnForm.bind(this);
        logging || (OptionsSync._log = () => {});
        this._migrations = this._runMigrations(migrations);
    }
    /**
    Retrieves all the options stored.

    @returns Promise that will resolve with **all** the options stored, as an object.

    @example
    const optionsStorage = new OptionsSync();
    const options = await optionsStorage.getAll();
    console.log('The user’s options are', options);
    if (options.color) {
        document.body.style.color = color;
    }
    */    async getAll() {
        await this._migrations;
        return this._getAll();
    }
    /**
    Overrides **all** the options stored with your `options`.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */    async setAll(newOptions) {
        await this._migrations;
        return this._setAll(newOptions);
    }
    /**
    Merges new options with the existing stored options.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */    async set(newOptions) {
        return this.setAll({
            ...await this.getAll(),
            ...newOptions
        });
    }
    /**
    Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved via `messenger.storage.sync`.

    @param selector - The `<form>` that needs to be synchronized or a CSS selector (one element).
    The form fields' `name` attributes will have to match the option names.
    */    async syncForm(form) {
        this._form = form instanceof HTMLFormElement ? form : document.querySelector(form);
        this._form.addEventListener("input", this._handleFormInput);
        this._form.addEventListener("submit", this._handleFormSubmit);
        messenger.storage.onChanged.addListener(this._handleStorageChangeOnForm);
        this._updateForm(this._form, await this.getAll());
    }
    /**
    Removes any listeners added by `syncForm`
    */    async stopSyncForm() {
        if (this._form) {
            this._form.removeEventListener("input", this._handleFormInput);
            this._form.removeEventListener("submit", this._handleFormSubmit);
            messenger.storage.onChanged.removeListener(this._handleStorageChangeOnForm);
            /* @ts-expect-error */            delete this._form;
        }
    }
    static _log(method, ...args) {
        console[method](...args);
    }
    async _getAll() {
        return new Promise(((resolve, reject) => {
            messenger.storage.sync.get(this.storageName).then((result => {
                messenger.runtime.lastError ? reject(messenger.runtime.lastError) : resolve(this._decode(result[this.storageName]));
            }));
        }));
    }
    async _setAll(newOptions) {
        OptionsSync._log("log", "Saving options", newOptions);
        return new Promise(((resolve, reject) => {
            messenger.storage.sync.set({
                [this.storageName]: this._encode(newOptions)
            }).then((() => {
                messenger.runtime.lastError ? reject(messenger.runtime.lastError) : resolve();
            }));
        }));
    }
    _encode(options) {
        const thinnedOptions = {
            ...options
        };
        for (const [key, value] of Object.entries(thinnedOptions)) this.defaults[key] === value && delete thinnedOptions[key];
        OptionsSync._log("log", "Without the default values", thinnedOptions);
        // return compressToEncodedURIComponent(JSON.stringify(thinnedOptions));
                return JSON.stringify(thinnedOptions);
    }
    _decode(options) {
        let decompressed = options;
        "string" == typeof options && (
        // decompressed = JSON.parse(decompressFromEncodedURIComponent(options)!);
        decompressed = JSON.parse(options));
        return {
            ...this.defaults,
            ...decompressed
        };
    }
    async _runMigrations(migrations) {
        if (0 === migrations.length || !(_isExtensionContext && void 0 !== _backgroundPage && _backgroundPage === globalWindow) || !await async function() {
            return new Promise((resolve => {
                var _a;
                const callback = installType => {
                    // Always run migrations during development #25
                    if ("development" !== installType) {
                        // Run migrations when the extension is installed or updated
                        messenger.runtime.onInstalled.addListener((() => resolve(true)));
                        // If `onInstalled` isn't fired, then migrations should not be run
                                                setTimeout(resolve, 500, false);
                    } else resolve(true);
                };
                (null === (_a = messenger.management) || void 0 === _a ? void 0 : _a.getSelf) ? messenger.management.getSelf().then((r => callback(r.installType))) : callback("unknown");
            }));
        }()) return;
        const options = await this._getAll();
        const initial = JSON.stringify(options);
        OptionsSync._log("log", "Found these stored options", {
            ...options
        });
        OptionsSync._log("info", "Will run", migrations.length, 1 === migrations.length ? "migration" : " migrations");
        migrations.forEach((migrate => migrate(options, this.defaults)));
        // Only save to storage if there were any changes
                initial !== JSON.stringify(options) && await this._setAll(options);
    }
    async _handleFormInput({target: target}) {
        const field = target;
        if (field.name) {
            await this.set(this._parseForm(field.form));
            field.form.dispatchEvent(new CustomEvent("options-sync:form-synced", {
                bubbles: true
            }));
        }
    }
    _handleFormSubmit(event) {
        event.preventDefault();
    }
    _updateForm(form, options) {
        // Reduce changes to only values that have changed
        const currentFormState = this._parseForm(form);
        for (const [key, value] of Object.entries(options)) currentFormState[key] === value && delete options[key];
        const include = Object.keys(options);
        include.length > 0 && 
        // Limits `deserialize` to only the specified fields. Without it, it will try to set the every field, even if they're missing from the supplied `options`
        deserialize(form, options, {
            include: include
        });
    }
    // Parse form into object, except invalid fields
    _parseForm(form) {
        const include = [];
        // Don't serialize disabled and invalid fields
                for (const field of form.querySelectorAll("[name]")) field.validity.valid && !field.disabled && include.push(field.name.replace(/\[.*]/, ""));
        return serialize(form, {
            include: include
        });
    }
    _handleStorageChangeOnForm(changes, areaName) {
        "sync" !== areaName || !changes[this.storageName] || document.hasFocus() && this._form.contains(document.activeElement) || this._updateForm(this._form, this._decode(changes[this.storageName].newValue));
    }
}

Object.defineProperty(OptionsSync, "migrations", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        /**
        Helper method that removes any option that isn't defined in the defaults. It's useful to avoid leaving old options taking up space.
        */
        removeUnused(options, defaults) {
            for (const key of Object.keys(options)) key in defaults || delete options[key];
        }
    }
});

export default OptionsSync;
