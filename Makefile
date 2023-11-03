EXTENSION = extension

all: mailext-options-sync vendored.mk
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md
	npm run build
	sh tools/gen-src.sh

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

$(EXTENSION)/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

vendored.mk: package.json tools/vendored.yml tools/mk-vendored.py
	npm install
	python tools/mk-vendored.py
	make -f vendored.mk all

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f $(EXTENSION)/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules


