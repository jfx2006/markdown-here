#!/usr/bin/env python

import json
import os.path as osp
from mintrans import GoogleTranslator

SOURCE_LANG = "en"
WEBEXT_LOCALES = [
        # "de",
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
    google_translator = GoogleTranslator()

    src_root = osp.abspath(osp.join(osp.dirname(__file__), "..", "extension"))
    with open(osp.join(src_root, "_locales/en/messages.json")) as fp:
        source_strings_data = json.load(fp)

    source_messages_items = [(key, source_strings_data[key]["message"]) for key in source_strings_data.keys() if not key.startswith("__WET")]
    source_messages = dict(source_messages_items)

    for lang in WEBEXT_LOCALES:
        print(f"Translating {lang}.")
        with open(osp.join(src_root, f"_locales/{lang}/messages.json")) as fp:
            lang_data = json.load(fp)

        dest_messages = [lang_data[key]["message"] for key in
                                 lang_data.keys() if key in source_messages]

        gt = google_translator.translate("\n".join(dest_messages), lang, "en-US")
        print(gt)
        for s in gt["sentences"]:
            trans = s["trans"].strip()
            orig = s["orig"].strip()
            print(f"{trans:<70} {orig}")

        print("************")


if __name__ == "__main__":
    main()
