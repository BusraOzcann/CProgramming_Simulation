/* KONU: Degiskenler, int ve double.
 * int tam sayilari, double ondalikli sayilari tutar.
 */
#include <stdio.h>

int main(void) {
    int yas = 18;
    double notOrtalamasi = 82.5;

    /* = sagdaki degeri soldaki degiskene atar. */
    printf("Yas: %d\n", yas); /* %d: int deger icin. */
    printf("Not ortalamasi: %.2f\n", notOrtalamasi);
    /* %f: double yazdirir. %.2f: virgulden sonra iki basamak gosterir. */

    yas = 19; /* Yeni degisken olusturmaz; mevcut degeri degistirir. */
    printf("Yeni yas: %d\n", yas);

    return 0;
}

/* DENE: yas degerini degistir. Ciktilari calistirmadan once tahmin et. */
