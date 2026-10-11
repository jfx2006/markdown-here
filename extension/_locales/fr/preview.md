Ceci n'est qu'un exemple. Vous pouvez essayer votre propre texte ici même. Si vous changez une option, l'aperçu se met à jour.

# Markdown

...ce n'est que du texte ordinaire, *simple et clair*. Vous **écrivez naturellement**, le résultat est soigné, et vous n'avez pas à cliquer sur des boutons de mise en forme. Certaines fonctions ci-dessous dépendent d'une option : elles sont signalées par *(option)*.

## Texte

*Italique*, **gras**, ***gras italique***, ~~barré~~ et `code en ligne`.
Un simple retour à la ligne
est conservé tel quel *(option, activée par défaut)*.

Typographie intelligente *(option, activée par défaut)* : "guillemets doubles", 'guillemets simples', tiret demi-cadratin -- tiret cadratin --- points de suspension... et flèches --> <-- ==>.

Codes emoji *(option, activée par défaut)* : :wave: :+1: :tada: :rocket:

## Liens

Les liens peuvent être [explicites](https://www.thunderbird.net), [par référence][aide-memoire] ou automatiques, comme https://fr.wikipedia.org/wiki/Markdown.

Liens vers des tickets *(option, désactivée par défaut)* : #123

[aide-memoire]: https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet

## Listes

* Les listes à puces
  * avec des puces imbriquées
    * c'est amusant !
  * et très simple
* Encore et encore !

1. Les listes numérotées aussi !
1. Pas besoin d'utiliser
1. les bons numéros

- [ ] Listes de tâches
- [x] avec cases à cocher

## Citations

> Bloc de citation.
> *Avec* **un peu de** `markdown`.
>
> > Une citation imbriquée
> >
> > > et encore un niveau.

## Code

```javascript
// Tout le code dont vous aurez jamais besoin
var bonjour = "Bonjour le monde !"
alert(bonjour);
```

```
Bloc de code
sans coloration syntaxique
```

## Tableaux

| Nom    | Commande    | Épicé  | Doit |
|--------|-------------|:------:|-----:|
| Jeanne | saag paneer | moyen  | 11 € |
| Sophie | vindaloo    | doux   | 14 € |
| Éric   | lamb madras | FORT   |  5 € |

Cellules fusionnées et largeur des colonnes : `||` fusionne une cellule avec la colonne suivante, une cellule terminée par `^|` fusionne avec celle du dessus, et un pourcentage dans la ligne de séparation fixe la largeur de la colonne.

| Équipe       |  T1 |  T2 |
|:-----40%-----|----:|----:|
| Total        ||  42 |
| Courriel     |  12 |  18 |
|             ^|   7 |   5 |

Blocs CSV et TSV *(option, désactivée par défaut ; sinon affichés comme du code)* :

```csv
Fruit;Couleur;Prix
Pomme;rouge;1,20
Banane;jaune;0,80
```

## Formules mathématiques

*(option, désactivée par défaut)* Mes maths sont si rouillées que je me souviens à peine de l'_équation du second degré_ : ${-b \pm \sqrt{b^2 - 4ac} \over 2a}$

$$e^{i\pi} + 1 = 0$$

## Images et HTML en ligne

Une image : ![logo de Markdown Here](/images/icon24.png)

Le HTML brut fonctionne aussi : <span style="color: red">texte en rouge</span>.

## Titres

# Titre 1
## Titre 2
### Titre 3
#### Titre 4
##### Titre 5
###### Titre 6

Voici une ligne horizontale :

---

fin.
