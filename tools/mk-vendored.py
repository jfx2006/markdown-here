#!python

#  Copyright JFX 2021-2023
#  MIT License
#  https://gitlab.com/jfx2006

import os
from ruamel.yaml import YAML

HERE = os.path.abspath(os.path.dirname(__file__))
DATA = os.path.join(HERE, "vendored.yml")
OUT = os.path.join(HERE, "..", "vendored.mk")

CMDS = {
    "copy": "cp -v $< $@",
    "esmbuild": "./tools/esmify.sh {lib} $<",
    "rollup": "./tools/rollup.sh {lib} $<"
}


class MkVendored:
    def __init__(self):
        yaml = YAML(typ="safe")
        self.data = yaml.load(open(DATA))
        self.out = open(OUT, "w")

    def mk_header(self):
        self.out.writelines(
            [
                "EXTENSION = extension\n" "VENDOR = $(EXTENSION)/vendor\n",
                "\n",
            ]
        )

    def mk_rules(self):
        for lib, data in sorted(self.data.items()):
            self.mk_rule(lib, data)

    def mk_rule(self, lib, data):
        cmd = CMDS[data["method"]].format(lib=lib)

        self.out.writelines(
            [
                f"{lib}: $(VENDOR)/{lib}.esm.js\n" "\n" f"$(VENDOR)/{lib}.esm.js: node_modules/{lib}/{data['path']}\n",
                f"\t{cmd}\n",
                "\n",
            ]
        )

    def mk_footer(self):
        libs = " ".join(self.data.keys())
        self.out.writelines([f"all: {libs}\n"])


def main():
    vendored = MkVendored()
    vendored.mk_header()
    vendored.mk_rules()
    vendored.mk_footer()


if __name__ == "__main__":
    main()
