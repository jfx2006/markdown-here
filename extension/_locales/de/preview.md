Dies ist nur ein Beispiel. Sie können hier direkt mit Ihrem eigenen Text experimentieren. Wenn Sie eine Option ändern, wird die Vorschau aktualisiert.

# Markdown

...ist eigentlich nur gewöhnlicher Text, *schlicht und einfach*. Sie **schreiben ganz natürlich**, das Ergebnis sieht gut aus, und Sie müssen keine Formatierungsschaltflächen anklicken. Einige der folgenden Funktionen hängen von einer Option ab: Sie sind mit *(Option)* gekennzeichnet.

## Text

*Kursiv*, **fett**, ***fett kursiv***, ~~durchgestrichen~~ und `Inline-Code`.
Ein einfacher Zeilenumbruch
bleibt erhalten *(Option, standardmäßig aktiviert)*.

Intelligente Typografie *(Option, standardmäßig aktiviert)*: "doppelte Anführungszeichen", 'einfache Anführungszeichen', Halbgeviertstrich -- Geviertstrich --- Auslassungspunkte... und Pfeile --> <-- ==>.

Emoji-Kurzcodes *(Option, standardmäßig aktiviert)*: :wave: :+1: :tada: :rocket:

## Links

Links können [explizit](https://www.thunderbird.net), [per Referenz][spickzettel] oder automatisch sein, etwa https://de.wikipedia.org/wiki/Invader_Zim.

Bug-Links *(Option, standardmäßig deaktiviert)*: #123

[spickzettel]: https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet

## Listen

* Aufzählungslisten
  * mit verschachtelten Punkten
    * machen Spaß!
  * und sind ganz einfach
* Mehr, mehr, mehr!

1. Nummerierte Listen auch!
1. Sie müssen nicht einmal
1. die richtigen Zahlen verwenden

- [ ] Aufgabenlisten
- [x] mit Kontrollkästchen

## Zitate

> Ein Blockzitat.
> *Mit* **etwas** `Markdown`.
>
> > Ein verschachteltes Zitat
> >
> > > und noch eine Ebene.

## Code

```javascript
// Der ganze Code, den Sie je brauchen werden
var hw = "Hallo Welt!"
alert(hw);
```

```
Einfacher Codeblock
ohne Syntaxhervorhebung
```

## Tabellen

| Name   | Bestellung  | Schärfe | Schuldet |
|--------|-------------|:-------:|---------:|
| Jana   | saag paneer | mittel  |     11 € |
| Sabine | vindaloo    | mild    |     14 € |
| Erika  | lamb madras | SCHARF  |      5 € |

Verbundene Zellen und Spaltenbreiten: `||` verbindet eine Zelle mit der nächsten Spalte, eine Zelle, die mit `^|` endet, wird mit der Zelle darüber verbunden, und eine Prozentangabe in der Trennzeile legt die Spaltenbreite fest.

| Team         |  Q1 |  Q2 |
|:-----40%-----|----:|----:|
| Gesamt       ||  42 |
| Mail         |  12 |  18 |
|             ^|   7 |   5 |

CSV- und TSV-Blöcke *(Option, standardmäßig deaktiviert; sonst als Code angezeigt)*:

```csv
Obst;Farbe;Preis
Apfel;rot;1,20
Banane;gelb;0,80
```

## Mathematische Formeln

*(Option, standardmäßig deaktiviert)* Meine Mathekenntnisse sind so eingerostet, dass ich mich kaum an die _Mitternachtsformel_ erinnere: ${-b \pm \sqrt{b^2 - 4ac} \over 2a}$

$$e^{i\pi} + 1 = 0$$

## Bilder und Inline-HTML

Ein Bild: ![Logo von Markdown Here](/images/icon24.png)

Auch reines HTML funktioniert: <span style="color: red">roter Text</span>.

## Überschriften

# Überschrift 1
## Überschrift 2
### Überschrift 3
#### Überschrift 4
##### Überschrift 5
###### Überschrift 6

Hier eine horizontale Linie:

---

Ende.
