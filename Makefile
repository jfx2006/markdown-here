EXTENSION = extension
include ./tools/makecmds.mk

all: node_modules vendored build

build:
	npm run build

ci: clean all build
	python tools/rel_notes.py
	python tools/version_env.py

node_modules: package.json
	npm clean-install

npm: node_modules

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

clean:
	$(RM) all
	make -f vendored.mk clean
	$(RM) --recursive node_modules
