EXTENSION = extension

all: node_modules mailext-options-sync vendored
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md
	npm run build
	sh tools/gen-src.sh

node_modules: package.json
	npm install

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

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


