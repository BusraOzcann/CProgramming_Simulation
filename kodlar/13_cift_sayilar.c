/* KONU: for icinde if kullanma.
 * Bir tam sayinin 2'ye bolumunden kalan 0 ise sayi cifttir.
 */
#include <stdio.h>

int main(void) {
    int n;

    printf("Ust siniri girin (1-1000):\n");
    scanf("%d", &n);

    for (int i = 1; i <= n; i++) {
        if (i % 2 == 0) {
            printf("%d\n", i);
        }
    }
    /* Dongu her sayiyi ziyaret eder; if yalnizca ciftleri yazdirir. */

    return 0;
}

/* DENE: == 0 yerine != 0 yaz. Hangi sayilar yazdiriliyor? */
