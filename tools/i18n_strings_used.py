#!python

#  Copyright JFX 2021-2023
#  MIT License
#  https://gitlab.com/jfx2006

import os
import os.path as osp
import json
import re

from blessings import Terminal
# from bs4 import BeautifulSoup

HTML_RE = re.compile(r'data-i18n="([a-z0-9_]+)"')
JS_RE = re.compile(r'getMessage\("([a-z0-9_]+)"(,.+)?\)')
MANIFEST_RE = re.compile(r"__MSG_([a-z0-9_]+)__")


def get_strings_from_file(path, ext):
    rv = set()
    print(f"Checking {path}")
    with open(path) as fp:
        for line in fp:
            match = None
            if ext == "html":
                if "data-i18n" in line:
                    match = HTML_RE.search(line)
            elif ext in "mjs, js":
                if "getMessage" in line:
                    match = JS_RE.search(line)
            elif os.path.basename(path) == "manifest.json":
                if "__MSG" in line:
                    match = MANIFEST_RE.search(line)
            if match:
                match_text = match.group(1)
                if ext == "html":
                    match_text = "options_page__" + match_text
                rv.add(match_text)
    return rv


def main():
    T = Terminal()

    result = set()
    src_root = osp.abspath(osp.join(osp.dirname(__file__), "..", "extension"))
    for root, dirs, files in os.walk(src_root):
        for name in files:
            a, ext = osp.splitext(name)
            if ext in (".html", ".js", ".mjs") or name == "manifest.json":
                path = osp.join(root, name)
                result.update(get_strings_from_file(path, ext[1:]))

    result = list(result)
    result.sort()
    print("\n\n")
    print(T.bold_blue("Used strings"))
    for _string in result:
        print(_string)

    print("\n\n")
    with open(osp.join(src_root, "_locales/en/messages.json")) as fp:
        source_strings_data = json.load(fp)

    string_keys = set(source_strings_data.keys())
    unused_strings = string_keys - set(result)
    print(T.bold_red("Unused source strings"))
    for _string in unused_strings:
        if _string.startswith("__WET_"): continue
        print(_string)

    print("\n\n")
    missing_strings = set(result) - string_keys
    print(T.bold_red("Missing source strings"))
    for _string in missing_strings:
        if _string.startswith("__WET_GROUP__"): continue
        print(_string)
        # content = source_strings_data[_string]["message"]
        # print(T.yellow(f"  {content}"))


if __name__ == "__main__":
    main()
