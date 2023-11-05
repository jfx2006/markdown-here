#!python

#  Copyright JFX 2021-2023
#  MIT License
#  https://gitlab.com/jfx2006

import os
import os.path as osp
import re

HTML_RE = re.compile(r'data-i18n="([a-z0-9_]+)"')
JS_RE = re.compile(r'getMessage\("([a-z0-9_]+)"(,.+)?\)')
MANIFEST_RE = re.compile(r'__MSG_([a-z0-9_]+)__')

def get_strings_from_file(path, ext):
    rv = set()
    print("Checking {}".format(path))
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
    for _string in result:
        print(_string)


if __name__ == '__main__':
    main()
