
all: extension
	npm install
	cp -f CHANGELOG.md extension/CHANGELOG.md
	npm run build

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

extension/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f extension/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules
