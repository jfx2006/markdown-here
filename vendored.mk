EXTENSION = extension

include ./tools/makecmds.mk

bootstrap: $(EXTENSION)/vendor/bootstrap.bundle.js

$(EXTENSION)/vendor/bootstrap.bundle.js: node_modules/bootstrap/dist/js/bootstrap.bundle.js
	$(CP) $< $@

bootswatch: $(EXTENSION)/vendor/bootswatch.css

$(EXTENSION)/vendor/bootswatch.css: node_modules/bootswatch/dist/darkly/bootstrap.css
	$(CP) $< $@

degausser: $(EXTENSION)/vendor/degausser.esm.js

$(EXTENSION)/vendor/degausser.esm.js: node_modules/degausser/src/degausser.js
	./node_modules/.bin/rollup --format es --file "$(EXTENSION)/vendor/degausser.esm.js" -p @rollup/plugin-node-resolve -p @rollup/plugin-commonjs -m inline $<


dompurify: $(EXTENSION)/vendor/purify.es.mjs

$(EXTENSION)/vendor/purify.es.mjs: node_modules/dompurify/dist/purify.es.mjs
	$(CP) $< $@

emoji_codes: $(EXTENSION)/data/emoji_codes.json

$(EXTENSION)/data/emoji_codes.json: node_modules/emojibase-data/en/shortcodes/github.json
	node ./tools/emoji-grab.js $< $@

highlightjs: $(EXTENSION)/highlightjs/highlightjs.esm.js

$(EXTENSION)/highlightjs/highlightjs.esm.js: node_modules/highlight.js/es/common.js
	./node_modules/.bin/rollup --format es \
	--file "$(EXTENSION)/highlightjs/highlightjs.esm.js" \
	-p @rollup/plugin-node-resolve \
	-p @rollup/plugin-commonjs \
	$<
	node ./tools/highlightjs_styles.js node_modules/highlight.js/styles $(EXTENSION)/highlightjs/styles

mailext-options-sync: $(EXTENSION)/options/mailext-options-sync.js

$(EXTENSION)/options/mailext-options-sync.js: node_modules/@jfx2006/mailext-options-sync/index.js
	$(CP) $< $@

marked: $(EXTENSION)/vendor/marked.esm.js

$(EXTENSION)/vendor/marked.esm.js: node_modules/marked/lib/marked.esm.js
	$(CP) $< $@

marked-emoji: $(EXTENSION)/vendor/marked-emoji.esm.js

$(EXTENSION)/vendor/marked-emoji.esm.js: node_modules/marked-emoji/src/index.js
	$(CP) $< $@

marked-extended-tables: $(EXTENSION)/vendor/marked-extended-tables.esm.js

$(EXTENSION)/vendor/marked-extended-tables.esm.js: node_modules/marked-extended-tables/src/index.js
	$(CP) $< $@
	node ./tools/dos2unix.js $@

marked-highlight: $(EXTENSION)/vendor/marked-highlight.esm.js

$(EXTENSION)/vendor/marked-highlight.esm.js: node_modules/marked-highlight/src/index.js
	$(CP) $< $@

marked-linkify-it: $(EXTENSION)/vendor/marked-linkify-it.esm.js

$(EXTENSION)/vendor/marked-linkify-it.esm.js: node_modules/marked-linkify-it/src/index.js
	./node_modules/.bin/rollup --format es --file "$(EXTENSION)/vendor/marked-linkify-it.esm.js" -p @rollup/plugin-node-resolve -p @rollup/plugin-commonjs -m inline $<


textcomplete: $(EXTENSION)/vendor/textcomplete.js

$(EXTENSION)/vendor/textcomplete.js: node_modules/@textcomplete/contenteditable/src/index.ts
	node tools/bundle-textcomplete.mjs $@

texzilla: $(EXTENSION)/vendor/TeXZilla.js

$(EXTENSION)/vendor/TeXZilla.js: node_modules/texzilla/TeXZilla.js
	$(CP) $< $@
	node ./tools/fileappend.js $@ "export default TeXZilla"

turndown: $(EXTENSION)/vendor/turndown.esm.js

$(EXTENSION)/vendor/turndown.esm.js: node_modules/turndown/lib/turndown.browser.es.js
	$(CP) $< $@

clean:
	$(RM) $(EXTENSION)/vendor/*
	$(RM) $(EXTENSION)/data/emoji_codes.json
	$(RM) $(EXTENSION)/highlightjs/highlightjs.esm.js $(EXTENSION)/highlightjs/styles/*.css
	$(RM) $(EXTENSION)/options/mailext-options-sync.js

all: marked marked-linkify-it marked-highlight marked-extended-tables marked-emoji degausser highlightjs turndown textcomplete emoji_codes dompurify bootstrap bootswatch texzilla mailext-options-sync
