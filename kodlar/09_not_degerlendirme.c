/* KONU: Veri alma + hesaplama + karar verme.
 * Ornek kural: Iki notun esit agirlikli ortalamasi 50 ve uzeriyse gecer.
 */
#include <stdio.h>

int main(void) {
    double birinciNot;
    double ikinciNot;
    double ortalama;

    printf("Birinci notu girin (0-100):\n");
    scanf("%lf", &birinciNot);
    printf("Ikinci notu girin (0-100):\n");
    scanf("%lf", &ikinciNot);

    ortalama = (birinciNot + ikinciNot) / 2.0;
    printf("Ortalama: %.2f\n", ortalama);

    if (ortalama >= 50.0) {
        printf("Gecti\n");
    } else {
        printf("Kaldi\n");
    }

    return 0;
}

/* DENE: 40 ve 60 gir. Sonra 40 ve 58 gir. Karar neden degisiyor? */
