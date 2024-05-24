#!python3
"""
Build emoji_codes.json file for the marked-emoji plugin.
Uses emojbase-data to get the Github shortcodes.
"""
import json
import sys


def get_data(source_file):
    with open(source_file) as f:
        return json.load(f)


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


def main(source, dest):
    emoji_data = get_data(source)
    emoji_shortcuts = {}
    for gh_code, shortcuts in emoji_data.items():
        if type(shortcuts) == str:
            shortcuts = [shortcuts]
        entities = gh_uni2char(gh_code)
        for s in shortcuts:
            emoji_shortcuts[s] = entities

    with open(dest, "w") as fp:
        json.dump(
            emoji_shortcuts,
            fp,
            sort_keys=True,
            ensure_ascii=False,
            separators=(",", ":"),
        )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
