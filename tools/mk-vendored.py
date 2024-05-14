#!python

#  Copyright JFX 2021-2023
#  MIT License
#  https://gitlab.com/jfx2006

import os
from ruamel.yaml import YAML

HERE = os.path.abspath(os.path.dirname(__file__))
DATA = os.path.join(HERE, "vendored.yml")
OUT = os.path.join(HERE, "..", "vendored.mk")

CMDS_v1 = {
    "copy": "cp -v $< $@",
    "esmbuild": "./tools/esmify.sh {lib} $<",
    "rollup": "./tools/rollup.sh {lib} $<",
}


class MkVendored:
    def __init__(self):
        yaml = YAML(typ="safe")
        yaml_data = yaml.load(open(DATA))
        if yaml_data["version"] == 2:
            self.commands = yaml_data["commands"]
            self.vendored = yaml_data["vendored"]
        else:
            self.commands = CMDS_v1
            self.vendored = yaml_data
        self.out = open(OUT, "w")

    def mk_header(self):
        self.out.writelines(
            [
                "EXTENSION = extension\n",
                "\n",
            ]
        )

    def mk_rules(self):
        clean_cmds = []
        for lib, data in sorted(self.vendored.items()):
            clean_cmds.extend(self.mk_rule(lib, data))

        self.out.writelines([
            "clean:\n",
        ] + [f"\t{cmd}\n" for cmd in clean_cmds])

    def mk_rule(self, lib, context):
        vendor_prefix = context.pop("vendor_prefix", "vendor")
        context["vendor_prefix"] = vendor_prefix
        if "node_pkg" not in context:
            context["node_pkg"] = lib
        context["lib"] = lib

        if path := context.pop("path", None):
            paths = {f"{lib}.esm.js": path}
        else:
            paths = context.pop("paths")

        method = context.pop("method")
        if method == "bash":
            cmds = context.pop("cmds")
        else:
            cmds = [self.commands[method].format(**context)]

        target_files = [f"$(EXTENSION)/{vendor_prefix}/{tf}" for tf in paths.keys()]
        tf_str = " ".join(target_files)
        self.out.writelines([f"{lib}: {tf_str}\n\n"])

        for dest, src in paths.items():
            context.update({"dest": f"$(EXTENSION)/{vendor_prefix}/{dest}", "src": src})

            rule = (
                [
                    "{dest}: node_modules/{node_pkg}/{src}".format(**context),
                ]
                + ["\t" + cmd.format(**context) for cmd in cmds]
                + [
                    "",
                ]
            )

            self.out.writelines([f"{line}\n" for line in rule])

            yield "rm -f {dest}".format(**context)
            if "clean" in context:
                cmd = context.pop("clean")
                yield cmd.format(**context)

    def mk_footer(self):
        libs = " ".join(self.vendored.keys())
        self.out.writelines([f"\nall: {libs}\n"])


def main():
    vendored = MkVendored()
    vendored.mk_header()
    vendored.mk_rules()
    vendored.mk_footer()


if __name__ == "__main__":
    main()
