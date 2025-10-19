function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var moo$1 = {exports: {}};

var moo = moo$1.exports;

var hasRequiredMoo;

function requireMoo () {
	if (hasRequiredMoo) return moo$1.exports;
	hasRequiredMoo = 1;
	(function (module) {
		(function(root, factory) {
		  if (module.exports) {
		    module.exports = factory();
		  } else {
		    root.moo = factory();
		  }
		}(moo, function() {

		  var hasOwnProperty = Object.prototype.hasOwnProperty;
		  var toString = Object.prototype.toString;
		  var hasSticky = typeof new RegExp().sticky === 'boolean';

		  /***************************************************************************/

		  function isRegExp(o) { return o && toString.call(o) === '[object RegExp]' }
		  function isObject(o) { return o && typeof o === 'object' && !isRegExp(o) && !Array.isArray(o) }

		  function reEscape(s) {
		    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
		  }
		  function reGroups(s) {
		    var re = new RegExp('|' + s);
		    return re.exec('').length - 1
		  }
		  function reCapture(s) {
		    return '(' + s + ')'
		  }
		  function reUnion(regexps) {
		    if (!regexps.length) return '(?!)'
		    var source =  regexps.map(function(s) {
		      return "(?:" + s + ")"
		    }).join('|');
		    return "(?:" + source + ")"
		  }

		  function regexpOrLiteral(obj) {
		    if (typeof obj === 'string') {
		      return '(?:' + reEscape(obj) + ')'

		    } else if (isRegExp(obj)) {
		      // TODO: consider /u support
		      if (obj.ignoreCase) throw new Error('RegExp /i flag not allowed')
		      if (obj.global) throw new Error('RegExp /g flag is implied')
		      if (obj.sticky) throw new Error('RegExp /y flag is implied')
		      if (obj.multiline) throw new Error('RegExp /m flag is implied')
		      return obj.source

		    } else {
		      throw new Error('Not a pattern: ' + obj)
		    }
		  }

		  function pad(s, length) {
		    if (s.length > length) {
		      return s
		    }
		    return Array(length - s.length + 1).join(" ") + s
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
		    var startPosition = 
		      lineBreaks < numLines ?
		      0 : 
		      position + 1;
		    return string.substring(startPosition).split("\n")
		  }

		  function objectToRules(object) {
		    var keys = Object.getOwnPropertyNames(object);
		    var result = [];
		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];
		      var thing = object[key];
		      var rules = [].concat(thing);
		      if (key === 'include') {
		        for (var j = 0; j < rules.length; j++) {
		          result.push({include: rules[j]});
		        }
		        continue
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
		    return result
		  }

		  function arrayToRules(array) {
		    var result = [];
		    for (var i = 0; i < array.length; i++) {
		      var obj = array[i];
		      if (obj.include) {
		        var include = [].concat(obj.include);
		        for (var j = 0; j < include.length; j++) {
		          result.push({include: include[j]});
		        }
		        continue
		      }
		      if (!obj.type) {
		        throw new Error('Rule has no type: ' + JSON.stringify(obj))
		      }
		      result.push(ruleOptions(obj.type, obj));
		    }
		    return result
		  }

		  function ruleOptions(type, obj) {
		    if (!isObject(obj)) {
		      obj = { match: obj };
		    }
		    if (obj.include) {
		      throw new Error('Matching rules cannot also include states')
		    }

		    // nb. error and fallback imply lineBreaks
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
		      shouldThrow: false,
		    };

		    // Avoid Object.assign(), so we support IE9+
		    for (var key in obj) {
		      if (hasOwnProperty.call(obj, key)) {
		        options[key] = obj[key];
		      }
		    }

		    // type transform cannot be a string
		    if (typeof options.type === 'string' && type !== options.type) {
		      throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
		    }

		    // convert to array
		    var match = options.match;
		    options.match = Array.isArray(match) ? match : match ? [match] : [];
		    options.match.sort(function(a, b) {
		      return isRegExp(a) && isRegExp(b) ? 0
		           : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
		    });
		    return options
		  }

		  function toRules(spec) {
		    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
		  }

		  var defaultErrorRule = ruleOptions('error', {lineBreaks: true, shouldThrow: true});
		  function compileRules(rules, hasStates) {
		    var errorRule = null;
		    var fast = Object.create(null);
		    var fastAllowed = true;
		    var unicodeFlag = null;
		    var groups = [];
		    var parts = [];

		    // If there is a fallback rule, then disable fast matching
		    for (var i = 0; i < rules.length; i++) {
		      if (rules[i].fallback) {
		        fastAllowed = false;
		      }
		    }

		    for (var i = 0; i < rules.length; i++) {
		      var options = rules[i];

		      if (options.include) {
		        // all valid inclusions are removed by states() preprocessor
		        throw new Error('Inheritance is not allowed in stateless lexers')
		      }

		      if (options.error || options.fallback) {
		        // errorRule can only be set once
		        if (errorRule) {
		          if (!options.fallback === !errorRule.fallback) {
		            throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
		          } else {
		            throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
		          }
		        }
		        errorRule = options;
		      }

		      var match = options.match.slice();
		      if (fastAllowed) {
		        while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
		          var word = match.shift();
		          fast[word.charCodeAt(0)] = options;
		        }
		      }

		      // Warn about inappropriate state-switching options
		      if (options.pop || options.push || options.next) {
		        if (!hasStates) {
		          throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
		        }
		        if (options.fallback) {
		          throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
		        }
		      }

		      // Only rules with a .match are included in the RegExp
		      if (match.length === 0) {
		        continue
		      }
		      fastAllowed = false;

		      groups.push(options);

		      // Check unicode flag is used everywhere or nowhere
		      for (var j = 0; j < match.length; j++) {
		        var obj = match[j];
		        if (!isRegExp(obj)) {
		          continue
		        }

		        if (unicodeFlag === null) {
		          unicodeFlag = obj.unicode;
		        } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
		          throw new Error('If one rule is /u then all must be')
		        }
		      }

		      // convert to RegExp
		      var pat = reUnion(match.map(regexpOrLiteral));

		      // validate
		      var regexp = new RegExp(pat);
		      if (regexp.test("")) {
		        throw new Error("RegExp matches empty string: " + regexp)
		      }
		      var groupCount = reGroups(pat);
		      if (groupCount > 0) {
		        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
		      }

		      // try and detect rules matching newlines
		      if (!options.lineBreaks && regexp.test('\n')) {
		        throw new Error('Rule should declare lineBreaks: ' + regexp)
		      }

		      // store regex
		      parts.push(reCapture(pat));
		    }


		    // If there's no fallback rule, use the sticky flag so we only look for
		    // matches at the current index.
		    //
		    // If we don't support the sticky flag, then fake it using an irrefutable
		    // match (i.e. an empty pattern).
		    var fallbackRule = errorRule && errorRule.fallback;
		    var flags = hasSticky && !fallbackRule ? 'ym' : 'gm';
		    var suffix = hasSticky || fallbackRule ? '' : '|';

		    if (unicodeFlag === true) flags += "u";
		    var combined = new RegExp(reUnion(parts) + suffix, flags);
		    return {regexp: combined, groups: groups, fast: fast, error: errorRule || defaultErrorRule}
		  }

		  function compile(rules) {
		    var result = compileRules(toRules(rules));
		    return new Lexer({start: result}, 'start')
		  }

		  function checkStateGroup(g, name, map) {
		    var state = g && (g.push || g.next);
		    if (state && !map[state]) {
		      throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
		    }
		    if (g && g.pop && +g.pop !== 1) {
		      throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
		    }
		  }
		  function compileStates(states, start) {
		    var all = states.$all ? toRules(states.$all) : [];
		    delete states.$all;

		    var keys = Object.getOwnPropertyNames(states);
		    if (!start) start = keys[0];

		    var ruleMap = Object.create(null);
		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];
		      ruleMap[key] = toRules(states[key]).concat(all);
		    }
		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];
		      var rules = ruleMap[key];
		      var included = Object.create(null);
		      for (var j = 0; j < rules.length; j++) {
		        var rule = rules[j];
		        if (!rule.include) continue
		        var splice = [j, 1];
		        if (rule.include !== key && !included[rule.include]) {
		          included[rule.include] = true;
		          var newRules = ruleMap[rule.include];
		          if (!newRules) {
		            throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
		          }
		          for (var k = 0; k < newRules.length; k++) {
		            var newRule = newRules[k];
		            if (rules.indexOf(newRule) !== -1) continue
		            splice.push(newRule);
		          }
		        }
		        rules.splice.apply(rules, splice);
		        j--;
		      }
		    }

		    var map = Object.create(null);
		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];
		      map[key] = compileRules(ruleMap[key], true);
		    }

		    for (var i = 0; i < keys.length; i++) {
		      var name = keys[i];
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

		    return new Lexer(map, start)
		  }

		  function keywordTransform(map) {

		    // Use a JavaScript Map to map keywords to their corresponding token type
		    // unless Map is unsupported, then fall back to using an Object:
		    var isMap = typeof Map !== 'undefined';
		    var reverseMap = isMap ? new Map : Object.create(null);

		    var types = Object.getOwnPropertyNames(map);
		    for (var i = 0; i < types.length; i++) {
		      var tokenType = types[i];
		      var item = map[tokenType];
		      var keywordList = Array.isArray(item) ? item : [item];
		      keywordList.forEach(function(keyword) {
		        if (typeof keyword !== 'string') {
		          throw new Error("keyword must be string (in keyword '" + tokenType + "')")
		        }
		        if (isMap) {
		          reverseMap.set(keyword, tokenType);
		        } else {
		          reverseMap[keyword] = tokenType;
		        }
		      });
		    }
		    return function(k) {
		      return isMap ? reverseMap.get(k) : reverseMap[k]
		    }
		  }

		  /***************************************************************************/

		  var Lexer = function(states, state) {
		    this.startState = state;
		    this.states = states;
		    this.buffer = '';
		    this.stack = [];
		    this.reset();
		  };

		  Lexer.prototype.reset = function(data, info) {
		    this.buffer = data || '';
		    this.index = 0;
		    this.line = info ? info.line : 1;
		    this.col = info ? info.col : 1;
		    this.queuedToken = info ? info.queuedToken : null;
		    this.queuedText = info ? info.queuedText: "";
		    this.queuedThrow = info ? info.queuedThrow : null;
		    this.setState(info ? info.state : this.startState);
		    this.stack = info && info.stack ? info.stack.slice() : [];
		    return this
		  };

		  Lexer.prototype.save = function() {
		    return {
		      line: this.line,
		      col: this.col,
		      state: this.state,
		      stack: this.stack.slice(),
		      queuedToken: this.queuedToken,
		      queuedText: this.queuedText,
		      queuedThrow: this.queuedThrow,
		    }
		  };

		  Lexer.prototype.setState = function(state) {
		    if (!state || this.state === state) return
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

		  var eat = hasSticky ? function(re, buffer) { // assume re is /y
		    return re.exec(buffer)
		  } : function(re, buffer) { // assume re is /g
		    var match = re.exec(buffer);
		    // will always match, since we used the |(?:) trick
		    if (match[0].length === 0) {
		      return null
		    }
		    return match
		  };

		  Lexer.prototype._getGroup = function(match) {
		    var groupCount = this.groups.length;
		    for (var i = 0; i < groupCount; i++) {
		      if (match[i + 1] !== undefined) {
		        return this.groups[i]
		      }
		    }
		    throw new Error('Cannot find token type for matched text')
		  };

		  function tokenToString() {
		    return this.value
		  }

		  Lexer.prototype.next = function() {
		    var index = this.index;

		    // If a fallback token matched, we don't need to re-run the RegExp
		    if (this.queuedGroup) {
		      var token = this._token(this.queuedGroup, this.queuedText, index);
		      this.queuedGroup = null;
		      this.queuedText = "";
		      return token
		    }

		    var buffer = this.buffer;
		    if (index === buffer.length) {
		      return // EOF
		    }

		    // Fast matching for single characters
		    var group = this.fast[buffer.charCodeAt(index)];
		    if (group) {
		      return this._token(group, buffer.charAt(index), index)
		    }

		    // Execute RegExp
		    var re = this.re;
		    re.lastIndex = index;
		    var match = eat(re, buffer);

		    // Error tokens match the remaining buffer
		    var error = this.error;
		    if (match == null) {
		      return this._token(error, buffer.slice(index, buffer.length), index)
		    }

		    var group = this._getGroup(match);
		    var text = match[0];

		    if (error.fallback && match.index !== index) {
		      this.queuedGroup = group;
		      this.queuedText = text;

		      // Fallback tokens contain the unmatched portion of the buffer
		      return this._token(error, buffer.slice(index, match.index), index)
		    }

		    return this._token(group, text, index)
		  };

		  Lexer.prototype._token = function(group, text, offset) {
		    // count line breaks
		    var lineBreaks = 0;
		    if (group.lineBreaks) {
		      var matchNL = /\n/g;
		      var nl = 1;
		      if (text === '\n') {
		        lineBreaks = 1;
		      } else {
		        while (matchNL.exec(text)) { lineBreaks++; nl = matchNL.lastIndex; }
		      }
		    }

		    var token = {
		      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
		      value: typeof group.value === 'function' ? group.value(text) : text,
		      text: text,
		      toString: tokenToString,
		      offset: offset,
		      lineBreaks: lineBreaks,
		      line: this.line,
		      col: this.col,
		    };
		    // nb. adding more props to token object will make V8 sad!

		    var size = text.length;
		    this.index += size;
		    this.line += lineBreaks;
		    if (lineBreaks !== 0) {
		      this.col = size - nl + 1;
		    } else {
		      this.col += size;
		    }

		    // throw, if no rule with {error: true}
		    if (group.shouldThrow) {
		      var err = new Error(this.formatError(token, "invalid syntax"));
		      throw err;
		    }

		    if (group.pop) this.popState();
		    else if (group.push) this.pushState(group.push);
		    else if (group.next) this.setState(group.next);

		    return token
		  };

		  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
		    var LexerIterator = function(lexer) {
		      this.lexer = lexer;
		    };

		    LexerIterator.prototype.next = function() {
		      var token = this.lexer.next();
		      return {value: token, done: !token}
		    };

		    LexerIterator.prototype[Symbol.iterator] = function() {
		      return this
		    };

		    Lexer.prototype[Symbol.iterator] = function() {
		      return new LexerIterator(this)
		    };
		  }

		  Lexer.prototype.formatError = function(token, message) {
		    if (token == null) {
		      // An undefined token indicates EOF
		      var text = this.buffer.slice(this.index);
		      var token = {
		        text: text,
		        offset: this.index,
		        lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
		        line: this.line,
		        col: this.col,
		      };
		    }
		    
		    var numLinesAround = 2;
		    var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
		    var lastDisplayedLine = token.line + numLinesAround;
		    var lastLineDigits = String(lastDisplayedLine).length;
		    var displayedLines = lastNLines(
		        this.buffer, 
		        (this.line - token.line) + numLinesAround + 1
		      )
		      .slice(0, 5);
		    var errorLines = [];
		    errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
		    errorLines.push("");
		    for (var i = 0; i < displayedLines.length; i++) {
		      var line = displayedLines[i];
		      var lineNo = firstDisplayedLine + i;
		      errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
		      if (lineNo === token.line) {
		        errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
		      }
		    }
		    return errorLines.join("\n")
		  };

		  Lexer.prototype.clone = function() {
		    return new Lexer(this.states, this.state)
		  };

		  Lexer.prototype.has = function(tokenType) {
		    return true
		  };


		  return {
		    compile: compile,
		    states: compileStates,
		    error: Object.freeze({error: true}),
		    fallback: Object.freeze({fallback: true}),
		    keywords: keywordTransform,
		  }

		})); 
	} (moo$1));
	return moo$1.exports;
}

var mooExports = requireMoo();
var x = /*@__PURE__*/getDefaultExportFromCjs(mooExports);

var k = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function w(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var b = { exports: {} };
(function(e) {
  (function(t, s, i) {
    function r(a) {
      var n = this, c = p();
      n.next = function() {
        var f = 2091639 * n.s0 + n.c * 23283064365386963e-26;
        return n.s0 = n.s1, n.s1 = n.s2, n.s2 = f - (n.c = f | 0);
      }, n.c = 1, n.s0 = c(" "), n.s1 = c(" "), n.s2 = c(" "), n.s0 -= c(a), n.s0 < 0 && (n.s0 += 1), n.s1 -= c(a), n.s1 < 0 && (n.s1 += 1), n.s2 -= c(a), n.s2 < 0 && (n.s2 += 1), c = null;
    }
    function l(a, n) {
      return n.c = a.c, n.s0 = a.s0, n.s1 = a.s1, n.s2 = a.s2, n;
    }
    function u(a, n) {
      var c = new r(a), f = n && n.state, o = c.next;
      return o.int32 = function() {
        return c.next() * 4294967296 | 0;
      }, o.double = function() {
        return o() + (o() * 2097152 | 0) * 11102230246251565e-32;
      }, o.quick = o, f && (typeof f == "object" && l(f, c), o.state = function() {
        return l(c, {});
      }), o;
    }
    function p() {
      var a = 4022871197, n = function(c) {
        c = String(c);
        for (var f = 0; f < c.length; f++) {
          a += c.charCodeAt(f);
          var o = 0.02519603282416938 * a;
          a = o >>> 0, o -= a, o *= a, a = o >>> 0, o -= a, a += o * 4294967296;
        }
        return (a >>> 0) * 23283064365386963e-26;
      };
      return n;
    }
    s && s.exports ? s.exports = u : this.alea = u;
  })(
    k,
    e
  );
})(b);
var $ = b.exports;
const _ = /* @__PURE__ */ w($), h = x.compile({
  /**
   * Matches various white space characters, including tab, vertical tab, form
   * feed, zero-width non-breaking space, and Unicode space separators.
   */
  WhiteSpace: { match: /[\t\v\f\ufeff\p{Zs}]+/u, lineBreaks: !0 },
  /**
   * Matches various line break sequences, including carriage return followed by
   * line feed, carriage return, line feed, and Unicode line/paragraph separators.
   */
  Lines: { match: /\r?\n|[\r\u2028\u2029]/u, lineBreaks: !0 },
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
    value: (e) => `"${e.slice(1, -1)}"`
  },
  /**
   * Matches identifiers that may include Unicode characters and escape
   * sequences.
   */
  Identifier: /(?:\x23)?(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/u
});
function y(e, t = {}) {
  const s = e.trim().replace(/[,]+$/, "");
  if (s === "") return "{}";
  if (!A(s)) throw new TypeError("Unexpected input format");
  let i = "";
  h.reset(s);
  for (const r of h)
    if (!(r.type === "WhiteSpace" || r.type === "Lines")) {
      switch (r.type) {
        case "Identifier":
          r.value = `"${t[r.value] || r.value}"`;
          break;
        case "ObjectKey":
          r.value.slice(0, 1) === "[" && r.value.slice(-1) === "]" ? r.value = `"${t[r.value.slice(1, -1)] || r.value.slice(1, -1)}"` : r.value = `"${r.value}"`;
          break;
      }
      i += r.value;
    }
  return i.replace(/,([}\]])/g, "$1");
}
function A(e) {
  return e.startsWith("{") && e.endsWith("}") || e.startsWith("[") && e.endsWith("]");
}
const F = /[ \t\v\f\ufeff]+/, S = (
  // eslint-disable-next-line no-control-regex
  /(?:(?![\s\x00\x22\x27\x3E\x2F\x3D\x00-\x1F\x7F-\x9F])[^\s\x00-\x1F\x7F-\x9F\x22\x27\x3E\x2F\x3D])+/
), L = /[.#](?:(?!-?\d)(?:[a-zA-Z0-9\xA0-\uFFFF_-])+)/, E = new RegExp("(?<==)(?:true|false)"), D = new RegExp("(?<==)-?(?:(?:0[xX][\\da-fA-F](?:_?[\\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|-?0n|-?[1-9](?:_?\\d)*n|(?:(?:0(?!\\d)|0\\d*[89]\\d*|[1-9](?:_?\\d)*)(?:\\.(?:\\d(?:_?\\d)*)?)?|\\.\\d(?:_?\\d)*)(?:[eE][+-]?\\d(?:_?\\d)*)?|-?0[0-7]+)"), N = new RegExp(`(?<==)'(?!.*&[0-9a-zA-Z]+;)[^'\\\\]*(?:\\\\.|\\\\n[^"\\\\]*|&[^0-9a-zA-Z;]*)*'`), W = new RegExp('(?<==)"(?!.*&[0-9a-zA-Z]+;)[^"\\\\]*(?:\\\\.|\\\\n[^"\\\\]*|&[^0-9a-zA-Z;]*)*"'), j = new RegExp("(?<==)[^\"\\s'`=<>\\x00]+");
function m(e) {
  const t = typeof e == "string" && /^(['"]).*?\1$/.test(e) ? (
    // omit quotes
    e.slice(1, -1)
  ) : e;
  return t.startsWith("[") && t.endsWith("]") || t.startsWith("{") && t.endsWith("}") ? JSON.parse(y(t)) : t;
}
function z(e) {
  let t = "";
  for (const s in e) {
    const i = e[s];
    switch (typeof i) {
      case "object":
        t += ` ${s}='${JSON.stringify(i)}'`;
        break;
      case "string":
        t += ` ${s}="${i}"`;
        break;
      case "number":
      case "boolean":
        t += ` ${s}=${i}`;
        break;
    }
  }
  return t.slice(1);
}
const v = x.states({
  main: {
    WhiteSpace: F,
    AttributeShorthand: L,
    BooleanLiteral: {
      match: E,
      value(e) {
        return e === "true";
      }
    },
    NumericLiteral: {
      match: D,
      value(e) {
        const t = Number(e);
        return Number.isNaN(t) ? Number(e.replace(/_|n$/g, "")) : Number(e);
      }
    },
    SingleQuotedValue: {
      match: N,
      value: m,
      type: () => "StringLiteral"
    },
    DoubleQuotedLiteral: {
      match: W,
      value: m,
      type: () => "StringLiteral"
    },
    UnquotedLiteral: {
      match: j,
      value: m,
      type: () => "StringLiteral"
    },
    AttributeName: S,
    Separator: "="
  }
});
function C(e) {
  let t = null;
  const s = v.reset(e), i = {};
  Object.defineProperties(i, {
    toString: {
      writable: !1,
      enumerable: !1,
      configurable: !1,
      value: () => z(i)
    },
    getTokens: {
      writable: !1,
      enumerable: !1,
      configurable: !1,
      value: () => Array.from(v.reset(e))
    }
  });
  const r = [];
  for (const { type: l, value: u } of s)
    switch (l) {
      case "AttributeName":
        t = u, i[t] = t;
        break;
      case "AttributeShorthand":
        u[0] === "." ? r.push(u.slice(1)) : u[0] === "#" && (i.id = u.slice(1));
        break;
      case "BooleanLiteral":
      case "NumericLiteral":
      case "StringLiteral":
        t && (t === "class" && r.push(u), i[t] = u, t = null);
        break;
    }
  return r.length && (i.class = r.join(" ")), i;
}
const O = x.compile({
  spaces: /[\t\v\f\ufeff ]+/,
  name: /[a-zA-Z][\w-]*/,
  attrs: {
    match: /\{.*\}/,
    value: (e) => C(e.slice(1, -1))
  },
  text: {
    match: /\[.*\]/,
    value: (e) => e.slice(1, -1)
  },
  blockText: { match: /[\s\S]+/, lineBreaks: !0 }
});
function T(e) {
  const { type: t, level: s, raw: i, content: r, marker: l, tag: u } = e, p = O.reset(r);
  let a, n, c = "", f = [];
  for (const { type: o, value: d } of p)
    switch (o) {
      case "name":
        a = d;
        break;
      case "attrs":
        n = d;
        break;
      case "text":
      case "blockText":
        c = d, f = s === "container" ? this.lexer.blockTokens(d) : this.lexer.inlineTokens(d);
        break;
    }
  return {
    type: t,
    raw: i,
    meta: { level: s, marker: l, tag: u, name: a },
    attrs: n,
    text: c,
    tokens: f
  };
}
function Z(e, t) {
  switch (e) {
    case "container":
      return `^${t}([\\s\\S]*?)\\n${t}`;
    case "block":
      return `^${t}((?:[a-zA-Z][\\w-]*|[\\{\\[].*?[\\}\\]])+)`;
    case "inline":
      return `^${t}((?:[a-zA-Z][\\w-]*|[\\{].*?[\\}]+|[\\[].*?[\\]])+)`;
  }
}
function B(e) {
  return e[0].toUpperCase() + e.slice(1).toLowerCase();
}
function g(e) {
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
  ].includes(e);
}
function R(e) {
  const { meta: t, attrs: s, tokens: i = [] } = e, r = t.name || t.tag;
  let l = `<${r}`;
  return l += s ? " " + s.toString() : "", l += g(r) ? " />" : ">", l += t.level === "container" ? `
` : "", g(r) || (l += t.level === "container" ? this.parser.parse(i) : this.parser.parseInline(i), l += `</${r}>`), l += t.level === "inline" ? "" : `
`, l;
}
const I = [
  { level: "container", marker: ":::" },
  { level: "block", marker: "::" },
  { level: "inline", marker: ":" }
];
function U(e = I) {
  return {
    extensions: e.map(
      ({ level: t, marker: s, tag: i, renderer: r }) => {
        const l = _(s).int32(), u = `directive${B(t)}${l}`;
        return {
          name: u,
          level: t === "inline" ? "inline" : "block",
          start: (p) => {
            var a;
            return (a = p.match(new RegExp(s))) == null ? void 0 : a.index;
          },
          tokenizer(p) {
            const a = Z(t, s), n = p.match(new RegExp(a));
            if (n) {
              const [c, f = ""] = n;
              return T.call(this, {
                type: u,
                level: t,
                raw: c,
                content: f,
                marker: s,
                tag: i || (t === "inline" ? "span" : "div")
              });
            }
          },
          renderer: r || R
        };
      }
    )
  };
}

export { U as createDirectives, g as isVoidElements, I as presetDirectiveConfigs };
