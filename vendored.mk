EXTENSION = extension
VENDOR = $(EXTENSION)/vendor

marked-linkify-it: $(VENDOR)/marked-linkify-it.esm.js

$(VENDOR)/marked-linkify-it.esm.js: node_modules/marked-linkify-it/src/index.js
	./tools/esmify.sh marked-linkify-it $<

marked-smartypants: $(VENDOR)/marked-smartypants.esm.js

$(VENDOR)/marked-smartypants.esm.js: node_modules/marked-smartypants/src/index.js
	./tools/esmify.sh marked-smartypants $<

degausser: $(VENDOR)/degausser.esm.js

$(VENDOR)/degausser.esm.js: node_modules/degausser/src/degausser.js
	./tools/esmify.sh degausser $<

turndown: $(VENDOR)/turndown.esm.js

$(VENDOR)/turndown.esm.js: node_modules/turndown/lib/turndown.browser.es.js
	cp -v $< $@

all: marked-linkify-it marked-smartypants degausser turndown
