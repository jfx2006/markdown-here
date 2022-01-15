#!python

import os
import os.path as osp
import re

HTML_RE = re.compile(r'data-i18n="([a-z0-9_]+)"')
JS_RE = re.compile(r'getMessage\("([a-z0-9_]+)"\)')


def get_strings_from_file(path, ext):
    rv = set()
    print("Checking {}".format(path))
    with open(path) as fp:
        for line in fp:
            match = None
            if ext == "html":
                if "data-i18n" in line:
                    match = HTML_RE.search(line)
            elif ext == "js":
                if "getMessage" in line:
                    match = JS_RE.search(line)
            if match:
                match_text = match.group(1)
                if ext == "html":
                    match_text = "options_page__" + match_text
                rv.add(match_text)
    return rv


def main():
    result = set()
    src_root = osp.abspath(osp.join(osp.dirname(__file__), "..", "src"))
    for root, dirs, files in os.walk(src_root):
        for name in files:
            a, ext = osp.splitext(name)
            if ext in (".html", ".js"):
                path = osp.join(root, name)
                result.update(get_strings_from_file(path, ext[1:]))

    result = list(result)
    result.sort()
    for _string in result:
        print(_string)


if __name__ == '__main__':
    main()
