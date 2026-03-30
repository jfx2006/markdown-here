#!python

"""Download the latest Gitlab CLI binary (deb package). This is too complex
to nicely do in .gitlab-ci.yml. This wouldn't be needed if there was a stable
link that always points to the latest release!
"""

from pathlib import Path

import requests

TOP = Path(__file__).parent.parent
VERSION_ENV = TOP / "version.env"

RELEASES_API = "https://gitlab.com/api/v4/projects/gitlab-org%2Fcli/releases/"
OUT_FILE = "/tmp/gitlab-cli.tar.gz"

def main():
    print("Downloading latest Gitlab CLI deb package")
    r = requests.get(RELEASES_API)
    r.raise_for_status()
    data = r.json()
    release = data[0]
    try:
        tar_link = [link for link in release["assets"]["links"] if link["name"].endswith("linux_amd64.tar.gz")]
    except KeyError:
        print("No tar.gz link found")
        raise

    if len(tar_link) != 1:
        raise Exception(f"Expected 1 deb link, got {len(tar_link)}")

    tar_link = tar_link[0]["direct_asset_url"]

    with open(VERSION_ENV, "a") as f:
        f.write(f"GLAB_URL={tar_link}\n")

    print(f"Wrote GLAB_URL to {VERSION_ENV} ({tar_link})")

if __name__ == "__main__":
    main()