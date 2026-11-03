/* KONU: scanf ile klavyeden bir tam sayi alma.
 * Bu temel ornekte kullanicinin gecerli bir tam sayi girdigi varsayilir.
 */
#include <stdio.h>

int main(void) {
    int yas; /* Bir sonraki adimda kullanicidan deger alinacak. */

    printf("Yasinizi girin:\n");
    scanf("%d", &yas);
    /* %d: int okunur. &yas: degerin yazilacagi degiskeni belirtir.
     * scanf ile okurken &, printf ile yazdirirken degiskenin kendisi kullanilir.
     */

    printf("Yasiniz: %d\n", yas);

    return 0;
}

/* DENE: Bir de kardes sayisini alip ekrana yazdir. */
