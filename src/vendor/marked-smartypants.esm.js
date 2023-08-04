// node_modules/smartypants/smartypants.es6.js
var tags_to_skip = /<(\/?)(?:pre|code|kbd|script|math)[^>]*>/i;
var SmartyPants = (text = "", attr = "1") => {
  var do_quotes;
  var do_backticks;
  var do_dashes;
  var do_ellipses;
  var do_stupefy;
  var convert_quot = 0;
  if (typeof attr === "number") {
    attr = attr.toString();
  } else {
    attr = attr.replace(/\s/g, "");
  }
  if (attr === "0") {
    return text;
  } else if (attr === "1") {
    do_quotes = 1;
    do_backticks = 1;
    do_dashes = 1;
    do_ellipses = 1;
  } else if (attr === "2") {
    do_quotes = 1;
    do_backticks = 1;
    do_dashes = 2;
    do_ellipses = 1;
  } else if (attr === "3") {
    do_quotes = 1;
    do_backticks = 1;
    do_dashes = 3;
    do_ellipses = 1;
  } else if (attr === "-1") {
    do_stupefy = 1;
  } else {
    for (let i = 0; i < attr.length; i++) {
      let c = attr[i];
      if (c === "q") {
        do_quotes = 1;
      }
      if (c === "b") {
        do_backticks = 1;
      }
      if (c === "B") {
        do_backticks = 2;
      }
      if (c === "d") {
        do_dashes = 1;
      }
      if (c === "D") {
        do_dashes = 2;
      }
      if (c === "i") {
        do_dashes = 3;
      }
      if (c === "e") {
        do_ellipses = 1;
      }
      if (c === "w") {
        convert_quot = 1;
      }
    }
  }
  var tokens = _tokenize(text);
  var result = "";
  var in_pre = 0;
  var prev_token_last_char = "";
  for (let i = 0; i < tokens.length; i++) {
    let cur_token = tokens[i];
    if (cur_token[0] === "tag") {
      result = result + cur_token[1];
      let matched = tags_to_skip.exec(cur_token[1]);
      if (matched) {
        if (matched[1] === "/") {
          in_pre = 0;
        } else {
          in_pre = 1;
        }
      }
    } else {
      let t = cur_token[1];
      let last_char = t.substring(t.length - 1, t.length);
      if (!in_pre) {
        t = ProcessEscapes(t);
        if (convert_quot) {
          t = t.replace(/$quot;/g, '"');
        }
        if (do_dashes) {
          if (do_dashes === 1) {
            t = EducateDashes(t);
          }
          if (do_dashes === 2) {
            t = EducateDashesOldSchool(t);
          }
          if (do_dashes === 3) {
            t = EducateDashesOldSchoolInverted(t);
          }
        }
        if (do_ellipses) {
          t = EducateEllipses(t);
        }
        if (do_backticks) {
          t = EducateBackticks(t);
          if (do_backticks === 2) {
            t = EducateSingleBackticks(t);
          }
        }
        if (do_quotes) {
          if (t === "'") {
            if (/\S/.test(prev_token_last_char)) {
              t = "&#8217;";
            } else {
              t = "&#8216;";
            }
          } else if (t === '"') {
            if (/\S/.test(prev_token_last_char)) {
              t = "&#8221;";
            } else {
              t = "&#8220;";
            }
          } else {
            t = EducateQuotes(t);
          }
        }
        if (do_stupefy) {
          t = StupefyEntities(t);
        }
      }
      prev_token_last_char = last_char;
      result = result + t;
    }
  }
  return result;
};
var EducateQuotes = (str) => {
  var punct_class = "[!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~]";
  str = str.replace(new RegExp(`^'(?=${punct_class}\\B)`), "&#8217;");
  str = str.replace(new RegExp(`^"(?=${punct_class}\\B)`), "&#8221;");
  str = str.replace(/"'(?=\w)/, "&#8220;&#8216;");
  str = str.replace(/'"(?=\w)/, "&#8216;&#8220;");
  str = str.replace(/'(?=\d\d)/, "&#8217;");
  var close_class = "[^\\ \\t\\r\\n\\[\\{\\(\\-]";
  var not_close_class = "[\\ \\t\\r\\n\\[\\{\\(\\-]";
  var dec_dashes = "&#8211;|&#8212;";
  str = str.replace(new RegExp(`(\\s|&nbsp;|--|&[mn]dash;|${dec_dashes}|&#x201[34])'(?=\\w)`, "g"), "$1&#8216;");
  str = str.replace(new RegExp(`(${close_class})'`, "g"), "$1&#8217;");
  str = str.replace(new RegExp(`(${not_close_class}?)'(?=\\s|s\\b)`, "g"), "$1&#8217;");
  str = str.replace(/'/g, "&#8216;");
  str = str.replace(new RegExp(`(\\s|&nbsp;|--|&[mn]dash;|${dec_dashes}|&#x201[34])"(?=\\w)`, "g"), "$1&#8220;");
  str = str.replace(new RegExp(`(${close_class})"`, "g"), "$1&#8221;");
  str = str.replace(new RegExp(`(${not_close_class}?)"(?=\\s)`, "g"), "$1&#8221;");
  str = str.replace(/"/g, "&#8220;");
  return str;
};
var EducateBackticks = (str) => {
  str = str.replace(/``/g, "&#8220;");
  str = str.replace(/''/g, "&#8221;");
  return str;
};
var EducateSingleBackticks = (str) => {
  str = str.replace(/`/g, "&#8216;");
  str = str.replace(/'/g, "&#8217;");
  return str;
};
var EducateDashes = (str) => {
  str = str.replace(/--/g, "&#8212;");
  return str;
};
var EducateDashesOldSchool = (str) => {
  str = str.replace(/---/g, "&#8212;");
  str = str.replace(/--/g, "&#8211;");
  return str;
};
var EducateDashesOldSchoolInverted = (str) => {
  str = str.replace(/---/g, "&#8211;");
  str = str.replace(/--/g, "&#8212;");
  return str;
};
var EducateEllipses = (str) => {
  str = str.replace(/\.\.\./g, "&#8230;");
  str = str.replace(/\. \. \./g, "&#8230;");
  return str;
};
var StupefyEntities = (str) => {
  str = str.replace(/&#8211;/g, "-");
  str = str.replace(/&#8212;/g, "--");
  str = str.replace(/&#8216;/g, "'");
  str = str.replace(/&#8217;/g, "'");
  str = str.replace(/&#8220;/g, '"');
  str = str.replace(/&#8221;/g, '"');
  str = str.replace(/&#8230;/g, "...");
  return str;
};
var ProcessEscapes = (str) => {
  str = str.replace(/\\\\/g, "&#92;");
  str = str.replace(/\\"/g, "&#34;");
  str = str.replace(/\\'/g, "&#39;");
  str = str.replace(/\\\./g, "&#46;");
  str = str.replace(/\\-/g, "&#45;");
  str = str.replace(/\\`/g, "&#96;");
  return str;
};
var _tokenize = (str) => {
  var pos = 0;
  var len = str.length;
  var tokens = [];
  var match = /<!--[\s\S]*?-->|<\?.*?\?>|<[^>]*>/g;
  var matched = null;
  while (matched = match.exec(str)) {
    if (pos < matched.index) {
      let t2 = ["text", str.substring(pos, matched.index)];
      tokens.push(t2);
    }
    let t = ["tag", matched.toString()];
    tokens.push(t);
    pos = match.lastIndex;
  }
  if (pos < len) {
    let t = ["text", str.substring(pos, len)];
    tokens.push(t);
  }
  return tokens;
};

// node_modules/marked-smartypants/src/index.js
function markedSmartypants() {
  return {
    tokenizer: {
      inlineText(src) {
        const cap = this.rules.inline.text.exec(src);
        if (!cap) {
          return;
        }
        return {
          type: "text",
          raw: cap[0],
          text: cap[0]
        };
      }
    },
    hooks: {
      postprocess(html) {
        return SmartyPants(html, 2);
      }
    }
  };
}
export {
  markedSmartypants
};
