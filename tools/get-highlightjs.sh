#!/bin/bash

set +ev

declare HLJS_VER="10.5.0"

declare -a HLJS_LANGS
declare -a HLJS_STYL

HLJS_LANGS=("xml" "django" "tcl" "handlebars"
  "crystal" "apache" "properties" "xquery"
  "diff" "cpp" "kotlin" "ruby"
  "dos" "swift" "http" "nsis"
  "scilab" "python" "python-repl" "vala"
  "powershell" "java" "nginx" "ldif"
  "markdown" "yaml" "bash" "asciidoc"
  "go" "coffeescript" "csharp" "scss"
  "dockerfile" "r" "cmake" "less"
  "objectivec" "nix" "typescript" "puppet"
  "plaintext" "json" "awk" "julia"
  "glsl" "perl" "shell" "lua"
  "makefile" "rust" "php" "vbnet"
  "c" "css" "javascript" "qml"
  "sql" "ini" "brainfuck" "php-template"
)


git clone https://github.com/highlightjs/highlight.js hljs

git -C hljs checkout "${HLJS_VER}"

cd hljs || exit 1
npm i
# shellcheck disable=SC2086
node tools/build.js -t browser --no-minify ${HLJS_LANGS[*]}

mkdir highlightjs && mkdir highlightjs/styles
# Use uncompressed styles
mv src/styles/*.css highlightjs/styles/
mv build/highlight.js highlightjs/
cp LICENSE highlightjs/

python3 << _EOF_
import os
import json

def mkname(n):
     n=os.path.splitext(n)[0]
     n=n.replace('-', ' ')
     words=["{}{}".format(n[0].upper(), n[1:]) for w in n.split(' ')]
     n=" ".join(words)
     return n

css_files = os.listdir("highlightjs/styles/")
css_files.sort()
res={}
for c in css_files:
    name=mkname(c)
    res[name]=c

with open("highlightjs/styles/styles.js", "w") as fp:
    json.dump(res, fp, indent=2, sort_keys=True)
_EOF_

cd ..  # tools dir
mv -f hljs/highlightjs .

rm -rf hljs

echo "Hopefully you have a built highlights ${HLJS_VER} in highlighjs/."
echo "Move to your src/ directory to use it."
