# Eğitmen Notları

Bu dosya ALISTIRMALAR.md sorularının kısa yanıtlarını içerir. Döngü sorularının tam çalışan çözümleri 11–14 numaralı kaynak dosyalardadır.

## Alıştırma yanıtları

1. İki `printf` çağrısı veya içinde `\n` bulunan tek çağrı yeterlidir.
2. `int yil = 2026;` ile tanımla, yazdır, sonra `yil = 2027;` ile değiştirip yeniden yazdır. İkinci kez `int yil` yazılmaz.
3. Alan: `6 * 4 = 24`; çevre: `2 * (6 + 4) = 20`.
4. Sırasıyla 3, 3.5 ve 1. İki tam sayının bölümü tam sayıdır.
5. 06 numaralı dosya. Örnek: 70 ve 85 → 77.50.
6. Koşul `sayi > 10`. 11 ilk dala; 10 ve 9 ikinci dala girer.
7. 08 numaralı dosya. Pozitif, negatif ve sıfır için ayrı giriş denensin.
8. 09 numaralı dosya. 40 ve 60 → 50.00, Gecti. 40 ve 58 → 49.00, Kaldi.
9. 11 numaralı dosyada koşulu `i <= 10` yap.
10. 12 numaralı dosya.
11. 13 numaralı dosya. Sınır 7 ise 2, 4, 6 yazılır.
12. 14 numaralı dosya. `n = 1` → 1; `n = 5` → 15; `n = 1000` → 500500.

## Çıkış soruları yanıtları

1. `=` atama, `==` eşitlik karşılaştırması yapar.
2. Üç kez çalışır; 1, 2 ve 3 yazılır. Sonraki kontrolde `i = 4` olduğu için koşul yanlıştır.
3. Başlangıç bir kez çalışır. Her gövdeden sonra artırma, ardından koşul kontrolü yapılır.
4. İçeride olursa her turda önceki toplam sıfırlanır; bu örnekte en sonda yalnızca son eklenen sayı kalır.
5. Tek tırnak: `'A'`; yazdırma belirteci: `%c`.
6. `break` yoksa sonraki `case` içindeki komutlar da çalışmaya devam edebilir. `default` hiçbir `case` eşleşmediğinde çalışır.
7. Aralıklar için `if / else if` uygundur. `switch`, sabit tam sayı veya karakter değerlerini eşleştirir.

## Ek görevlerin yanıtları

- Karakter ve sıcaklık: `char sube = 'B';`, `float sicaklik = 24.5f;`. `printf("%c %.1f\n", sube, sicaklik);` ile yazdırılır. 02 numaralı dosyada çalışan örnek vardır.
- Not aralıkları: `08a_not_araliklari.c`. 49 → Kaldi, 50 ve 69 → Gecer, 70 ve 84 → Iyi, 85 → Cok iyi. Eşikleri büyükten küçüğe kontrol edin.
- Menü: `08b_switch_case.c` dosyasındaki üç mesajı görevdeki mesajlarla değiştirin; `default` geçersiz seçimi karşılar. 1, 2, 3 ve 9 ile deneyin.
- `08a` içindeki koşullar bağımsız `if` ifadelerine çevrilirse 90 için üç koşul da doğrudur; üç mesaj yazılır. Sondaki `else` yalnızca `if (not >= 50)` ifadesine bağlanır. Zincirin neden tek bir seçim yaptığı böyle gösterilebilir.

## Anlatım ipuçları

- Bir öğrenciden çıktıyı, başka bir öğrenciden gerekçesini isteyin.
- `main` ve `#include` yapısını başlangıçta hazır iskelet olarak verin. Ayrıntılı bellek ve pointer anlatımına girmeyin.
- Önce tek koşulu oturtun. Mantıksal operatörleri bu akışa yetiştirmek zorunda değilsiniz.
- `char` için tek karakterle başlayın; isim saklama ve Türkçe karakter kodlaması ayrıntılarına girmeyin. `float` tipini tanıtıp hesaplamalarda `double` kullanmaya devam edin.
- `else if` örneğinde 90'ın neden yalnızca ilk dala girdiğini sorun. Ardından menü örneğiyle `switch` konusuna geçin.
- `switch` içindeki ilk `break` kaldırıldığında 1 seçimiyle iki mesaj yazıldığını gösterin; sonra `break` satırını geri ekleyin.
- Döngüde ilk koşul yanlışsa gövdenin hiç çalışmadığını gösterin: 12 numaralı dosyada `n = 0` girin.
- Öğrenci `for` başlığını açıklayamıyorsa toplam sorusuna geçmeden 11 numaralı örneği yeniden izleyin.
- Simülasyonun işlevlerini varsaymadan mevcut özellikleriyle başlangıç, koşul, gövde ve artırma sırasını görünür kılın.
- Ders örnekleri geçerli sayısal giriş varsayar. Hatalı giriş yönetimini ayrı bir derse bırakın.
