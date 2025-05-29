#!python
"""Utility to bump the extension version in manifest.json and package.json."""

import json
import sys
from pathlib import Path

TOP = Path(__file__).parent.parent
MANIFEST_FILE = TOP / "extension/manifest.json"
PACKAGES_FILE = TOP / "package.json"


def update_version_file(filepath: Path, new_version: str) -> None:
    with open(filepath, "r") as f:
        data = json.load(f)

    data["version"] = new_version

    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)


def main(new_version: str):
    update_version_file(MANIFEST_FILE, new_version)
    update_version_file(PACKAGES_FILE, new_version)


if __name__ == "__main__":
    try:
        version = sys.argv[1]
    except IndexError:
        print("Usage: version_bump.py <version>")
        raise

    main(version)
