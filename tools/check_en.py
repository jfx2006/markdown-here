#!python3

import os.path as osp
import json

WEBEXT_LOCALES = [
        "de",
        "es",
        "fr",
        "it",
        "ja",
        "ko",
        "pl",
        "pt_BR",
        "ru",
        "tr",
        "zh_CN",
        "zh_TW",
    ]


def main():
    result = set()
    src_root = osp.abspath(osp.join(osp.dirname(__file__), "..", "extension"))
    with open(osp.join(src_root, "_locales/en/messages.json")) as fp:
        source_strings_data = json.load(fp)

    source_messages_items = [(key, source_strings_data[key]["message"]) for key in source_strings_data.keys() if not key.startswith("__WET")]
    source_messages = dict(source_messages_items)

    for lang in WEBEXT_LOCALES:
        with open(osp.join(src_root, f"_locales/{lang}/messages.json")) as fp:
            lang_data = json.load(fp)

        for key, msg in source_messages.items():
            if key in lang_data:
                tr_msg = lang_data[key]["message"]
                if tr_msg == msg:
                    print(f"{lang}: {key} is {tr_msg}")
        print("\n")


if __name__ == "__main__":
    main()
