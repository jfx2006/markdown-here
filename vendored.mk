EXTENSION = extension
VENDOR = $(EXTENSION)/vendor

marked: $(VENDOR)/marked.esm.js

$(VENDOR)/marked.esm.js: node_modules/marked/lib/marked.esm.js
	cp -v $< $@

marked-linkify-it: $(VENDOR)/marked-linkify-it.esm.js

$(VENDOR)/marked-linkify-it.esm.js: node_modules/marked-linkify-it/src/index.js
	./tools/rollup.sh marked-linkify-it $<

marked-smartypants: $(VENDOR)/marked-smartypants.esm.js

$(VENDOR)/marked-smartypants.esm.js: node_modules/marked-smartypants/src/index.js
	./tools/rollup.sh marked-smartypants $<

marked-highlight: $(VENDOR)/marked-highlight.esm.js

$(VENDOR)/marked-highlight.esm.js: node_modules/marked-highlight/src/index.js
	cp -v $< $@

marked-extended-tables: $(VENDOR)/marked-extended-tables.esm.js

$(VENDOR)/marked-extended-tables.esm.js: node_modules/marked-extended-tables/src/index.js
	cp -v $< $@

marked-emoji: $(VENDOR)/marked-emoji.esm.js

$(VENDOR)/marked-emoji.esm.js: node_modules/marked-emoji/src/index.js
	cp -v $< $@

degausser: $(VENDOR)/degausser.esm.js

$(VENDOR)/degausser.esm.js: node_modules/degausser/src/degausser.js
	./tools/rollup.sh degausser $<

turndown: $(VENDOR)/turndown.esm.js

$(VENDOR)/turndown.esm.js: node_modules/turndown/lib/turndown.browser.es.js
	cp -v $< $@

all: marked marked-linkify-it marked-smartypants marked-highlight marked-extended-tables marked-emoji degausser turndown
