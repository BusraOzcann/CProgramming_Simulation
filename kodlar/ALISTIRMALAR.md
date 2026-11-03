# Öğrenci Alıştırmaları

Her soruda önce ne yapacağını bir iki cümleyle yaz, sonra kodla. Çalıştırmadan önce beklediğin çıktıyı tahmin et. İlgili örneği değiştirerek başlayabilirsin.

## 1. oturum

1. Adını ve bölümünü iki ayrı satırda yazdır.
2. `int` türünde bir `yil` değişkeni oluştur. Önce 2026 değerini, sonra değerini değiştirip 2027'yi yazdır.
3. Kenar uzunlukları 6 ve 4 olan bir dikdörtgenin alanını ve çevresini hesapla.
4. `7 / 2`, `7.0 / 2` ve `7 % 2` ifadelerinin sonuçlarını tahmin et, sonra kodla kontrol et.

Ek görev: `char` türünde bir şube harfi, `float` türünde bir sıcaklık tanımlayıp yazdır. Karakter için tek tırnak, `float` sabiti için `f` son ekini kullan.

## 2. oturum

5. Kullanıcıdan iki sınav notu alıp ortalamalarını yazdır. Notların eşit ağırlıklı olduğunu varsay.
6. Kullanıcının girdiği tam sayı 10'dan büyükse `Buyuk`, diğer durumlarda `10 veya daha kucuk` yazdır.
7. Bir tam sayının pozitif, negatif veya sıfır olduğunu yazdır.
8. İki notun ortalaması 50 ve üzerindeyse `Gecti`, değilse `Kaldi` yazdır. 40 ve 60 ile dene; ardından 40 ve 58 ile dene.

Ek görevler:

- `if / else if / else` ile notu sınıflandır: 85 ve üzeri `Cok iyi`, 70–84 `Iyi`, 50–69 `Gecer`, 50 altı `Kaldi`. Tam sayı ve 0–100 arasında not kullan. 49, 50, 69, 70, 84 ve 85 ile dene.
- `switch / case` ile 1 için `Basla`, 2 için `Yardim`, 3 için `Cikis secildi` yazdır. Diğer sayılarda `Gecersiz secim` yazdır. Her seçeneğin sonunda `break` kullan. Bu görev bir menü döngüsü içermez; yalnızca seçilen mesajı yazdırır.

## 3. oturum

9. `for` kullanarak 1'den 10'a kadar sayıları ayrı satırlarda yazdır.
10. Kullanıcıdan `n` al. 1'den `n`'e kadar sayıları yazdır. `n` için 1–1000 arasında tam sayı kullan.
11. Önceki soruyu değiştirerek yalnızca çift sayıları yazdır.
12. 1'den `n`'e kadar sayıların toplamını hesapla. `n = 5` için sonuç 15 olmalı.

## Çıkış soruları

1. `=` ve `==` arasındaki fark nedir?
2. `for (int i = 1; i < 4; i++)` döngüsünde gövde kaç kez çalışır? Gövdede `printf("%d\n", i);` varsa hangi sayılar yazılır?
3. Döngünün başlangıç bölümü her turda tekrar çalışır mı?
4. Toplam biriktirirken `toplam = 0` satırı neden döngünün dışında olmalıdır?
5. `char` değerini hangi tırnakla yazar, hangi biçim belirteciyle ekrana basarız?
6. `switch` içinde `break` kaldırılırsa ne olabilir? `default` ne işe yarar?
7. Not aralıklarını kontrol etmek için `switch` mi, `if / else if` mi uygundur?
