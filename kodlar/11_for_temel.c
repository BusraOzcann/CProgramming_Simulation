/* KONU: for dongusuyle 1'den 5'e kadar yazdirma.
 * for (baslangic; devam kosulu; her turdan sonraki islem)
 */
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("%d\n", i);
    }

    /* CALISMA SIRASI:
     * 1. i = 1 yalnizca bir kez yapilir.
     * 2. i <= 5 kontrol edilir. Yanlissa donguden cikilir.
     * 3. Dogruysa suslu parantezlerin ici (govde) calisir.
     * 4. i++ ile i bir artar. Sonra 2. adima donulur.
     * i++ burada i = i + 1 ile ayni isi yapar.
     */

    return 0;
}

/* DENE: Once i < 5 yap. Sonra i <= 10 yap. Ciktilari tahmin et.
 * DIKKAT: for (...) satirinin sonuna ; ekleme.
 * i bu ornekte yalnizca for icinde kullanilabilir.
 */
