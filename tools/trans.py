#!python

from pathlib import Path

from deep_translator import (
GoogleTranslator,
MyMemoryTranslator,
LibreTranslator
)

LIBRE_BASE_URL = "https://translate.terraprint.co/"

LOCALES = "/home/rob/projects/roc-markdown-here/src/_locales"
LANGS = {
    # "de": "de-DE",
    "es": "es-ES",
    "fr": "fr-FR",
    "it": "it-IT",
    "ja": "ja-JP",
    # "ko": "ko-KR",
    "pl": "pl-PL",
    #"pt_BR": "pt-BR",
    "ru": "ru-RU",
    # "tr": "tr-TR",
    "zh_CN": "zh-CN",
    # "zh_TW": "zh-TW",
}
FILENAME = "mdhr4.md"

SRC_LANG = Path(LOCALES) / "en" / FILENAME

source_text = open(SRC_LANG).readlines()

for lang, locale in LANGS.items():
    DEST = Path(LOCALES) / lang / FILENAME
    trans = MyMemoryTranslator(source="en-US", target=locale)
    translated = trans.translate_batch(source_text)

    with open(DEST, "w") as fp:
        fp.writelines([f"{t}\n" for t in translated])
