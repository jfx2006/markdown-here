EXTENSION = extension

all: node_modules mailext-options-sync vendored changelog
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md
	pnpm run release
	sh tools/gen-src.sh
	python tools/rel_notes.py
	python tools/version_env.py
	python tools/updates.py

changelog: $(EXTENSION)/CHANGELOG.md _changelog

_changelog: CHANGELOG.md
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md

node_modules: package.json
	pnpm install

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && pnpm install && npm run build

$(EXTENSION)/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

vendored.mk: package.json tools/vendored.yml tools/mk-vendored.py
	python tools/mk-vendored.py

vendored: node_modules vendored.mk
	make -f vendored.mk all

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f $(EXTENSION)/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules
	make -f vendored.mk clean


