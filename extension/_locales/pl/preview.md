To tylko przykład. Możesz tutaj wypróbować własny tekst. Po zmianie dowolnej opcji podgląd zostanie zaktualizowany.

# Markdown

...to po prostu zwykły tekst, *prosty i przejrzysty*. **Piszesz naturalnie**, wynik wygląda dobrze i nie trzeba klikać przycisków formatowania. Niektóre funkcje poniżej zależą od opcji: są oznaczone jako *(opcja)*.

## Tekst

*Kursywa*, **pogrubienie**, ***pogrubiona kursywa***, ~~przekreślenie~~ i `kod w wierszu`.
Pojedynczy podział wiersza
jest zachowywany *(opcja, domyślnie włączona)*.

Inteligentna typografia *(opcja, domyślnie włączona)*: "cudzysłów podwójny", 'cudzysłów pojedynczy', półpauza -- pauza --- wielokropek... i strzałki --> <-- ==>.

Kody emoji *(opcja, domyślnie włączona)*: :wave: :+1: :tada: :rocket:

## Odnośniki

Odnośniki mogą być [jawne](https://www.thunderbird.net), [przez referencję][sciagawka] lub automatyczne, np. https://pl.wikipedia.org/wiki/Markdown.

Odnośniki do zgłoszeń *(opcja, domyślnie wyłączona)*: #123

[sciagawka]: https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet

## Listy

* Listy punktowane
  * z zagnieżdżonymi punktami
    * są fajne!
  * i bardzo proste
* Więcej, więcej, więcej!

1. Listy numerowane też!
1. Nie trzeba nawet używać
1. właściwych numerów

- [ ] Listy zadań
- [x] z polami wyboru

## Cytaty

> Blok cytatu.
> *Z* **odrobiną** `markdown`.
>
> > Zagnieżdżony cytat
> >
> > > i jeszcze jeden poziom.

## Kod

```javascript
// Cały kod, jakiego kiedykolwiek będziesz potrzebować
var hw = "Hello World!"
alert(hw);
```

```
Zwykły blok kodu
bez kolorowania składni
```

## Tabele

| Imię   | Zamówienie  | Ostre   | Dług |
|--------|-------------|:-------:|-----:|
| Joanna | saag paneer | średnie | 11 € |
| Zofia  | vindaloo    | łagodne | 14 € |
| Ewa    | lamb madras | OSTRE   |  5 € |

Scalone komórki i szerokość kolumn: `||` scala komórkę z następną kolumną, komórka zakończona `^|` scala się z komórką powyżej, a wartość procentowa w wierszu separatora ustala szerokość kolumny.

| Zespół       |  K1 |  K2 |
|:-----40%-----|----:|----:|
| Razem        ||  42 |
| Poczta       |  12 |  18 |
|             ^|   7 |   5 |

Bloki CSV i TSV *(opcja, domyślnie wyłączona; w przeciwnym razie wyświetlane jako kod)*:

```csv
Owoc;Kolor;Cena
Jabłko;czerwony;1,20
Banan;żółty;0,80
```

## Wzory matematyczne

*(opcja, domyślnie wyłączona)* Moja matematyka jest tak zardzewiała, że ledwo pamiętam _wzór na pierwiastki równania kwadratowego_: ${-b \pm \sqrt{b^2 - 4ac} \over 2a}$

$$e^{i\pi} + 1 = 0$$

## Obrazy i HTML w treści

Obraz: ![Logo Markdown Here](/images/icon24.png)

Surowy HTML też działa: <span style="color: red">czerwony tekst</span>.

## Nagłówki

# Nagłówek 1
## Nagłówek 2
### Nagłówek 3
#### Nagłówek 4
##### Nagłówek 5
###### Nagłówek 6

Oto linia pozioma

---

koniec.
