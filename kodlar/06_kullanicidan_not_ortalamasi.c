/* KONU: double okuma ve kullanicinin girdigi degerlerle hesaplama.
 * Ondalikli girislerde nokta kullan: 72.5 gibi.
 */
#include <stdio.h>

int main(void) {
    double birinciNot;
    double ikinciNot;
    double ortalama;

    printf("Birinci notu girin (0-100):\n");
    scanf("%lf", &birinciNot); /* double OKUMAK icin %lf. */

    printf("Ikinci notu girin (0-100):\n");
    scanf("%lf", &ikinciNot);

    ortalama = (birinciNot + ikinciNot) / 2.0;
    printf("Ortalama: %.2f\n", ortalama); /* double YAZDIRMAK icin %f. */

    return 0;
}

/* DENE: Ucuncu bir not ekle ve uc notun ortalamasini hesapla. */
