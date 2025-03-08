#!python
"""Write the version info to an environment file for Gitlab CI."""

import json
import os
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

    with open(VERSION_ENV, "w") as f:
        f.write(f"PACKAGE_VERSION={version}\n")
        f.write(f"RELEASE_NAME={version}\n")

    print(f"Version {version} written to {VERSION_ENV}.")


if __name__ == "__main__":
    main()
