#!python
"""Update updates.json for auto updates."""

import hashlib
import json
from pathlib import Path

import requests

TOP = Path(__file__).parent.parent
UPDATES_FILE = TOP / "updates.json"
VERSION_ENV = TOP / "version.env"
RELEASE_FILE = TOP / "web-ext-artifacts/markdown-here-revival.xpi"
ADDON_ID = "markdown-here-revival@xul.calypsoblue.org"
UPDATES_URL = "https://gitlab.com/jfx2006/markdown-here-revival/-/releases/permalink/latest/downloads/updates.json"
XPI_URL = "https://gitlab.com/jfx2006/markdown-here-revival/-/releases/{version}/downloads/markdown_here_revival-{version}.xpi"


def hash_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        while True:
            data = fh.read(8192)
            if not len(data):
                break
            h.update(data)

    return h.hexdigest()


def main():
    sha256sum = hash_file(RELEASE_FILE)

    version = None
    with open(VERSION_ENV, "r") as f:
        for line in f:
            key, value = line.split("=", 1)
            if key == "PACKAGE_VERSION":
                version = value
                break
    if version is None:
        raise Exception(f"PACKAGE_VERSION not found in {VERSION_ENV}.")
    version = version.strip('"\n')

    req = requests.get(UPDATES_URL)
    updates = req.json()

    update = {"version": version, "update_link": XPI_URL.format(version=version), "update_hash": f"sha256:{sha256sum}"}
    updates["addons"][ADDON_ID]["updates"].append(update)

    with open(UPDATES_FILE, "w") as f:
        json.dump(updates, f, indent=2, sort_keys=True, ensure_ascii=False, separators=(",", ": "))

    print(f"Updates file created at {UPDATES_FILE}.")


if __name__ == "__main__":
    main()
