/* KONU: Bir kosula gore iki yoldan birini secmek.
 * Bu etkinligin ornek kurali: 50 ve uzeri gecer.
 */
#include <stdio.h>

int main(void) {
    double not;

    printf("Notunuzu girin (0-100):\n");
    scanf("%lf", &not);

    if (not >= 50.0) { /* Kosul dogruysa bu blok calisir. */
        printf("Gecti\n");
    } else { /* Kosul yanlissa bu blok calisir. */
        printf("Kaldi\n");
    }

    return 0;
}

/* DENE: 49, 50 ve 51 girerek sinir degerini kontrol et.
 * KARSILASTIRMALAR: >, <, >=, <=, == (esit mi?), != (farkli mi?).
 * DIKKAT: = deger atar; == iki degeri karsilastirir.
 */
