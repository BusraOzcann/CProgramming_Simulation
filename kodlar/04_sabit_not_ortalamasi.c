/* KONU: Degiskenlerle hesaplama.
 * Hedef: Iki notu toplayip ikiye bolmek.
 */
#include <stdio.h>

int main(void) {
    double birinciNot = 70.0;
    double ikinciNot = 85.0;
    double ortalama = (birinciNot + ikinciNot) / 2.0;

    /* Parantez, toplamanin bolmeden once yapilmasini saglar. */
    printf("Ortalama: %.2f\n", ortalama);

    return 0;
}

/* DENE: Iki notu degistir. Sonucu once kagit uzerinde hesapla. */
