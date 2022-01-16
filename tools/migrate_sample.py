#!python

import os.path as osp
import json

LOCALES = "/home/rob/projects/mdhr-l10n/_locales"
LANGS = (
    "de",
    "en",
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
)


def load_messages(lang_code):
    msg_file = osp.join(LOCALES, lang_code, "messages.json")
    data = json.load(open(msg_file))
    return data


def write_preview(lang_code, text):
    with open(osp.join(LOCALES, lang_code, "preview.md"), "w") as fp:
        fp.write(text)


def main():
    for lang in LANGS:
        messages = load_messages(lang)
        preview_md = messages.get("options_page__preview_markdown").get("message")
        write_preview(lang, preview_md)


if __name__ == "__main__":
    main()
