Bu yalnızca bir örnektir. Kendi metninizi hemen burada deneyebilirsiniz. Herhangi bir seçeneği değiştirirseniz önizleme güncellenir.

# Markdown

...aslında sıradan bir metinden ibarettir, *sade ve basit*. **Doğal bir şekilde yazarsınız**, sonuç güzel görünür ve biçimlendirme düğmelerine tıklamanız gerekmez. Aşağıdaki bazı özellikler bir seçeneğe bağlıdır: bunlar *(seçenek)* olarak işaretlenmiştir.

## Metin

*İtalik*, **kalın**, ***kalın italik***, ~~üstü çizili~~ ve `satır içi kod`.
Tek bir satır sonu
olduğu gibi korunur *(seçenek, varsayılan olarak etkin)*.

Akıllı tipografi *(seçenek, varsayılan olarak etkin)*: "çift tırnak", 'tek tırnak', kısa tire -- uzun tire --- üç nokta... ve oklar --> <-- ==>.

Emoji kısa kodları *(seçenek, varsayılan olarak etkin)*: :wave: :+1: :tada: :rocket:

## Bağlantılar

Bağlantılar [açık](https://www.thunderbird.net), [başvurulu][rehber] ya da otomatik olabilir, örneğin https://tr.wikipedia.org/wiki/Markdown.

Hata bağlantıları *(seçenek, varsayılan olarak devre dışı)*: #123

[rehber]: https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet

## Listeler

* Madde işaretli listeler
  * iç içe maddelerle
    * çok eğlenceli!
  * ve son derece kolay
* Daha, daha, daha!

1. Numaralı listeler de var!
1. Doğru numaraları
1. kullanmanıza bile gerek yok

- [ ] Görev listeleri
- [x] onay kutularıyla

## Alıntılar

> Bir alıntı bloğu.
> **Biraz** `markdown` *ile*.
>
> > İç içe bir alıntı
> >
> > > ve bir düzey daha.

## Kod

```javascript
// İhtiyacınız olacak tüm kod
var hw = "Hello World!"
alert(hw);
```

```
Sözdizimi vurgulaması
olmayan düz kod bloğu
```

## Tablolar

| Ad    | Öğle siparişi | Acılı | Borç |
|-------|---------------|:-----:|-----:|
| Ayşe  | saag paneer   | orta  | 11 € |
| Selin | vindaloo      | hafif | 14 € |
| Elif  | lamb madras   | ACI   |  5 € |

Birleştirilmiş hücreler ve sütun genişlikleri: `||` bir hücreyi sonraki sütunla birleştirir, `^|` ile biten bir hücre üstündeki hücreyle birleşir ve ayırıcı satırdaki bir yüzde değeri sütun genişliğini belirler.

| Ekip         |  Ç1 |  Ç2 |
|:-----40%-----|----:|----:|
| Toplam       ||  42 |
| Posta        |  12 |  18 |
|             ^|   7 |   5 |

CSV ve TSV blokları *(seçenek, varsayılan olarak devre dışı; aksi halde kod olarak gösterilir)*:

```csv
Meyve;Renk;Fiyat
Elma;kırmızı;1,20
Muz;sarı;0,80
```

## Matematik formülleri

*(seçenek, varsayılan olarak devre dışı)* Matematiğim o kadar paslandı ki _ikinci dereceden denklemin kök formülünü_ zar zor hatırlıyorum: ${-b \pm \sqrt{b^2 - 4ac} \over 2a}$

$$e^{i\pi} + 1 = 0$$

## Görseller ve satır içi HTML

Bir görsel: ![Markdown Here logosu](/images/icon24.png)

Ham HTML de çalışır: <span style="color: red">kırmızı metin</span>.

## Başlıklar

# Başlık 1
## Başlık 2
### Başlık 3
#### Başlık 4
##### Başlık 5
###### Başlık 6

İşte yatay bir çizgi

---

son.
