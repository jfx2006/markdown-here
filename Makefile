
all: src/options/mailext-options-sync.js marked-linkify-it marked-smartypants
	npm install
	npm run build

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

src/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@


src/vendor/marked-linkify-it.esm.js: ./node_modules/marked-linkify-it/src/index.js
	./tools/esmify.sh marked-linkify-it ./node_modules/marked-linkify-it/src/index.js

src/vendor/marked-smartypants.esm.js: ./node_modules/marked-smartypants/src/index.js
	./tools/esmify.sh marked-smartypants ./node_modules/marked-smartypants/src/index.js

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f src/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules


marked-linkify-it: src/vendor/marked-linkify-it.esm.js
marked-smartypants: src/vendor/marked-smartypants.esm.js
