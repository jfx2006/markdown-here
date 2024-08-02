#!/usr/bin/env python

import copy
import json
import sys
from pathlib import Path
import argostranslate.package
import mmh3
from argostranslate.translate import get_installed_languages, ITranslation

SOURCE_LANG = "en"
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
ARGOS_LOCALES = [
        "de",
        "es",
        "fr",
        "it",
        "ja",
        "ko",
        "pl",
        "pt",
        "ru",
        "tr",
        "zh",
        "zt",
    ]
LOCALES = dict(zip(WEBEXT_LOCALES, ARGOS_LOCALES))
print(LOCALES)

def mkHash(s):
    a = mmh3.hash128(s, signed=False)
    return hex(((a & 0xffffffffffffffff) << 64) + (a >> 64))[2:]

class ArgosTranslate:
    SOURCE_LANG = "en"

    def __init__(self, locales_path: Path):
        self.locales_path = locales_path
        argostranslate.package.update_package_index()
        self.available_packages = argostranslate.package.get_available_packages()
        self.installed_packages = argostranslate.package.get_installed_packages()
        self._installed_languages = []
        self._from_language = None

        self.update_packages()

    @staticmethod
    def mk_package_map(package_list):
        keys = [f"{p.type}-{p.from_code}_{p.to_code}" for p in package_list]
        return dict(zip(keys, package_list))

    def update_packages(self):
        """
        Install/update argos packages
        """
        available_packages = self.mk_package_map(self.available_packages)
        installed_packages = self.mk_package_map(self.installed_packages)
        install_packages = self.mk_package_map(
            list(
                filter(
                    lambda x: x.from_code == SOURCE_LANG and x.to_code in LOCALES,
                    self.available_packages,
                )
            )
        )
        for package in install_packages.keys():
            if package in installed_packages:
                if (
                    install_packages[package].package_version
                    > installed_packages[package].package_version
                ):
                    installed_packages[package].update()
                    continue
            download_path = available_packages[package].download()
            argostranslate.package.install_from_path(download_path)
        self.installed_packages = argostranslate.package.get_installed_packages()
        self._installed_languages = []

    @property
    def installed_languages(self):
        if not self._installed_languages:
            self._installed_languages = get_installed_languages()
        return self._installed_languages

    @property
    def from_lang(self):
        if self._from_language is None:
            self._from_language = list(
                filter(lambda x: x.code == SOURCE_LANG, self.installed_languages)
            )[0]
        return self._from_language

    @staticmethod
    def print_results(results):
        for result in results:
            print(result)

    def code2argos(self, input_code):
        if "-" in input_code:
            input_code = input_code.replace("-", "_")
        if input_code in LOCALES:
            return LOCALES[input_code]

    def translate_all_locales(self):
        result_paths = []
        for locale in LOCALES:
            result_paths.append(self.translate_single_locale(locale))

        self.print_results(result_paths)

    def translate_single_locale(self, locale: str):
        argos_locale = self.code2argos(locale)
        print(f"Translating {locale} ({argos_locale}).")
        to_lang = list(filter(lambda x: x.code == argos_locale, self.installed_languages))[0]
        translation = self.from_lang.get_translation(to_lang)
        source_file = self.locales_path / "en" / "messages.json"
        dest_file = self.get_i18n_output_path(locale, source_file)
        self.i18n_translate(source_file, dest_file, translation)
        print("")
        return dest_file

    def get_i18n_output_path(self, locale: str, file_path: Path):
        dir_path = file_path.parent.parent

        out_path = dir_path / locale / "messages.json"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        return out_path

    def i18n_translate(self, source_file: Path, dest_file: Path, underlying_translation: ITranslation):
        with open(source_file, "r") as fp:
            messages_source = json.load(fp)

        if dest_file.exists() and dest_file.is_file():
            with open(dest_file, "r") as fp:
                print("Existing messages.json file found. Updating.")
                messages_dest = json.load(fp)
        else:
            print(f"Translating entire source file to {dest_file}.")
            messages_dest = {}
        new_messages_dest = {}

        count = 0
        skip = 0

        # Iterate through messages by key from the source file. If the message key is present in the destination file
        # and "hash" matches the source language hash, skip it. Otherwise, translate it.
        # Messages are added in order to new_messages_dest so order matches the source language,
        # Extra keys in translated languages are dropped because we never iterate through messages_dest.
        for key in messages_source.keys():
            source_message = messages_source[key].get("message", "")
            if source_message.startswith("__WET_GROUP__"):
                new_messages_dest[key] = copy.deepcopy(messages_source[key])
                skip += 1
                continue
            if source_message == "__WET_LOCALE__" and key in messages_dest.keys():
                new_messages_dest[key] = copy.deepcopy(messages_dest[key])
                skip += 1
                continue

            source_hash = mkHash(source_message)
            if key in messages_dest.keys():
                dest_hash = messages_dest[key].get("hash")
                if dest_hash is not None and source_hash == dest_hash:
                    new_messages_dest[key] = copy.deepcopy(messages_dest[key])
                    skip += 1
                    continue

            new_message = copy.deepcopy(messages_source[key])
            new_message["message"] = underlying_translation.translate(source_message)
            new_message["hash"] = source_hash

            new_messages_dest[key] = new_message
            count += 1

        with open(dest_file, "w", encoding="utf-8") as fp:
            json.dump(new_messages_dest, fp, ensure_ascii=False, indent=2)

        print(f"Translated count: {count}")
        print(f"Skipped count: {skip}")
        return dest_file


def main(locales_path: Path):
    if not locales_path.is_dir():
        raise NotADirectoryError(locales_path)
    translator = ArgosTranslate(locales_path)
    translator.translate_all_locales()


if __name__ == "__main__":
    try:
        argv1 = Path(sys.argv[1])
    except Exception as e:
        print(f"Problem initializing {sys.argv[1]} for translations.")
        raise
    sys.exit(main(argv1))
