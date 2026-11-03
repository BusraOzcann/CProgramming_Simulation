/* KONU: Birden fazla else if ve kosullarin sirasi.
 * Bunlar etkinlik icin ornek not araliklaridir; resmi not sistemi degildir.
 * Bu ornekte kullanicinin 0-100 arasinda bir not girdigi varsayilir.
 */
#include <stdio.h>

int main(void) {
    int not;

    printf("Notunuzu girin (0-100):\n");
    scanf("%d", &not);

    if (not >= 85) {
        printf("Cok iyi\n");
    } else if (not >= 70) {
        printf("Iyi\n");
    } else if (not >= 50) {
        printf("Gecer\n");
    } else {
        printf("Kaldi\n");
    }

    /* Ornek: not = 75 ise ilk kosul yanlis, ikinci kosul dogrudur.
     * Iyi yazilir; sonraki kosullara bakilmaz.
     * Ikinci kosulda ayrica not < 85 yazmamiza gerek yok:
     * ilk kosul zaten yanlis oldugu icin buraya gelindi.
     */
    return 0;
}

/* DENE: 49, 50, 69, 70, 84 ve 85 girerek sinirlari kontrol et.
 * DUSUN: Ilk kosul not >= 50 olsaydi 90 hangi dala girerdi?
 * EK DENE: else if yerine bagimsiz if yazsaydin 90 icin ne olurdu?
 * Son else'in yalnizca hemen onceki if'e baglanacagini da incele.
 */
