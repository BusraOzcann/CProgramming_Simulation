/* KONU: Dongunun sinirini kullanicidan almak.
 * Alistirmada n icin 1 ile 1000 arasinda bir tam sayi kullan.
 */
#include <stdio.h>

int main(void) {
    int n;

    printf("Kaca kadar yazdirilsin? (1-1000):\n");
    scanf("%d", &n);

    for (int i = 1; i <= n; i++) {
        printf("%d\n", i);
    }

    return 0;
}

/* DENE: n = 1 ve n = 5 icin kac satir yazilir?
 * DUSUN: n = 0 girilirse ilk kosul dogru olur mu?
 */
