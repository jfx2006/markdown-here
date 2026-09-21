# Accessibility audit — 2026-09-15

Audit lecture seule, réalisé suite au ticket GitLab #69 (demande de meilleur support lecteur d'écran).
Sert de base à une future feature accessibilité (pas de code touché à ce stade). Fichiers/lignes cités
sont ceux de l'état du dépôt au 2026-09-15 — à revérifier avant de s'y fier si repris plus tard.

## 1. État actuel constaté

**Preview live (mode modern)**
- Injection : `experiments/customui/parent.js:201-257` crée un `<browser type="content">` XUL (pas un
  widget natif), inséré dans un `<vbox>` sidebar + `<splitter>` (`:343-370`, `:635-671`). Aucun
  `aria-label`/`role`/`tooltiptext` sur le `<browser>` ni sur le `vbox` : la zone n'a pas de nom
  accessible ; le splitter (redimensionnement) est souris-only.
- Page hôte `compose_preview/compose_preview.html:28` : `<iframe id="preview_frame"
  sandbox="allow-same-origin">` sans `title`. Document interne `preview_iframe.html:36` :
  `<div class="markdown-here-wrapper">` nu — pas de `role="region"`, pas d'`aria-label`, pas d'`aria-live`.
- Mise à jour : `compose_preview.js:112` `contentDiv.replaceChildren(...)` déclenché par MutationObserver
  + debounce 500 ms (`composescript.js:118,172-181,198-207`). Le contenu entier est remplacé en silence, à
  chaque frappe (après debounce). Aucun mécanisme d'annonce ; un `aria-live` naïf ici serait catastrophique
  (lecture intégrale du mail toutes les 500 ms).
- `compose_preview.js:252-254` : `onclick = preventDefault` sur toute la preview → liens non activables,
  mais rien n'empêche l'iframe d'être atteinte par Tab (contenu texte statique, donc juste bruit de
  navigation).
- Point positif : quand `hidden`, `previewCol.style.display = "none"` (`parent.js:294,307`) → retiré de
  l'arbre d'accessibilité. Bon.
- `compose_preview.js:181` : le `div.mdhr-raw` (source MD encodée base64 dans `title`, injecté dans le mail
  envoyé) a `aria-hidden="true"`. Bon pour les destinataires.
- Rendu HTML final : sémantique standard (h1-h6, ul/ol, table, pre/code via marked) ; formules math →
  `<img alt="{mathcode}">` (`options/options-storage.js:39`, `marked-texzilla.js:72`). Bon.
- Scroll sync (`composescript.js:160-170`) : purement visuel, sans effet a11y.

**Mode classic**
- `backgroundscript.js:368-404` + `compose_preview.js:145-153` + `parent.js:309-319` : le rendu se fait à
  la demande (bouton/raccourci), la preview passe en 100 % largeur et l'éditeur est réduit à `width: 0px`
  (`parent.js:313`). Pas de mise à jour continue ⇒ pas de bruit AT. MAIS : l'éditeur reste dans le
  DOM/focus à largeur 0 (focus reste dessus, invisible) et rien ne déplace le focus vers la preview, rien
  n'annonce le changement d'état. Le lecteur d'écran ne sait pas que le rendu a eu lieu. Structurellement
  plus simple que le mode modern (aucune mise à jour dynamique), mais reste muet.

**Bouton composeAction / raccourci**
- `manifest.json:34-67` : `compose_action` avec `default_title` i18n ; `backgroundscript.js:497-535
  updateHotKey()` met à jour le `title` ("Enable/Disable markdown preview\n<raccourci>") selon l'état → le
  nom accessible du bouton de barre d'outils reflète bien l'état. Bon.
- Raccourci `Ctrl+Alt+M` (`manifest.json:68-75`), configurable via `options/shortcuts.js` — fonctionne au
  clavier sans souris. Bon.
- Menu contextuel "Reset Preview" (`backgroundscript.js:164-168`) : menu natif TB, accessible.

**Barre de notification "forgot to render"**
- `backgroundscript.js:290-297, 449-495` via `experiments/notificationbar/implementation.js:71-80` →
  `MozElements.NotificationBox.appendNotification` = widget natif Thunderbird (label + boutons natifs).
  Correctement exposé par AT en principe. Le schéma supporte `accesskey` (`notificationbar/schema.json:157`)
  mais MDHR ne le passe pas (`backgroundscript.js:482-491`). Pas de focus déplacé sur la barre :
  l'utilisateur au clavier qui vient d'appuyer Ctrl+Entrée n'a aucun retour immédiat que l'envoi est
  bloqué.

**Options (`options/options.html`)**
- Bon : tous les `<input>` ont `<label for>` (l.126-336), tabpanels `role="tabpanel"` +
  `aria-labelledby` (l.52,113,310,365), toasts `role="alert" aria-live="assertive"` (l.915,918), icônes
  `aria-hidden` (l.405,416), `lang="en"`.
- Gaps : nav pills = `<a>` sans `href` ni `role="tab"`, `<nav>` sans `role="tablist"` (l.23-35) → non
  focusables au clavier, la page est inutilisable sans souris au-delà du premier onglet ;
  `activatePillNav` n'écoute que `click` (`options.js:151-158`). `<label for="preview_input"></label>`
  vide (l.352) et `<iframe id="preview">` sans `title` (l.356). Labels sans `for` sur des cartes
  (l.330,347,368 — `<label>` utilisé comme titre). `hotkey-input` (l.171) : capture clavier brute ;
  Tab/Escape sont gérés (`shortcuts.js:257-262`), OK.

**Auto-complétion emoji (`auto-emoji.js` + `vendor/textcomplete.js`)**
- Popover `ul.dropdown-menu` sans `role="listbox"`/`option`, sans `aria-activedescendant`, sans annonce
  (grep vide sur aria dans textcomplete.js). Intercepte Entrée/flèches dans l'éditeur quand ouvert. Pour un
  utilisateur AT : keystrokes détournées silencieusement. Activé seulement si preview visible + option
  (`composescript.js:184-196`).

## 2. Gaps priorisés

1. **Aucun feedback AT sur l'état rendu/non rendu** (modern et classic) : toggle silencieux ; en classic
   l'éditeur reste focus à largeur 0 → l'utilisateur "tape dans le vide" sans savoir.
2. **Preview modern : zone sans nom, sans rôle, mise à jour silencieuse** ; splitter souris-only.
3. **Onglets de la page d'options non atteignables au clavier** (`<a>` sans href/role).
4. **Popup emoji sans ARIA**, vole Entrée/flèches (désactivable par option, mais par défaut ?).
5. **Notification "forgot to render" sans accesskey ni focus** ; l'appui Ctrl+Entrée semble ne rien faire.
6. Mineur : `<iframe>` sans `title` (x2), label vide `preview_input`, `<label>` sans `for` comme titres de
   carte.

## 3. Pistes réalistes (coût raisonnable)

- **Live region dédiée aux annonces d'état** (pas au contenu) : dans `compose_preview.html`, ajouter un
  `<div id="mdhr-status" role="status" aria-live="polite" class="visually-hidden">` ; `togglePreview`/
  `toggleClassicPreview` (`compose_preview.js:133-153`) y écrivent "Markdown preview enabled/disabled" /
  "Markdown rendered" (nouvelles chaînes i18n). Faible coût ; mais le `<browser>` doit être accessible
  depuis la fenêtre compose — à vérifier par test réel. Alternative plus sûre : annoncer côté
  composescript.js (document de l'éditeur, qui a déjà le focus) via un nœud `aria-live` inséré dans le body
  de l'éditeur avec `contenteditable="false"` et `class="markdown-here-exclude"` — attention à ne pas
  l'envoyer dans le mail (filtrer dans `getMdhrRaw`/`MdhrMangle`) ; plus risqué, à évaluer.
- **Mode classic : gestion du focus** — après rendu, déplacer le focus dans la preview
  (`p_iframe.contentDocument.body.focus()` avec `tabindex="-1"` sur `.markdown-here-wrapper` +
  `role="document"` + `aria-label="Rendered markdown preview"`), et le renvoyer à l'éditeur au retour. Ce
  mode devient alors une vraie "lecture du rendu" utilisable au lecteur d'écran — recommander classic aux
  utilisateurs AT en attendant mieux.
- **Nommer la preview** : `title="Markdown preview"` sur `compose_preview.html:28`,
  `role="region" aria-label` sur le wrapper `preview_iframe.html:36`, `tooltiptext`/`aria-label` sur le
  `<browser>` dans `parent.js:insertWebextFrame`. Ne PAS mettre `aria-live` sur le wrapper de contenu en
  modern (ou alors `aria-live="off"` explicite + option utilisateur "announce preview updates" avec
  `polite` et `aria-atomic="false"`, opt-in seulement).
- **Options** : remplacer `<a>` par `<button type="button" role="tab">` (ou `<a href="#docs">`),
  `role="tablist"` sur `<nav>`, gérer flèches gauche/droite (Bootstrap Tab le fait déjà si role="tab" +
  tablist présents). `title` sur `#preview`, label texte sur `preview_input`.
- **Notification** : passer `accesskey` aux boutons (`backgroundscript.js:482-491`, schéma déjà supporté) ;
  ajouter "Markdown not rendered:" en tête du label pour que l'annonce soit explicite.
- **Emoji popup** : `role="listbox"` sur `textcomplete.dropdown.el`, `role="option"` + `aria-selected` sur
  les items via les hooks Textcomplete (`dropdown.el` accessible dans `auto-emoji.js:60`), ou au minimum
  documenter la désactivation de l'option.
- **Test sans expertise** : Linux → Orca (`orca` + Thunderbird), Windows → NVDA (gratuit) ; macOS →
  VoiceOver (Cmd+F5). Inspecter l'arbre a11y de la fenêtre compose via Thunderbird > Outils > Outils de
  développement > Accessibilité (DevTools Toolbox, onglet "Accessibility" inclut un audit et un
  simulateur). Ça permet de vérifier nom/rôle du `<browser>` injecté sans lecteur d'écran.
- Aucune mention a11y dans CHANGELOG/README à ce jour : sujet vierge.
