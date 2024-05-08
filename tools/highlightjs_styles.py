#!python
#  Copyright JFX 2021-2023
#  MIT License
#  https://gitlab.com/jfx2006

import os
import json
import shutil
import sys
from pathlib import Path


def mkname(n):
    n = os.path.splitext(n)[0]
    n = n.replace("-", " ")
    words = ["{}{}".format(w[0].upper(), w[1:]) for w in n.split(" ")]
    n = " ".join(words)
    return n


def styles_json(hljs, css_files):
    res = {}
    for c in css_files:
        css_file = str(c.name)
        name = mkname(css_file)
        res[name] = css_file

    styles_json = hljs / "styles.json"
    with open(styles_json, "w") as fp:
        json.dump(res, fp, indent=2, sort_keys=True)


def copy_css(source_dir, dest_dir):
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    dest_dir.mkdir(exist_ok=True)
    source_css_files = [css_file for css_file in source_dir.glob("*.css") if
                        ".min" not in css_file.suffixes]
    for css_file in source_css_files:
        shutil.copy2(css_file, dest_dir)
        yield css_file


def main(args):
    source_dir, dest_dir = [Path(a) for a in args]
    css_files = copy_css(source_dir, dest_dir)
    styles_json(dest_dir, css_files)


if __name__ == "__main__":
    main(sys.argv[1:])
