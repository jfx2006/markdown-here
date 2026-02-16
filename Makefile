EXTENSION = extension
include ./tools/makecmds.mk

all: node_modules mailext-options-sync vendored build
	$(TOUCH) all

build:
	npm run build

ci: clean all build
	python tools/rel_notes.py
	python tools/version_env.py

node_modules: package.json
	npm install

MAILEXT_OPTIONS_SYNC_FILES = index.ts globals.d.ts
MAILEXT_OPTIONS_SYNC_DEPS := $(addprefix mailext-options-sync/,$(MAILEXT_OPTIONS_SYNC_FILES))

mailext-options-sync/index.js: $(MAILEXT_OPTIONS_SYNC_DEPS)
	cd mailext-options-sync && npm install && npm run build

$(EXTENSION)/options/mailext-options-sync.js: mailext-options-sync/index.js
	$(CP) $< $@

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

vendored.mk: package.json tools/vendored.yml tools/mk-vendored.py
	python tools/mk-vendored.py

vendored-clean: package.json node_modules vendored.mk
	make -f vendored.mk clean all

vendored: package.json node_modules vendored.mk
	make -f vendored.mk all

git_status:
	COUNT=$$(git status --porcelain=2 -uno | wc -l); \
	if [ $$COUNT -gt 0 ]; then \
  		echo 'ERROR!! git status found changes to tracked files. This is not okay for release.'; \
  		git status --porcelain=2 -uno; \
  		git diff; \
  		exit 1; \
  	fi

$(RIMRAF):
	npm install rimraf

clean: $(RIMRAF)
	$(RM) mailext-options-sync/mailext-options-sync.js
	$(RM) $(EXTENSION)/options/mailext-options-sync.js
	$(RM) mailext-options-sync/node_modules
	$(RM) all
	make -f vendored.mk clean
	$(RM) node_modules
