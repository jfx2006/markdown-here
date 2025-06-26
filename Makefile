EXTENSION = extension

all: node_modules mailext-options-sync vendored build
	touch all

build: all
	pnpm run build

ci: clean all build git_status
	python tools/rel_notes.py
	python tools/version_env.py


version: $(EXTENSION)/manifest.json pnpm-lock.json package.json
	pnpm version --allow-same-version=true --git-tag-version=false $(python tools/version.py)
	pnpm install

node_modules: package.json
	pnpm install

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/mailext-options-sync.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && pnpm install && npm run build && cp -f index.js mailext-options-sync.js

$(EXTENSION)/options/mailext-options-sync.js: mailext-options-sync/mailext-options-sync.js
	cp -v $< $@

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

vendored.mk: package.json tools/vendored.yml tools/mk-vendored.py
	python tools/mk-vendored.py

vendored: package.json node_modules vendored.mk
	make -f vendored.mk clean all

git_status:
	COUNT=$$(git status --porcelain=2 -uno | wc -l); \
	if [ $$COUNT -gt 0 ]; then \
  		echo 'ERROR!! git status found changes to tracked files. This is not okay for release.'; \
  		git status --porcelain=2 -uno; \
  		git diff \
  		exit 1; \
  	fi

clean:
	rm -f mailext-options-sync/mailext-options-sync.js
	rm -f $(EXTENSION)/options/mailext-options-sync.js
	rm -rf mailext-options-sync/node_modules
	rm -rf node_modules
	rm -f all
	make -f vendored.mk clean


