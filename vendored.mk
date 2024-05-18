EXTENSION = extension

degausser: $(EXTENSION)/vendor/degausser.esm.js

$(EXTENSION)/vendor/degausser.esm.js: node_modules/degausser/src/degausser.js
	./tools/rollup.sh degausser $<

dentity: $(EXTENSION)/vendor/dentity.esm.js

$(EXTENSION)/vendor/dentity.esm.js: node_modules/dentity/src/dentity.js
	./tools/rollup.sh dentity $<

highlightjs: $(EXTENSION)/highlightjs/highlightjs.esm.js

$(EXTENSION)/highlightjs/highlightjs.esm.js: node_modules/highlight.js/es/index.js
	./node_modules/.bin/rollup --format es \
	--file "$(EXTENSION)/highlightjs/highlightjs.esm.js" \
	-p @rollup/plugin-node-resolve \
	-p @rollup/plugin-commonjs \
	$<
	python ./tools/highlightjs_styles.py node_modules/highlight.js/styles $(EXTENSION)/highlightjs/styles

marked: $(EXTENSION)/vendor/marked.esm.js

$(EXTENSION)/vendor/marked.esm.js: node_modules/marked/lib/marked.esm.js
	cp -v $< $@

marked-emoji: $(EXTENSION)/vendor/marked-emoji.esm.js

$(EXTENSION)/vendor/marked-emoji.esm.js: node_modules/marked-emoji/src/index.js
	cp -v $< $@

marked-extended-tables: $(EXTENSION)/vendor/marked-extended-tables.esm.js

$(EXTENSION)/vendor/marked-extended-tables.esm.js: node_modules/marked-extended-tables/src/index.js
	cp -v $< $@

marked-highlight: $(EXTENSION)/vendor/marked-highlight.esm.js

$(EXTENSION)/vendor/marked-highlight.esm.js: node_modules/marked-highlight/src/index.js
	cp -v $< $@

marked-linkify-it: $(EXTENSION)/vendor/marked-linkify-it.esm.js

$(EXTENSION)/vendor/marked-linkify-it.esm.js: node_modules/marked-linkify-it/src/index.js
	./tools/rollup.sh marked-linkify-it $<

textcomplete: $(EXTENSION)/vendor/textcomplete.esm.js

$(EXTENSION)/vendor/textcomplete.esm.js: node_modules/@textcomplete/contenteditable/src/index.ts
	node tools/bundle-textcomplete.mjs
	cp -v textcomplete-bundle.mjs $@

turndown: $(EXTENSION)/vendor/turndown.esm.js

$(EXTENSION)/vendor/turndown.esm.js: node_modules/turndown/lib/turndown.browser.es.js
	cp -v $< $@

clean:
	rm -f $(EXTENSION)/vendor/degausser.esm.js
	rm -f $(EXTENSION)/vendor/dentity.esm.js
	rm -f $(EXTENSION)/highlightjs/highlightjs.esm.js
	rm -rf $(EXTENSION)/highlightjs/styles
	rm -f $(EXTENSION)/vendor/marked.esm.js
	rm -f $(EXTENSION)/vendor/marked-emoji.esm.js
	rm -f $(EXTENSION)/vendor/marked-extended-tables.esm.js
	rm -f $(EXTENSION)/vendor/marked-highlight.esm.js
	rm -f $(EXTENSION)/vendor/marked-linkify-it.esm.js
	rm -f $(EXTENSION)/vendor/textcomplete.esm.js
	rm -f $(EXTENSION)/vendor/turndown.esm.js

all: marked marked-linkify-it marked-highlight marked-extended-tables marked-emoji degausser highlightjs turndown dentity textcomplete
