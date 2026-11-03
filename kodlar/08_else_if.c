/* KONU: if / else if / else ile birden fazla durumdan birini secmek.
 * if: ilk kosulu kontrol eder.
 * else if: onceki kosul yanlissa yeni bir kosulu kontrol eder.
 * else: onceki kosullarin hicbiri dogru degilse calisir; kosul yazilmaz.
 */
#include <stdio.h>

int main(void) {
    int sayi;

    printf("Bir tam sayi girin:\n");
    scanf("%d", &sayi);

    if (sayi > 0) {
        printf("Pozitif\n");
    } else if (sayi < 0) {
        printf("Negatif\n");
    } else {
        printf("Sifir\n");
    }
    /* Kosullar yukaridan asagi kontrol edilir.
     * Bu zincirde yalnizca secilen bir blok calisir.
     * Ilk dogru kosul bulundugunda sonraki kosullar kontrol edilmez.
     * Birden fazla else if eklenebilir; else varsa en sona yazilir.
     * Ayri ayri if yazmak ile else if zinciri kurmak ayni sey degildir:
     * bagimsiz if ifadelerinde her kosul ayri degerlendirilir.
     */

    return 0;
}

/* DENE: 8, -3 ve 0 girerek uc farkli yolu da calistir. */
