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

// node_modules/.pnpm/seedrandom@3.0.5/node_modules/seedrandom/lib/alea.js
var require_alea = __commonJS({
  "node_modules/.pnpm/seedrandom@3.0.5/node_modules/seedrandom/lib/alea.js"(exports, module) {
    (function(global, module2, define2) {
      function Alea(seed) {
        var me = this, mash = Mash();
        me.next = function() {
          var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
          me.s0 = me.s1;
          me.s1 = me.s2;
          return me.s2 = t - (me.c = t | 0);
        };
        me.c = 1;
        me.s0 = mash(" ");
        me.s1 = mash(" ");
        me.s2 = mash(" ");
        me.s0 -= mash(seed);
        if (me.s0 < 0) {
          me.s0 += 1;
        }
        me.s1 -= mash(seed);
        if (me.s1 < 0) {
          me.s1 += 1;
        }
        me.s2 -= mash(seed);
        if (me.s2 < 0) {
          me.s2 += 1;
        }
        mash = null;
      }
      function copy(f2, t) {
        t.c = f2.c;
        t.s0 = f2.s0;
        t.s1 = f2.s1;
        t.s2 = f2.s2;
        return t;
      }
      function impl(seed, opts) {
        var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
        prng.int32 = function() {
          return xg.next() * 4294967296 | 0;
        };
        prng.double = function() {
          return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
        };
        prng.quick = prng;
        if (state) {
          if (typeof state == "object") copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      function Mash() {
        var n2 = 4022871197;
        var mash = function(data) {
          data = String(data);
          for (var i3 = 0; i3 < data.length; i3++) {
            n2 += data.charCodeAt(i3);
            var h2 = 0.02519603282416938 * n2;
            n2 = h2 >>> 0;
            h2 -= n2;
            h2 *= n2;
            n2 = h2 >>> 0;
            h2 -= n2;
            n2 += h2 * 4294967296;
          }
          return (n2 >>> 0) * 23283064365386963e-26;
        };
        return mash;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.alea = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/.pnpm/moo@0.5.2/node_modules/moo/moo.js
var require_moo = __commonJS({
  "node_modules/.pnpm/moo@0.5.2/node_modules/moo/moo.js"(exports, module) {
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        define([], factory);
      } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.moo = factory();
      }
    })(exports, function() {
      "use strict";
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var toString = Object.prototype.toString;
      var hasSticky = typeof new RegExp().sticky === "boolean";
      function isRegExp(o) {
        return o && toString.call(o) === "[object RegExp]";
      }
      function isObject(o) {
        return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
      }
      function reEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      function reGroups(s) {
        var re = new RegExp("|" + s);
        return re.exec("").length - 1;
      }
      function reCapture(s) {
        return "(" + s + ")";
      }
      function reUnion(regexps) {
        if (!regexps.length) return "(?!)";
        var source = regexps.map(function(s) {
          return "(?:" + s + ")";
        }).join("|");
        return "(?:" + source + ")";
      }
      function regexpOrLiteral(obj) {
        if (typeof obj === "string") {
          return "(?:" + reEscape(obj) + ")";
        } else if (isRegExp(obj)) {
          if (obj.ignoreCase) throw new Error("RegExp /i flag not allowed");
          if (obj.global) throw new Error("RegExp /g flag is implied");
          if (obj.sticky) throw new Error("RegExp /y flag is implied");
          if (obj.multiline) throw new Error("RegExp /m flag is implied");
          return obj.source;
        } else {
          throw new Error("Not a pattern: " + obj);
        }
      }
      function pad(s, length) {
        if (s.length > length) {
          return s;
        }
        return Array(length - s.length + 1).join(" ") + s;
      }
      function lastNLines(string, numLines) {
        var position = string.length;
        var lineBreaks = 0;
        while (true) {
          var idx = string.lastIndexOf("\n", position - 1);
          if (idx === -1) {
            break;
          } else {
            lineBreaks++;
          }
          position = idx;
          if (lineBreaks === numLines) {
            break;
          }
          if (position === 0) {
            break;
          }
        }
        var startPosition = lineBreaks < numLines ? 0 : position + 1;
        return string.substring(startPosition).split("\n");
      }
      function objectToRules(object) {
        var keys = Object.getOwnPropertyNames(object);
        var result = [];
        for (var i3 = 0; i3 < keys.length; i3++) {
          var key = keys[i3];
          var thing = object[key];
          var rules = [].concat(thing);
          if (key === "include") {
            for (var j = 0; j < rules.length; j++) {
              result.push({ include: rules[j] });
            }
            continue;
          }
          var match = [];
          rules.forEach(function(rule) {
            if (isObject(rule)) {
              if (match.length) result.push(ruleOptions(key, match));
              result.push(ruleOptions(key, rule));
              match = [];
            } else {
              match.push(rule);
            }
          });
          if (match.length) result.push(ruleOptions(key, match));
        }
        return result;
      }
      function arrayToRules(array) {
        var result = [];
        for (var i3 = 0; i3 < array.length; i3++) {
          var obj = array[i3];
          if (obj.include) {
            var include = [].concat(obj.include);
            for (var j = 0; j < include.length; j++) {
              result.push({ include: include[j] });
            }
            continue;
          }
          if (!obj.type) {
            throw new Error("Rule has no type: " + JSON.stringify(obj));
          }
          result.push(ruleOptions(obj.type, obj));
        }
        return result;
      }
      function ruleOptions(type, obj) {
        if (!isObject(obj)) {
          obj = { match: obj };
        }
        if (obj.include) {
          throw new Error("Matching rules cannot also include states");
        }
        var options = {
          defaultType: type,
          lineBreaks: !!obj.error || !!obj.fallback,
          pop: false,
          next: null,
          push: null,
          error: false,
          fallback: false,
          value: null,
          type: null,
          shouldThrow: false
        };
        for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            options[key] = obj[key];
          }
        }
        if (typeof options.type === "string" && type !== options.type) {
          throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')");
        }
        var match = options.match;
        options.match = Array.isArray(match) ? match : match ? [match] : [];
        options.match.sort(function(a, b2) {
          return isRegExp(a) && isRegExp(b2) ? 0 : isRegExp(b2) ? -1 : isRegExp(a) ? 1 : b2.length - a.length;
        });
        return options;
      }
      function toRules(spec) {
        return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
      }
      var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
      function compileRules(rules, hasStates) {
        var errorRule = null;
        var fast = /* @__PURE__ */ Object.create(null);
        var fastAllowed = true;
        var unicodeFlag = null;
        var groups = [];
        var parts = [];
        for (var i3 = 0; i3 < rules.length; i3++) {
          if (rules[i3].fallback) {
            fastAllowed = false;
          }
        }
        for (var i3 = 0; i3 < rules.length; i3++) {
          var options = rules[i3];
          if (options.include) {
            throw new Error("Inheritance is not allowed in stateless lexers");
          }
          if (options.error || options.fallback) {
            if (errorRule) {
              if (!options.fallback === !errorRule.fallback) {
                throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
              } else {
                throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
              }
            }
            errorRule = options;
          }
          var match = options.match.slice();
          if (fastAllowed) {
            while (match.length && typeof match[0] === "string" && match[0].length === 1) {
              var word = match.shift();
              fast[word.charCodeAt(0)] = options;
            }
          }
          if (options.pop || options.push || options.next) {
            if (!hasStates) {
              throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
            }
            if (options.fallback) {
              throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
            }
          }
          if (match.length === 0) {
            continue;
          }
          fastAllowed = false;
          groups.push(options);
          for (var j = 0; j < match.length; j++) {
            var obj = match[j];
            if (!isRegExp(obj)) {
              continue;
            }
            if (unicodeFlag === null) {
              unicodeFlag = obj.unicode;
            } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
              throw new Error("If one rule is /u then all must be");
            }
          }
          var pat = reUnion(match.map(regexpOrLiteral));
          var regexp = new RegExp(pat);
          if (regexp.test("")) {
            throw new Error("RegExp matches empty string: " + regexp);
          }
          var groupCount = reGroups(pat);
          if (groupCount > 0) {
            throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
          }
          if (!options.lineBreaks && regexp.test("\n")) {
            throw new Error("Rule should declare lineBreaks: " + regexp);
          }
          parts.push(reCapture(pat));
        }
        var fallbackRule = errorRule && errorRule.fallback;
        var flags = hasSticky && !fallbackRule ? "ym" : "gm";
        var suffix = hasSticky || fallbackRule ? "" : "|";
        if (unicodeFlag === true) flags += "u";
        var combined = new RegExp(reUnion(parts) + suffix, flags);
        return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
      }
      function compile(rules) {
        var result = compileRules(toRules(rules));
        return new Lexer({ start: result }, "start");
      }
      function checkStateGroup(g2, name, map) {
        var state = g2 && (g2.push || g2.next);
        if (state && !map[state]) {
          throw new Error("Missing state '" + state + "' (in token '" + g2.defaultType + "' of state '" + name + "')");
        }
        if (g2 && g2.pop && +g2.pop !== 1) {
          throw new Error("pop must be 1 (in token '" + g2.defaultType + "' of state '" + name + "')");
        }
      }
      function compileStates(states, start) {
        var all = states.$all ? toRules(states.$all) : [];
        delete states.$all;
        var keys = Object.getOwnPropertyNames(states);
        if (!start) start = keys[0];
        var ruleMap = /* @__PURE__ */ Object.create(null);
        for (var i3 = 0; i3 < keys.length; i3++) {
          var key = keys[i3];
          ruleMap[key] = toRules(states[key]).concat(all);
        }
        for (var i3 = 0; i3 < keys.length; i3++) {
          var key = keys[i3];
          var rules = ruleMap[key];
          var included = /* @__PURE__ */ Object.create(null);
          for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (!rule.include) continue;
            var splice = [j, 1];
            if (rule.include !== key && !included[rule.include]) {
              included[rule.include] = true;
              var newRules = ruleMap[rule.include];
              if (!newRules) {
                throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
              }
              for (var k = 0; k < newRules.length; k++) {
                var newRule = newRules[k];
                if (rules.indexOf(newRule) !== -1) continue;
                splice.push(newRule);
              }
            }
            rules.splice.apply(rules, splice);
            j--;
          }
        }
        var map = /* @__PURE__ */ Object.create(null);
        for (var i3 = 0; i3 < keys.length; i3++) {
          var key = keys[i3];
          map[key] = compileRules(ruleMap[key], true);
        }
        for (var i3 = 0; i3 < keys.length; i3++) {
          var name = keys[i3];
          var state = map[name];
          var groups = state.groups;
          for (var j = 0; j < groups.length; j++) {
            checkStateGroup(groups[j], name, map);
          }
          var fastKeys = Object.getOwnPropertyNames(state.fast);
          for (var j = 0; j < fastKeys.length; j++) {
            checkStateGroup(state.fast[fastKeys[j]], name, map);
          }
        }
        return new Lexer(map, start);
      }
      function keywordTransform(map) {
        var isMap = typeof Map !== "undefined";
        var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
        var types = Object.getOwnPropertyNames(map);
        for (var i3 = 0; i3 < types.length; i3++) {
          var tokenType = types[i3];
          var item = map[tokenType];
          var keywordList = Array.isArray(item) ? item : [item];
          keywordList.forEach(function(keyword) {
            if (typeof keyword !== "string") {
              throw new Error("keyword must be string (in keyword '" + tokenType + "')");
            }
            if (isMap) {
              reverseMap.set(keyword, tokenType);
            } else {
              reverseMap[keyword] = tokenType;
            }
          });
        }
        return function(k) {
          return isMap ? reverseMap.get(k) : reverseMap[k];
        };
      }
      var Lexer = function(states, state) {
        this.startState = state;
        this.states = states;
        this.buffer = "";
        this.stack = [];
        this.reset();
      };
      Lexer.prototype.reset = function(data, info) {
        this.buffer = data || "";
        this.index = 0;
        this.line = info ? info.line : 1;
        this.col = info ? info.col : 1;
        this.queuedToken = info ? info.queuedToken : null;
        this.queuedText = info ? info.queuedText : "";
        this.queuedThrow = info ? info.queuedThrow : null;
        this.setState(info ? info.state : this.startState);
        this.stack = info && info.stack ? info.stack.slice() : [];
        return this;
      };
      Lexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.col,
          state: this.state,
          stack: this.stack.slice(),
          queuedToken: this.queuedToken,
          queuedText: this.queuedText,
          queuedThrow: this.queuedThrow
        };
      };
      Lexer.prototype.setState = function(state) {
        if (!state || this.state === state) return;
        this.state = state;
        var info = this.states[state];
        this.groups = info.groups;
        this.error = info.error;
        this.re = info.regexp;
        this.fast = info.fast;
      };
      Lexer.prototype.popState = function() {
        this.setState(this.stack.pop());
      };
      Lexer.prototype.pushState = function(state) {
        this.stack.push(this.state);
        this.setState(state);
      };
      var eat = hasSticky ? function(re, buffer) {
        return re.exec(buffer);
      } : function(re, buffer) {
        var match = re.exec(buffer);
        if (match[0].length === 0) {
          return null;
        }
        return match;
      };
      Lexer.prototype._getGroup = function(match) {
        var groupCount = this.groups.length;
        for (var i3 = 0; i3 < groupCount; i3++) {
          if (match[i3 + 1] !== void 0) {
            return this.groups[i3];
          }
        }
        throw new Error("Cannot find token type for matched text");
      };
      function tokenToString() {
        return this.value;
      }
      Lexer.prototype.next = function() {
        var index = this.index;
        if (this.queuedGroup) {
          var token = this._token(this.queuedGroup, this.queuedText, index);
          this.queuedGroup = null;
          this.queuedText = "";
          return token;
        }
        var buffer = this.buffer;
        if (index === buffer.length) {
          return;
        }
        var group = this.fast[buffer.charCodeAt(index)];
        if (group) {
          return this._token(group, buffer.charAt(index), index);
        }
        var re = this.re;
        re.lastIndex = index;
        var match = eat(re, buffer);
        var error = this.error;
        if (match == null) {
          return this._token(error, buffer.slice(index, buffer.length), index);
        }
        var group = this._getGroup(match);
        var text = match[0];
        if (error.fallback && match.index !== index) {
          this.queuedGroup = group;
          this.queuedText = text;
          return this._token(error, buffer.slice(index, match.index), index);
        }
        return this._token(group, text, index);
      };
      Lexer.prototype._token = function(group, text, offset) {
        var lineBreaks = 0;
        if (group.lineBreaks) {
          var matchNL = /\n/g;
          var nl = 1;
          if (text === "\n") {
            lineBreaks = 1;
          } else {
            while (matchNL.exec(text)) {
              lineBreaks++;
              nl = matchNL.lastIndex;
            }
          }
        }
        var token = {
          type: typeof group.type === "function" && group.type(text) || group.defaultType,
          value: typeof group.value === "function" ? group.value(text) : text,
          text,
          toString: tokenToString,
          offset,
          lineBreaks,
          line: this.line,
          col: this.col
        };
        var size = text.length;
        this.index += size;
        this.line += lineBreaks;
        if (lineBreaks !== 0) {
          this.col = size - nl + 1;
        } else {
          this.col += size;
        }
        if (group.shouldThrow) {
          var err = new Error(this.formatError(token, "invalid syntax"));
          throw err;
        }
        if (group.pop) this.popState();
        else if (group.push) this.pushState(group.push);
        else if (group.next) this.setState(group.next);
        return token;
      };
      if (typeof Symbol !== "undefined" && Symbol.iterator) {
        var LexerIterator = function(lexer2) {
          this.lexer = lexer2;
        };
        LexerIterator.prototype.next = function() {
          var token = this.lexer.next();
          return { value: token, done: !token };
        };
        LexerIterator.prototype[Symbol.iterator] = function() {
          return this;
        };
        Lexer.prototype[Symbol.iterator] = function() {
          return new LexerIterator(this);
        };
      }
      Lexer.prototype.formatError = function(token, message) {
        if (token == null) {
          var text = this.buffer.slice(this.index);
          var token = {
            text,
            offset: this.index,
            lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
            line: this.line,
            col: this.col
          };
        }
        var numLinesAround = 2;
        var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
        var lastDisplayedLine = token.line + numLinesAround;
        var lastLineDigits = String(lastDisplayedLine).length;
        var displayedLines = lastNLines(
          this.buffer,
          this.line - token.line + numLinesAround + 1
        ).slice(0, 5);
        var errorLines = [];
        errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
        errorLines.push("");
        for (var i3 = 0; i3 < displayedLines.length; i3++) {
          var line = displayedLines[i3];
          var lineNo = firstDisplayedLine + i3;
          errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
          if (lineNo === token.line) {
            errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
          }
        }
        return errorLines.join("\n");
      };
      Lexer.prototype.clone = function() {
        return new Lexer(this.states, this.state);
      };
      Lexer.prototype.has = function(tokenType) {
        return true;
      };
      return {
        compile,
        states: compileStates,
        error: Object.freeze({ error: true }),
        fallback: Object.freeze({ fallback: true }),
        keywords: keywordTransform
      };
    });
  }
});

// node_modules/.pnpm/marked-extensions@https+++codeload.github.com+bent10+marked-extensions+tar.gz+3d58361ba_c2d45d5a47dc2e9de9c428766b970d78/node_modules/marked-extensions/packages/directive/src/index.ts
var import_alea = __toESM(require_alea(), 1);

// node_modules/.pnpm/attributes-parser@2.2.3/node_modules/attributes-parser/dist/index.js
var import_moo2 = __toESM(require_moo(), 1);

// node_modules/.pnpm/json-loose@1.2.4/node_modules/json-loose/dist/index.js
var import_moo = __toESM(require_moo(), 1);
var i = import_moo.default.compile({
  /**
   * Matches various white space characters, including tab, vertical tab, form
   * feed, zero-width non-breaking space, and Unicode space separators.
   */
  WhiteSpace: { match: /[\t\v\f\ufeff\p{Zs}]+/u, lineBreaks: true },
  /**
   * Matches various line break sequences, including carriage return followed by
   * line feed, carriage return, line feed, and Unicode line/paragraph separators.
   */
  Lines: { match: /\r?\n|[\r\u2028\u2029]/u, lineBreaks: true },
  /**
   * Matches (literally) identifiers followed by collon (`:`) that may include
   * Unicode characters and escape sequences.
   */
  ObjectKey: /\[?(?:\x23)?(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+\]?(?=:)/u,
  /**
   * Matches various punctuators commonly used in programming languages
   * and regular expressions. It includes operators, delimiters, and special
   * characters.
   */
  Punctuator: /--|\+\+|=>|\.{3}|\??\.(?!\d)|(?:&&|\|\||\?\?|[+\-%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![/*]))=?|[?~,:;[\](){}]/u,
  /**
   * Matches boolean literals, allowing for optional single or double quotes.
   */
  BooleanLiteral: /true|false/u,
  /**
   * Matches various forms of numeric literals, including hexadecimal, octal,
   * binary, decimal, and scientific notation.
   */
  NumericLiteral: /(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?|0[0-7]+/u,
  /**
   * Matches single-quoted and double-quoted string literals, allowing for
   * escaping of quotes and newlines within the string.
   */
  StringLiteral: {
    match: /(?:'(?:(?!')[^\\\n\r]|\\(?:\r\n|[^]))*')|(?:"(?:(?!")[^\\\n\r]|\\(?:\r\n|[^]))*")/u,
    value: (t) => `"${t.slice(1, -1)}"`
  },
  /**
   * Matches identifiers that may include Unicode characters and escape
   * sequences.
   */
  Identifier: /(?:\x23)?(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/u
});
function d(t, a = {}) {
  const u = t.trim().replace(/[,]+$/, "");
  if (u === "") return "{}";
  if (!l(u)) throw new TypeError("Unexpected input format");
  let r = "";
  i.reset(u);
  for (const e of i)
    if (!(e.type === "WhiteSpace" || e.type === "Lines")) {
      switch (e.type) {
        case "Identifier":
          e.value = `"${a[e.value] || e.value}"`;
          break;
        case "ObjectKey":
          e.value.slice(0, 1) === "[" && e.value.slice(-1) === "]" ? e.value = `"${a[e.value.slice(1, -1)] || e.value.slice(1, -1)}"` : e.value = `"${e.value}"`;
          break;
      }
      r += e.value;
    }
  return r.replace(/,([}\]])/g, "$1");
}
function l(t) {
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}

// node_modules/.pnpm/attributes-parser@2.2.3/node_modules/attributes-parser/dist/index.js
var f = /[ \t\v\f\ufeff]+/;
var b = (
  // eslint-disable-next-line no-control-regex
  /(?:(?![\s\x00\x22\x27\x3E\x2F\x3D\x00-\x1F\x7F-\x9F])[^\s\x00-\x1F\x7F-\x9F\x22\x27\x3E\x2F\x3D])+/
);
var d2 = /[.#](?:(?!-?\d)(?:[a-zA-Z0-9\xA0-\uFFFF_-])+)/;
var m = new RegExp("(?<==)(?:true|false)");
var h = new RegExp("(?<==)-?(?:(?:0[xX][\\da-fA-F](?:_?[\\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|-?0n|-?[1-9](?:_?\\d)*n|(?:(?:0(?!\\d)|0\\d*[89]\\d*|[1-9](?:_?\\d)*)(?:\\.(?:\\d(?:_?\\d)*)?)?|\\.\\d(?:_?\\d)*)(?:[eE][+-]?\\d(?:_?\\d)*)?|-?0[0-7]+)");
var x = new RegExp(`(?<==)'(?!.*&[0-9a-zA-Z]+;)[^'\\\\]*(?:\\\\.|\\\\n[^"\\\\]*|&[^0-9a-zA-Z;]*)*'`);
var g = new RegExp('(?<==)"(?!.*&[0-9a-zA-Z]+;)[^"\\\\]*(?:\\\\.|\\\\n[^"\\\\]*|&[^0-9a-zA-Z;]*)*"');
var p = new RegExp("(?<==)[^\"\\s'`=<>\\x00]+");
function i2(t) {
  const e = typeof t == "string" && /^(['"]).*?\1$/.test(t) ? (
    // omit quotes
    t.slice(1, -1)
  ) : t;
  return e.startsWith("[") && e.endsWith("]") || e.startsWith("{") && e.endsWith("}") ? JSON.parse(d(e)) : e;
}
function L(t) {
  let e = "";
  for (const s in t) {
    const a = t[s];
    switch (typeof a) {
      case "object":
        e += ` ${s}='${JSON.stringify(a)}'`;
        break;
      case "string":
        e += ` ${s}="${a}"`;
        break;
      case "number":
      case "boolean":
        e += ` ${s}=${a}`;
        break;
    }
  }
  return e.slice(1);
}
var l2 = import_moo2.default.states({
  main: {
    WhiteSpace: f,
    AttributeShorthand: d2,
    BooleanLiteral: {
      match: m,
      value(t) {
        return t === "true";
      }
    },
    NumericLiteral: {
      match: h,
      value(t) {
        const e = Number(t);
        return Number.isNaN(e) ? Number(t.replace(/_|n$/g, "")) : Number(t);
      }
    },
    SingleQuotedValue: {
      match: x,
      value: i2,
      type: () => "StringLiteral"
    },
    DoubleQuotedLiteral: {
      match: g,
      value: i2,
      type: () => "StringLiteral"
    },
    UnquotedLiteral: {
      match: p,
      value: i2,
      type: () => "StringLiteral"
    },
    AttributeName: b,
    Separator: "="
  }
});
function S(t) {
  let e = null;
  const s = l2.reset(t), a = {};
  Object.defineProperties(a, {
    toString: {
      writable: false,
      enumerable: false,
      configurable: false,
      value: () => L(a)
    },
    getTokens: {
      writable: false,
      enumerable: false,
      configurable: false,
      value: () => Array.from(l2.reset(t))
    }
  });
  const n2 = [];
  for (const { type: o, value: r } of s)
    switch (o) {
      case "AttributeName":
        e = r, a[e] = e;
        break;
      case "AttributeShorthand":
        r[0] === "." ? n2.push(r.slice(1)) : r[0] === "#" && (a.id = r.slice(1));
        break;
      case "BooleanLiteral":
      case "NumericLiteral":
      case "StringLiteral":
        e && (e === "class" && n2.push(r), a[e] = r, e = null);
        break;
    }
  return n2.length && (a.class = n2.join(" ")), a;
}

// node_modules/.pnpm/marked-extensions@https+++codeload.github.com+bent10+marked-extensions+tar.gz+3d58361ba_c2d45d5a47dc2e9de9c428766b970d78/node_modules/marked-extensions/packages/directive/src/tokenizer.ts
var import_moo3 = __toESM(require_moo(), 1);
var lexer = import_moo3.default.compile({
  spaces: /[\t\v\f\ufeff ]+/,
  name: /[a-zA-Z][\w-]*/,
  attrs: {
    match: /\{.*\}/,
    value: (x2) => S(x2.slice(1, -1))
  },
  text: {
    match: /\[.*\]/,
    value: (x2) => x2.slice(1, -1)
  },
  blockText: { match: /[\s\S]+/, lineBreaks: true }
});
function createToken(config) {
  const { type, level, raw, content, marker, tag } = config;
  const lex = lexer.reset(content);
  let name, attrs, text = "", tokens = [];
  for (const { type: type2, value } of lex) {
    switch (type2) {
      case "name":
        name = value;
        break;
      case "attrs":
        attrs = value;
        break;
      case "text":
      case "blockText":
        text = value;
        tokens = level === "container" ? this.lexer.blockTokens(value) : this.lexer.inlineTokens(value);
        break;
    }
  }
  return {
    type,
    raw,
    meta: { level, marker, tag, name },
    attrs,
    text,
    tokens
  };
}

// node_modules/.pnpm/marked-extensions@https+++codeload.github.com+bent10+marked-extensions+tar.gz+3d58361ba_c2d45d5a47dc2e9de9c428766b970d78/node_modules/marked-extensions/packages/directive/src/utils.ts
function getDirectivePattern(level, marker) {
  switch (level) {
    case "container":
      return String.raw`^${marker}([\s\S]*?)\n${marker}`;
    case "block":
      return String.raw`^${marker}\s*((?:[a-zA-Z][\w-]*)\s*(\[[^\]]*\])?\s*(\{[^}]*\})?)`;
    case "inline":
      return String.raw`^${marker}((?:[a-zA-Z][\w-]*)(\[[^\]]*\])(\{[^}]*\})?)`;
  }
}
function ucFirst(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}
function isVoidElements(str) {
  return [
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "image",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ].includes(str);
}

// node_modules/.pnpm/marked-extensions@https+++codeload.github.com+bent10+marked-extensions+tar.gz+3d58361ba_c2d45d5a47dc2e9de9c428766b970d78/node_modules/marked-extensions/packages/directive/src/renderer.ts
function directiveRenderer(token) {
  const { meta, attrs, tokens = [] } = token;
  const tagname = meta.name || meta.tag;
  let elem = `<${tagname}`;
  elem += attrs ? " " + attrs.toString() : "";
  elem += isVoidElements(tagname) ? " />" : ">";
  elem += meta.level === "container" ? "\n" : "";
  if (!isVoidElements(tagname)) {
    elem += meta.level === "container" ? this.parser.parse(tokens) : this.parser.parseInline(tokens);
    elem += `</${tagname}>`;
  }
  elem += meta.level === "inline" ? "" : "\n";
  return elem;
}

// node_modules/.pnpm/marked-extensions@https+++codeload.github.com+bent10+marked-extensions+tar.gz+3d58361ba_c2d45d5a47dc2e9de9c428766b970d78/node_modules/marked-extensions/packages/directive/src/index.ts
var presetDirectiveConfigs = [
  { level: "container", marker: ":::" },
  { level: "block", marker: "::" },
  { level: "inline", marker: ":" }
];
function createDirectives(configs = presetDirectiveConfigs) {
  return {
    extensions: configs.map(
      ({ level, marker, tag, renderer: customRenderer }) => {
        const id = (0, import_alea.default)(marker).int32();
        const type = `directive${ucFirst(level)}${id}`;
        return {
          name: type,
          level: level === "inline" ? "inline" : "block",
          start: (src) => src.match(new RegExp(marker))?.index,
          tokenizer(src) {
            const pattern = getDirectivePattern(level, marker);
            const match = src.match(new RegExp(pattern));
            if (match) {
              const [raw, content = ""] = match;
              return createToken.call(this, {
                type,
                level,
                raw,
                content,
                marker,
                tag: tag || (level === "inline" ? "span" : "div")
              });
            }
          },
          renderer: customRenderer || directiveRenderer
        };
      }
    )
  };
}
export {
  createDirectives,
  isVoidElements,
  presetDirectiveConfigs
};
