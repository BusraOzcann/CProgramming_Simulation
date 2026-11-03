/* KONU: Degiskenler, int, double, char ve float.
 * int: tam sayi. double ve float: ondalikli sayi. char: tek karakter.
 */
#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int yas = 18;
    double notOrtalamasi = 82.5;
    char sube = 'A'; /* Tek karakter tek tirnakla yazilir. */
    float sicaklik = 23.5f; /* Sondaki f, sabitin float oldugunu belirtir. */
    bool dogruMu = false;

    /* = sagdaki degeri soldaki degiskene atar. */
    printf("Yas: %d\n", yas); /* %d: int deger icin. */
    printf("Not ortalamasi: %.2f\n", notOrtalamasi);
    /* %f: double yazdirir. %.2f: virgulden sonra iki basamak gosterir. */
    printf("Sube: %c\n", sube); /* %c: karakter yazdirir. */
    printf("Sicaklik: %.1f\n", sicaklik);
    /* printf icinde hem float hem double icin %f kullanilabilir.
     * %.1f virgulden sonra bir basamak gosterir.
     * double genellikle float'tan daha fazla hassasiyet sunar.
     * Bu etkinligin hesaplama orneklerinde double kullanacagiz.
     */

    yas = 19; /* Yeni degisken olusturmaz; mevcut degeri degistirir. */
    printf("Yeni yas: %d\n", yas);

    return 0;
}

/* DENE: yas ve sube degerlerini degistir. Ciktilari once tahmin et.
 * DIKKAT: 'A' bir karakter, "A" ise bir metin ifadesidir.
 * char bir ismi saklamak icin kullanilmaz. Metinleri dizilerde ogrenecegiz.
 * Baslangicta 'A', 'B', '7', '?' gibi tek baytlik karakterler kullan.
 * '7' karakteri ile 7 tam sayisi ayni deger degildir.
 */
