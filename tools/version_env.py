#!python
"""Write the version info to an environment file for Gitlab CI."""

import json
import os
import requests
import sys
from pathlib import Path

TOP = Path(__file__).parent.parent
MANIFEST_FILE = TOP / "extension/manifest.json"
VERSION_ENV = TOP / "version.env"


def main():
    if not (ref := os.environ.get("CI_COMMIT_SHA")):
        return
    with open(MANIFEST_FILE, "r") as f:
        manifest = json.load(f)

    version = manifest["version"]
    if CI_TAG := os.environ.get("CI_COMMIT_TAG"):
        if not CI_TAG.startswith(f"{version}"):
            print(f"Tag and manifest version mismatch! {version} != {CI_TAG}")
            sys.exit(1)
    else:
        version = f"{version}+{ref[:12]}"

    release_name = version.replace("3.999.", "4.0 beta ")
    with open(VERSION_ENV, "w") as f:
        f.write(f"PACKAGE_VERSION={version}")
        f.write(f"RELEASE_NAME={release_name}")

    print(f"Version {version} written to {VERSION_ENV}.")


if __name__ == "__main__":
    main()
