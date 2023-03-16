/**
 * mailext-options-sync.js":
 * https://gitlab.com/jfx2006/mailext-options-sync
 */

/* eslint-disable no-undefined,no-param-reassign,no-shadow */
/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param {number} delay -                  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher)
 *                                            are most useful.
 * @param {Function} callback -               A function to be executed after delay milliseconds. The `this` context and all arguments are passed through,
 *                                            as-is, to `callback` when the throttled-function is executed.
 * @param {object} [options] -              An object to configure options.
 * @param {boolean} [options.noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds
 *                                            while the throttled-function is being called. If noTrailing is false or unspecified, callback will be executed
 *                                            one final time after the last throttled-function call. (After the throttled-function has not been called for
 *                                            `delay` milliseconds, the internal counter is reset).
 * @param {boolean} [options.noLeading] -   Optional, defaults to false. If noLeading is false, the first throttled-function call will execute callback
 *                                            immediately. If noLeading is true, the first the callback execution will be skipped. It should be noted that
 *                                            callback will never executed if both noLeading = true and noTrailing = true.
 * @param {boolean} [options.debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is
 *                                            false (at end), schedule `callback` to execute after `delay` ms.
 *
 * @returns {Function} A new, throttled, function.
 */
function throttle(delay, callback, options) {
  var _ref = options || {},
    _ref$noTrailing = _ref.noTrailing,
    noTrailing = void 0 !== _ref$noTrailing && _ref$noTrailing,
    _ref$noLeading = _ref.noLeading,
    noLeading = void 0 !== _ref$noLeading && _ref$noLeading,
    _ref$debounceMode = _ref.debounceMode,
    debounceMode = void 0 === _ref$debounceMode ? void 0 : _ref$debounceMode

  /*
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */ var timeoutID
  var cancelled = false // Keep track of the last time `callback` was executed.
  var lastExec = 0 // Function to clear existing timeout
  function clearExistingTimeout() {
    timeoutID && clearTimeout(timeoutID)
  } // Function to cancel next exec
  function cancel(options) {
    var _ref2$upcomingOnly = (options || {}).upcomingOnly,
      upcomingOnly = void 0 !== _ref2$upcomingOnly && _ref2$upcomingOnly
    clearExistingTimeout()
    cancelled = !upcomingOnly
  }
  /*
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */ function wrapper() {
    for (
      var _len = arguments.length, arguments_ = new Array(_len), _key = 0;
      _key < _len;
      _key++
    )
      arguments_[_key] = arguments[_key]
    var self = this
    var elapsed = Date.now() - lastExec
    if (!cancelled) {
      noLeading ||
        !debounceMode ||
        timeoutID ||
        /*
         * Since `wrapper` is being called for the first time and
         * `debounceMode` is true (at begin), execute `callback`
         * and noLeading != true.
         */
        exec()
      clearExistingTimeout()
      if (void 0 === debounceMode && elapsed > delay)
        if (noLeading) {
          /*
           * In throttle mode with noLeading, if `delay` time has
           * been exceeded, update `lastExec` and schedule `callback`
           * to execute after `delay` ms.
           */
          lastExec = Date.now()
          noTrailing ||
            (timeoutID = setTimeout(debounceMode ? clear : exec, delay))
        } else exec()
        /*
         * In throttle mode without noLeading, if `delay` time has been exceeded, execute
         * `callback`.
         */
      else
        true !== noTrailing &&
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
          (timeoutID = setTimeout(
            debounceMode ? clear : exec,
            void 0 === debounceMode ? delay - elapsed : delay
          ))
    } // Execute `callback` and update the `lastExec` timestamp.
    function exec() {
      lastExec = Date.now()
      callback.apply(self, arguments_)
    }
    /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */ function clear() {
      timeoutID = void 0
    }
  }
  wrapper.cancel = cancel // Return the wrapper function.
  return wrapper
}
/* eslint-disable no-undefined */
/**
 * Debounce execution of a function. Debouncing, unlike throttling,
 * guarantees that a function is only executed a single time, either at the
 * very beginning of a series of calls, or at the very end.
 *
 * @param {number} delay -               A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param {Function} callback -          A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                        to `callback` when the debounced-function is executed.
 * @param {object} [options] -           An object to configure options.
 * @param {boolean} [options.atBegin] -  Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
 *                                        after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
 *                                        (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
 *
 * @returns {Function} A new, debounced function.
 */ function debounce(delay, callback, options) {
  var _ref$atBegin = (options || {}).atBegin
  return throttle(delay, callback, {
    debounceMode: false !== (void 0 !== _ref$atBegin && _ref$atBegin),
  })
}
function isCurrentPathname(path) {
  if (!path) return false
  try {
    const { pathname: pathname } = new URL(path, location.origin)
    return pathname === location.pathname
  } catch {
    return false
  }
}
function getManifest(_version) {
  return globalThis.chrome?.runtime?.getManifest?.()
}
function once(function_) {
  let result
  return () => {
    void 0 === result && (result = function_())
    return result
  }
}
/** Indicates whether the code is being run in a background context */ const isBackground =
  () => isBackgroundPage() || isBackgroundWorker()
/** Indicates whether the code is being run in a background page */
const isBackgroundPage = once(() => {
  const manifest = getManifest()
  return (
    !(
      !manifest ||
      !isCurrentPathname(manifest.background_page || manifest.background?.page)
    ) ||
    Boolean(
      manifest?.background?.scripts &&
        isCurrentPathname("/_generated_background_page.html")
    )
  )
})

/** Indicates whether the code is being run in a background worker */ const isBackgroundWorker =
  once(() => isCurrentPathname(getManifest()?.background?.service_worker))
var _typeof =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function (obj) {
        return typeof obj
      }
    : function (obj) {
        return obj &&
          "function" == typeof Symbol &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj
      }
var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor))
    throw new TypeError("Cannot call a class as a function")
}
var createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      "value" in descriptor && (descriptor.writable = true)
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function (Constructor, protoProps, staticProps) {
    protoProps && defineProperties(Constructor.prototype, protoProps)
    staticProps && defineProperties(Constructor, staticProps)
    return Constructor
  }
})()
var inherits = function (subClass, superClass) {
  if ("function" != typeof superClass && null !== superClass)
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    )
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  })
  superClass &&
    (Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass))
}
var possibleConstructorReturn = function (self, call) {
  if (!self)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    )
  return !call || ("object" != typeof call && "function" != typeof call)
    ? self
    : call
}
var TypeRegistry = (function () {
  function TypeRegistry() {
    var initial =
      arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    classCallCheck(this, TypeRegistry)
    this.registeredTypes = initial
  }
  createClass(TypeRegistry, [
    {
      key: "get",
      value: function (type) {
        return void 0 !== this.registeredTypes[type]
          ? this.registeredTypes[type]
          : this.registeredTypes.default
      },
    },
    {
      key: "register",
      value: function (type, item) {
        void 0 === this.registeredTypes[type] &&
          (this.registeredTypes[type] = item)
      },
    },
    {
      key: "registerDefault",
      value: function (item) {
        this.register("default", item)
      },
    },
  ])
  return TypeRegistry
})()
var KeyExtractors = (function (_TypeRegistry) {
  inherits(KeyExtractors, TypeRegistry)
  function KeyExtractors(options) {
    classCallCheck(this, KeyExtractors)
    var _this = possibleConstructorReturn(
      this,
      (KeyExtractors.__proto__ || Object.getPrototypeOf(KeyExtractors)).call(
        this,
        options
      )
    )
    _this.registerDefault(function (el) {
      return el.getAttribute("name") || ""
    })
    return _this
  }
  return KeyExtractors
})()
var InputReaders = (function (_TypeRegistry) {
  inherits(InputReaders, TypeRegistry)
  function InputReaders(options) {
    classCallCheck(this, InputReaders)
    var _this = possibleConstructorReturn(
      this,
      (InputReaders.__proto__ || Object.getPrototypeOf(InputReaders)).call(
        this,
        options
      )
    )
    _this.registerDefault(function (el) {
      return el.value
    })
    _this.register("checkbox", function (el) {
      return null !== el.getAttribute("value")
        ? el.checked
          ? el.getAttribute("value")
          : null
        : el.checked
    })
    _this.register("select", function (el) {
      return getSelectValue(el)
    })
    return _this
  }
  return InputReaders
})()
function getSelectValue(elem) {
  var value, option, i
  var options = elem.options
  var index = elem.selectedIndex
  var one = "select-one" === elem.type
  var values = one ? null : []
  var max = one ? index + 1 : options.length
  i = index < 0 ? max : one ? index : 0 // Loop through all the selected options
  for (; i < max; i++)
    // Support: IE <=9 only
    // IE8-9 doesn't update selected after form reset
    if (
      ((option = options[i]).selected || i === index) &&
      // Don't return options that are disabled or in a disabled optgroup
      !option.disabled &&
      !(
        option.parentNode.disabled &&
        "optgroup" === option.parentNode.tagName.toLowerCase()
      )
    ) {
      // Get the specific value for the option
      value = option.value // We don't need an array for one selects
      if (one) return value // Multi-Selects return an array
      values.push(value)
    }
  return values
}
var KeyAssignmentValidators = (function (_TypeRegistry) {
  inherits(KeyAssignmentValidators, TypeRegistry)
  function KeyAssignmentValidators(options) {
    classCallCheck(this, KeyAssignmentValidators)
    var _this = possibleConstructorReturn(
      this,
      (
        KeyAssignmentValidators.__proto__ ||
        Object.getPrototypeOf(KeyAssignmentValidators)
      ).call(this, options)
    )
    _this.registerDefault(function () {
      return true
    })
    _this.register("radio", function (el) {
      return el.checked
    })
    return _this
  }
  return KeyAssignmentValidators
})()
function keySplitter(key) {
  var matches = key.match(/[^[\]]+/g)
  var lastKey = void 0
  if (key.length > 1 && key.indexOf("[]") === key.length - 2) {
    lastKey = matches.pop()
    matches.push([lastKey])
  }
  return matches
}
function getElementType(el) {
  var tagName = el.tagName
  var type = tagName
  "input" === tagName.toLowerCase() &&
    (type = el.getAttribute("type") || "text")
  return type.toLowerCase()
}
function getInputElements(element, options) {
  return Array.prototype.filter.call(
    element.querySelectorAll("input,select,textarea"),
    function (el) {
      if (
        "input" === el.tagName.toLowerCase() &&
        ("submit" === el.type || "reset" === el.type)
      )
        return false
      var myType = getElementType(el)
      var identifier = options.keyExtractors.get(myType)(el)
      var foundInInclude = -1 !== (options.include || []).indexOf(identifier)
      var foundInExclude = -1 !== (options.exclude || []).indexOf(identifier)
      var foundInIgnored = false
      if (options.ignoredTypes) {
        var _iteratorNormalCompletion = true
        var _didIteratorError = false
        var _iteratorError = void 0
        try {
          for (
            var _step, _iterator = options.ignoredTypes[Symbol.iterator]();
            !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
            _iteratorNormalCompletion = true
          ) {
            var selector = _step.value
            el.matches(selector) && (foundInIgnored = true)
          }
        } catch (err) {
          _didIteratorError = true
          _iteratorError = err
        } finally {
          try {
            !_iteratorNormalCompletion && _iterator.return && _iterator.return()
          } finally {
            if (_didIteratorError) throw _iteratorError
          }
        }
      }
      return !(
        !foundInInclude &&
        (!!options.include || foundInExclude || foundInIgnored)
      )
    }
  )
}
function assignKeyValue(obj, keychain, value) {
  if (!keychain) return obj
  var key = keychain.shift() // build the current object we need to store data

  obj[key] || (obj[key] = Array.isArray(key) ? [] : {}) // if it's the last key in the chain, assign the value directly
  0 === keychain.length &&
    (Array.isArray(obj[key])
      ? null !== value && obj[key].push(value)
      : (obj[key] = value)) // recursive parsing of the array, depth-first
  keychain.length > 0 && assignKeyValue(obj[key], keychain, value)
  return obj
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
 */ function serialize(element) {
  var options =
    arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
  var data = {}
  options.keySplitter = options.keySplitter || keySplitter
  options.keyExtractors = new KeyExtractors(options.keyExtractors || {})
  options.inputReaders = new InputReaders(options.inputReaders || {})
  options.keyAssignmentValidators = new KeyAssignmentValidators(
    options.keyAssignmentValidators || {}
  )
  Array.prototype.forEach.call(
    getInputElements(element, options),
    function (el) {
      var type = getElementType(el)
      var key = options.keyExtractors.get(type)(el)
      var value = options.inputReaders.get(type)(el)
      if (options.keyAssignmentValidators.get(type)(el, key, value)) {
        var keychain = options.keySplitter(key)
        data = assignKeyValue(data, keychain, value)
      }
    }
  )
  return data
}
var InputWriters = (function (_TypeRegistry) {
  inherits(InputWriters, TypeRegistry)
  function InputWriters(options) {
    classCallCheck(this, InputWriters)
    var _this = possibleConstructorReturn(
      this,
      (InputWriters.__proto__ || Object.getPrototypeOf(InputWriters)).call(
        this,
        options
      )
    )
    _this.registerDefault(function (el, value) {
      el.value = value
    })
    _this.register("checkbox", function (el, value) {
      null === value
        ? (el.indeterminate = true)
        : (el.checked = Array.isArray(value)
            ? -1 !== value.indexOf(el.value)
            : value)
    })
    _this.register("radio", function (el, value) {
      void 0 !== value && (el.checked = el.value === value.toString())
    })
    _this.register("select", setSelectValue)
    return _this
  }
  return InputWriters
})()
function makeArray(arr) {
  var ret = []
  null !== arr &&
    (Array.isArray(arr) ? ret.push.apply(ret, arr) : ret.push(arr))
  return ret
}
/**
 * Write select values
 *
 * @see {@link https://github.com/jquery/jquery/blob/master/src/attributes/val.js|Github}
 * @param {object} Select element
 * @param {string|array} Select value
 */ function setSelectValue(elem, value) {
  var optionSet, option
  var options = elem.options
  var values = makeArray(value)
  var i = options.length
  for (; i--; ) {
    option = options[i]
    /* eslint-disable no-cond-assign */ if (values.indexOf(option.value) > -1) {
      option.setAttribute("selected", true)
      optionSet = true
    }
    /* eslint-enable no-cond-assign */
  }
  // Force browsers to behave consistently when non-matching value is set
  optionSet || (elem.selectedIndex = -1)
}
function keyJoiner(parentKey, childKey) {
  return parentKey + "[" + childKey + "]"
}
function flattenData(data, parentKey) {
  var options =
    arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
  var flatData = {}
  var keyJoiner$$ = options.keyJoiner || keyJoiner
  for (var keyName in data)
    if (data.hasOwnProperty(keyName)) {
      var value = data[keyName]
      var hash = {} // If there is a parent key, join it with

      // the current, child key.
      parentKey && (keyName = keyJoiner$$(parentKey, keyName))
      if (Array.isArray(value)) {
        hash[keyName + "[]"] = value
        hash[keyName] = value
      } else
        "object" === (void 0 === value ? "undefined" : _typeof(value))
          ? (hash = flattenData(value, keyName, options))
          : (hash[keyName] = value)
      Object.assign(flatData, hash)
    }
  return flatData
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
 */ function deserialize(form, data) {
  var options =
    arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
  var flattenedData = flattenData(data, null, options)
  options.keyExtractors = new KeyExtractors(options.keyExtractors || {})
  options.inputWriters = new InputWriters(options.inputWriters || {})
  Array.prototype.forEach.call(getInputElements(form, options), function (el) {
    var type = getElementType(el)
    var key = options.keyExtractors.get(type)(el)
    options.inputWriters.get(type)(el, flattenedData[key])
  })
}
/* @license
   Modified version of webext-options-sync from
   https://github.com/fregante/webext-options-sync

   Renamed chrome.* to messenger.*
   Use mail-ext-types.d.ts
   Remove lz4 compression
   Async migration functions
 */ async function shouldRunMigrations() {
  const self = await messenger.management?.getSelf() // Always run migrations during development #25

  return (
    "development" === self?.installType ||
    new Promise((resolve) => {
      // Run migrations when the extension is installed or updated
      messenger.runtime.onInstalled.addListener(() => {
        resolve(true)
      }) // If `onInstalled` isn't fired, then migrations should not be run
      setTimeout(resolve, 500, false)
    })
  )
}
class OptionsSync {
  static migrations = {
    /**
        Helper method that removes any option that isn't defined in the defaults. It's useful to avoid leaving old options taking up space.
        */
    removeUnused(options, defaults) {
      for (const key of Object.keys(options))
        key in defaults || delete options[key]
    },
  }
  storageType
  defaults
  _form
  _migrations /**
    @constructor Returns an instance linked to the chosen storage.
    @param setup - Configuration for `webext-options-sync`
    */
  constructor({
    defaults:
      // `as` reason: https://github.com/fregante/webext-options-sync/pull/21#issuecomment-500314074
      defaults = {},
    migrations: migrations = [],
    logging: logging = true,
    storageType: storageType = "sync",
  } = {}) {
    this.defaults = defaults
    this.storageType = storageType
    logging || (this._log = () => {})
    this._migrations = this._runMigrations(migrations)
  }
  get storage() {
    return messenger.storage[this.storageType]
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
    */ async getAll() {
    await this._migrations
    return this._getAll()
  }
  /**
    Retrieves stored options for given keys.

    @param _keys - A single string key or an array of strings of keys to retrieve
    @returns Promise that will resolve with the options stored for the keys.

    @example
    const optionsStorage = new OptionsSync();
    const options = await optionsStorage.get("color");
    console.log('The user’s options are', options);
    if (options.color) {
        document.body.style.color = color;
    }
     */ async get(_keys) {
    await this._migrations
    return this._get(_keys)
  }
  /**
    Overrides **all** the options stored with your `options`.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */ async setAll(newOptions) {
    await this._migrations
    return this._setAll(newOptions)
  }
  /**
    Merges new options with the existing stored options.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */ async set(newOptions) {
    return this.setAll({ ...(await this.getAll()), ...newOptions })
  }
  /**
     Reset a field or fields to the default value(s).
     @param _key - A single string key or an array of strings of keys to reset
     @returns Promise that will resolve with the default values of the given options

     @example
     optionsStorage.reset("color");
     */ async reset(_key) {
    await this._migrations
    try {
      await this._remove(_key)
      this._form && this._updateForm(this._form, await this.get(_key))
    } catch {}
  }
  /**
    Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage

    @param selector - The `<form>` that needs to be synchronized or a CSS selector (one element).
    The form fields' `name` attributes will have to match the option names.
    */ async syncForm(form) {
    this._form =
      form instanceof HTMLFormElement ? form : document.querySelector(form)
    this._form.addEventListener("input", this._handleFormInput)
    this._form.addEventListener("submit", this._handleFormSubmit)
    messenger.storage.onChanged.addListener(this._handleStorageChangeOnForm)
    this._updateForm(this._form, await this.getAll())
  }
  /**
    Removes any listeners added by `syncForm`
    */ async stopSyncForm() {
    if (this._form) {
      this._form.removeEventListener("input", this._handleFormInput)
      this._form.removeEventListener("submit", this._handleFormSubmit)
      messenger.storage.onChanged.removeListener(
        this._handleStorageChangeOnForm
      )
      delete this._form
    }
  }
  _log(method, ...args) {
    console[method](...args)
  }
  async _getAll() {
    const _keys = Object.keys(this.defaults)
    const storageResults = await this.storage.get(_keys)
    for (const key of Object.keys(this.defaults))
      storageResults[key] || (storageResults[key] = this.defaults[key])
    return storageResults
  }
  async _get(_keys) {
    "string" == typeof _keys && (_keys = [_keys])
    const storageResults = await this.storage.get(_keys)
    // eslint-disable-next-line no-prototype-builtins
    for (const key of _keys)
      !storageResults.hasOwnProperty(key) &&
        this.defaults.hasOwnProperty(key) &&
        (storageResults[key] = this.defaults[key]) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return storageResults
  }
  async _setAll(newOptions) {
    await this.storage.set(newOptions)
  }
  async _remove(_key) {
    await this.storage.remove(_key)
  }
  async _runMigrations(migrations) {
    if (
      0 === migrations.length ||
      !isBackground() ||
      !(await shouldRunMigrations())
    )
      return
    const options = await this._getAll()
    this._log(
      "info",
      "Will run",
      migrations.length,
      1 === migrations.length ? "migration" : " migrations"
    )
    let _migrateFunc
    for (_migrateFunc of migrations) {
      const changes = await _migrateFunc(options, this.defaults)
      null !== changes && (await this._setAll(changes))
    }
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering -- Needs to be near _handleFormSubmit
  _handleFormInput = debounce(300, async ({ target: target }) => {
    const field = target
    if (field.name) {
      await this.set(this._parseForm(field.form))
      field.form.dispatchEvent(
        new CustomEvent("options-sync:form-synced", { bubbles: true })
      )
    }
  })
  _handleFormSubmit(event) {
    event.preventDefault()
  }
  _updateForm(form, options) {
    // Reduce changes to only values that have changed
    const currentFormState = this._parseForm(form)
    for (const [key, value] of Object.entries(options))
      currentFormState[key] === value && delete options[key]
    const include = Object.keys(options)
    include.length > 0 &&
      // Limits `deserialize` to only the specified fields. Without it, it will try to set the every field, even if they're missing from the supplied `options`
      deserialize(form, options, { include: include })
  }
  // Parse form into object, except invalid fields
  _parseForm(form) {
    const include = [] // Don't serialize disabled and invalid fields

    for (const field of form.querySelectorAll("[name]"))
      field.validity.valid &&
        !field.disabled &&
        include.push(field.name.replace(/\[.*]/, ""))
    return serialize(form, { include: include })
  }
  _handleStorageChangeOnForm = (changes, areaName) => {
    areaName !== this.storageType ||
      !changes ||
      !changes.newValue ||
      (document.hasFocus() && this._form.contains(document.activeElement)) ||
      this._updateForm(this._form, changes.newValue)
  }
}
export { OptionsSync as default }
