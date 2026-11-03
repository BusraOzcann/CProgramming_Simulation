/* KONU: Dongu boyunca bir toplam biriktirmek.
 * Alistirmada n icin 1 ile 1000 arasinda bir tam sayi kullan.
 */
#include <stdio.h>

int main(void) {
    int n;
    int toplam = 0; /* Henuz sayi eklenmedigi icin baslangic degeri 0. */

    printf("Kaca kadar toplansin? (1-1000):\n");
    scanf("%d", &n);

    for (int i = 1; i <= n; i++) {
        toplam = toplam + i; /* Onceki toplama o anki sayiyi ekle. */
    }

    printf("Toplam: %d\n", toplam);
    /* Sonucu bir kez yazdirmak icin printf dongunun disindadir. */

    return 0;
}

/* n = 3 icin:
 * Baslangic: toplam = 0
 * i = 1: toplam = 0 + 1 = 1
 * i = 2: toplam = 1 + 2 = 3
 * i = 3: toplam = 3 + 3 = 6
 * i = 4: kosul yanlis; dongu biter.
 * DENE: Dongunun icine printf("Ara toplam: %d\n", toplam); ekle.
 * DUSUN: toplam = 0 dongunun icinde olsaydi neden sonuc yanlis olurdu?
 */
