EXTENSION = extension
VENDOR = $(EXTENSION)/vendor

npm_install:
	npm install

all: mailext-options-sync marked-linkify-it marked-smartypants
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md
	npm run build

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

$(EXTENSION)/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

$(VENDOR)/marked-linkify-it.esm.js: ./node_modules/marked-linkify-it/src/index.js
	./tools/esmify.sh marked-linkify-it ./node_modules/marked-linkify-it/src/index.js

marked-linkify-it: npm_install $(VENDOR)/marked-linkify-it.esm.js

$(VENDOR)/marked-smartypants.esm.js: ./node_modules/marked-smartypants/src/index.js
	./tools/esmify.sh marked-smartypants ./node_modules/marked-smartypants/src/index.js

marked-smartypants: npm_install $(VENDOR)/marked-smartypants.esm.js

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f $(EXTENSION)/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules


