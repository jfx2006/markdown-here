#!python
"""Write the version info to an environment file for Gitlab CI."""

import json
import os
import sys
from pathlib import Path

TOP = Path(__file__).parent.parent
MANIFEST_FILE = TOP / "extension/manifest.json"
PACKAGES_FILE = TOP / "packages.json"

def main():
    with open(MANIFEST_FILE, "r") as f:
        manifest = json.load(f)
        version = manifest["version"]

    print(version)

if __name__ == "__main__":
    main()

