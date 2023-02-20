#!python3
"""
Build emoji_codes.json file for the marked-emoji plugin.
Uses emojbase-data to get the Github shortcodes.
"""
import base64
import hashlib
import json
import urllib.request

EMOJI_DATA_URL = (
    "https://cdn.jsdelivr.net/npm/emojibase-data@7.0.1/en/shortcodes/github.json"
)
SRI = "sha256-5a7Eb4HZlJ96h5mEoGiwQCCr3muluHSDcNOYktzP86A="


def check_sri(content, sri):
    alg, hash = sri.split("-")
    if alg not in ("sha256", "sha384", "sha512"):
        raise Exception(f"Unsupported hash algorithm {alg}!")
    hasher = hashlib.new(alg, content)
    digest = hasher.digest()
    my_hash = base64.standard_b64encode(digest).decode("ascii")
    assert my_hash == hash


def get_data(url):
    with urllib.request.urlopen(url) as f:
        data = f.read()
    check_sri(data, SRI)
    return json.loads(data)


def gh_uni2entities(code):
    """1F461 --> &#x1F461
    1F1F7-1F1FC --> &#x1F1F7;&#x1F1FC;
    """
    codes = code.split("-")
    entities = "".join([f"&#x{c};" for c in codes])
    return entities


def gh_uni2char(code):
    """2764 --> \u2764
    1F1F7-1F1FC --> \U0001F1F7\U0001F1FC
    """
    codes = code.split("-")
    char = "".join([chr(int(c, 16)) for c in codes])
    return char


def main():
    emoji_data = get_data(EMOJI_DATA_URL)
    emoji_shortcuts = {}
    for gh_code, shortcuts in emoji_data.items():
        if type(shortcuts) == str:
            shortcuts = [shortcuts]
        entities = gh_uni2char(gh_code)
        for s in shortcuts:
            emoji_shortcuts[s] = entities

    with open("../src/data/emoji_codes.json", "w") as fp:
        json.dump(
            emoji_shortcuts,
            fp,
            sort_keys=True,
            ensure_ascii=False,
            separators=(",", ":"),
        )


if __name__ == "__main__":
    main()
