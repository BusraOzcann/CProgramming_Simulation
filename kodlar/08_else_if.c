/* KONU: Birden fazla durumdan birini secmek. */
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
     */

    return 0;
}

/* DENE: 8, -3 ve 0 girerek uc farkli yolu da calistir. */
