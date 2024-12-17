EXTENSION = extension

all: node_modules mailext-options-sync vendored changelog
	pnpm run release

ci: clean all
	python tools/rel_notes.py
	python tools/version_env.py


version: $(EXTENSION)/manifest.json pnpm-lock.json package.json
	pnpm version --allow-same-version=true --git-tag-version=false $(python tools/version.py)
	pnpm install

changelog:  $(EXTENSION)/CHANGELOG.md

$(EXTENSION)/CHANGELOG.md: CHANGELOG.md
	cp -f CHANGELOG.md $(EXTENSION)/CHANGELOG.md

node_modules: package.json
	pnpm install

vendored.mk: package.json tools/vendored.yml tools/mk-vendored.py
	python tools/mk-vendored.py

vendored: node_modules vendored.mk
	make -f vendored.mk all

clean:
	rm -rf node_modules
	make -f vendored.mk clean


