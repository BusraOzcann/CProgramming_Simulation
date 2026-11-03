# C Programlama Etkinliği — Başlangıçtan `for` Döngüsüne

Bilgisayar mühendisliği 1. sınıf öğrencileri için hazırlanmıştır. Hedef; küçük programlar yazmak, kullanıcıdan veri almak, koşulla karar vermek ve tekrarlayan işlemleri `for` ile ifade etmektir.

Her `.c` dosyası bağımsız bir programdır ve kendi `main` fonksiyonuna sahiptir. **Dosyaları tek tek derleyip çalıştırın.** Kodların içindeki yorumlar konuyu açıklar; sondaki `DENE` bölümleri öğrenciye verilecek küçük görevlerdir. Terminal ve editör uyumluluğu için kaynak dosyalarda Türkçe açıklamalar Latin harfleriyle yazılmıştır.

## Derleme ve çalıştırma

Terminali bu klasörde açın. C11 destekleyen Clang veya GCC gerekir. macOS'ta Clang ile:

```sh
clang -std=c11 -Wall -Wextra -Wpedantic 01_merhaba.c -o /tmp/c_etkinlik
/tmp/c_etkinlik
```

Bir sonraki örnek için yalnızca `.c` dosyasının adını değiştirip yeniden derleyin. GCC kullanıyorsanız komutun başındaki `clang` yerine `gcc` yazabilirsiniz. Derleme hata verirse önce hatayı düzeltin; eski çalıştırılabilir dosyayı yeniden çalıştırmak yeni kodu denemiş olmak değildir.

## Önerilen ders akışı

Toplam 3 × 90 dakika; oturum aralarında mola verin. Süreler öğrencilerin hızına göre esnetilebilir.

| Oturum | Süre | Konu ve dosyalar |
|---|---:|---|
| 1 | 15 dk | Algoritma: İki notun ortalamasını bulma adımlarını kâğıda yazma |
| 1 | 20 dk | İlk program ve çıktı: `01_merhaba.c` |
| 1 | 30 dk | Değişkenler: `02_degiskenler.c` |
| 1 | 25 dk | İşlemler ve ortalama: `03_aritmetik.c`, `04_sabit_not_ortalamasi.c` |
| 2 | 10 dk | Önceki örneklerden çıktı tahmini |
| 2 | 25 dk | Kullanıcıdan veri alma: `05`, `06` |
| 2 | 40 dk | Koşullar: `07`, `08` |
| 2 | 15 dk | Birleştirme uygulaması: `09_not_degerlendirme.c` |
| 3 | 10 dk | Tekrar ihtiyacı: `10_donguye_neden_ihtiyac_var.c` |
| 3 | 25 dk | İlk döngü: `11_for_temel.c` |
| 3 | 15 dk | Simülasyonda döngüyü adım adım izleme |
| 3 | 30 dk | Sırasıyla `12`, `13`, `14` alıştırmaları |
| 3 | 10 dk | Çıktı tahmini, küçük kod değişikliği ve kapanış |

Anlatım sırası: **Kısa açıklama → çalışan örnek → çıktı tahmini → küçük değişiklik → öğrencinin uygulaması.** Bütün dosyaları art arda okumak yerine öğrencilerin her adımda kod çalıştırmasına zaman ayırın. Son toplam sorusunu gerekirse birlikte çözün.

## Dosyalar ve örnek sonuçlar

| Dosya | Kazanım | Örnek girdi → beklenen sonuç |
|---|---|---|
| `01_merhaba.c` | `printf`, `\n`, program iskeleti | Girdi yok → iki satır mesaj |
| `02_degiskenler.c` | `int`, `double`, atama | Girdi yok → 18, 82.50 ve 19 değerleri |
| `03_aritmetik.c` | Aritmetik, tam sayı bölmesi, kalan | Girdi yok → toplam 7, bölüm 2, ondalıklı bölüm 2.50 |
| `04_sabit_not_ortalamasi.c` | Hesaplama ve parantez | Girdi yok → 77.50 |
| `05_kullanicidan_sayi_alma.c` | `scanf`, `&`, `int` okuma | `18` → yaş 18 |
| `06_kullanicidan_not_ortalamasi.c` | `double` okuma | `70` ve `85` → 77.50 |
| `07_if_else.c` | İki seçenekli karar | `49` → Kaldi; `50` → Gecti |
| `08_else_if.c` | Üç farklı durum | `8` → Pozitif; `-3` → Negatif; `0` → Sifir |
| `09_not_degerlendirme.c` | Veri + hesaplama + koşul | `40` ve `60` → 50.00, Gecti |
| `10_donguye_neden_ihtiyac_var.c` | Tekrarlayan komutlar | Girdi yok → 1, 2, 3, 4, 5 ayrı satırlarda |
| `11_for_temel.c` | Başlangıç, koşul, artırma | Girdi yok → önceki dosyayla aynı çıktı |
| `12_birden_ne_kadar.c` | Kullanıcıdan alınan döngü sınırı | `3` → 1, 2, 3 ayrı satırlarda |
| `13_cift_sayilar.c` | Döngü içinde koşul | `7` → 2, 4, 6 ayrı satırlarda |
| `14_sayilarin_toplami.c` | Toplam biriktirme | `5` → Toplam: 15 |

Girdileri istendiğinde yazıp Enter'a basın. Ondalık ayırıcı olarak nokta kullanın: `72.5`. Başlangıç örnekleri istenen türde geçerli sayısal giriş yapıldığını varsayar; `scanf` dönüş değeri ve hatalı giriş yönetimi bu etkinliğin kapsamı dışındadır. Not sorularında 0–100, döngü sorularında 1–1000 aralığını kullanın. Bu aralıklar kodda denetlenmez. Negatif veya sıfır döngü sınırında gövdenin hiç çalışmamasını ayrıca tartışabilirsiniz.

## Simülasyonla birlikte kullanım

Bu klasöre simülasyon dosyası eklenmedi; aşağıdaki akış mevcut simülasyonunuzla kullanılacak bir öğretim önerisidir.

Önce `11_for_temel.c` üzerinden ilerleyin. Her adımda öğrencinin sonraki değeri tahmin etmesini isteyin. Simülasyonunuz destekliyorsa `i`, koşul sonucu ve ekran çıktısını birlikte gösterin.

| Adım | `i` | `i <= 5` | İşlem |
|---|---:|---|---|
| İlk kontrol | 1 | Doğru | 1 yazdırılır, ardından `i` 2 olur |
| İkinci kontrol | 2 | Doğru | 2 yazdırılır, ardından `i` 3 olur |
| Üçüncü kontrol | 3 | Doğru | 3 yazdırılır, ardından `i` 4 olur |
| Dördüncü kontrol | 4 | Doğru | 4 yazdırılır, ardından `i` 5 olur |
| Beşinci kontrol | 5 | Doğru | 5 yazdırılır, ardından `i` 6 olur |
| Son kontrol | 6 | Yanlış | Gövde çalışmaz, döngü biter |

Ardından `i <= 5` yerine `i < 5` deneyin. Öğrencilerden neden bir satır eksildiğini açıklamalarını isteyin. `i`, `for` içinde tanımlandığından döngü dışından kullanılamaz; son kontrol değeri burada çalışma adımını anlatır.

## Karışıklığı önleyecek kısa hatırlatmalar

- `=` değer atar; `==` eşitliği kontrol eder.
- `int` için okuma ve yazdırmada `%d` kullanılır.
- `double` için `scanf` içinde `%lf`, `printf` içinde `%f` kullanılır.
- `scanf` örneklerinde değişkenin önünde `&` vardır; `printf` örneklerinde yoktur.
- `5 / 2` sonucu 2, `5.0 / 2` sonucu 2.5 olur.
- `for (...)` ve `if (...)` satırlarının sonuna `;` eklenmez; blok için süslü parantez açılır.
- `toplam = 0` başlangıçta bir kez çalışmalıdır. Döngü içine konursa her turda biriken değer silinir.

Fonksiyon yazma, diziler, pointer, iç içe döngüler, `while`, `do while`, `break` ve `continue` sonraki etkinliğe bırakılabilir.

## Ek materyal

Öğrenciye verilecek sorular: [ALISTIRMALAR.md](ALISTIRMALAR.md).

Eğitmen için kısa yanıtlar: [EGITMEN_NOTLARI.md](EGITMEN_NOTLARI.md).
