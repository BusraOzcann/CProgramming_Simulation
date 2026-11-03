/* KONU: +, -, *, /, % ve islem onceligi. */
#include <stdio.h>

int main(void) {
    int a = 5;
    int b = 2;

    printf("Toplam: %d\n", a + b);
    printf("Fark: %d\n", a - b);
    printf("Carpim: %d\n", a * b);
    printf("Tam sayi bolmesi: %d\n", a / b); /* Sonuc 2 olur. */
    printf("Ondalikli bolme: %.2f\n", 5.0 / 2); /* Sonuc 2.50 olur. */
    printf("Kalan: %d\n", a % b); /* % tam sayi bolmesinin kalanini verir. */

    printf("2 + 3 * 4 = %d\n", 2 + 3 * 4);
    printf("(2 + 3) * 4 = %d\n", (2 + 3) * 4);

    return 0;
}

/* DENE: 9 / 2 ve 9 % 2 sonuclarini tahmin et, sonra kontrol et.
 * NOT: Bir sayiyi sifira bolmeyiz; b degerini 0 yapma.
 */
