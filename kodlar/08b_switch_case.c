/* KONU: Sabit secenekler arasindan switch / case ile secim yapmak.
 * if araliklari ve farkli kosullari kontrol edebilir.
 * switch burada bir tam sayinin belirli degerlere esitligini kontrol eder.
 */
#include <stdio.h>

int main(void) {
    int secim;

    printf("1 - C programlamaya giris\n");
    printf("2 - Kosullar\n");
    printf("3 - Donguler\n");
    printf("Bir konu secin (1-3):\n");
    scanf("%d", &secim);

    switch (secim) { /* secim'in degerine uyan case'e gidilir. */
        case 1:
            printf("Degiskenleri ve printf kullanimini ogreniyoruz.\n");
            break; /* switch'ten cikar; sonraki case'e devam etmez. */
        case 2:
            printf("if, else if ve else kullanimini ogreniyoruz.\n");
            break;
        case 3:
            printf("for ile tekrarlayan islemler yapiyoruz.\n");
            break;
        default: /* Hicbir case eslesmezse calisir. */
            printf("Gecersiz secim. 1, 2 veya 3 girin.\n");
            break;
    }

    return 0;
}

/* DENE: 1, 2, 3 ve 9 girerek butun yollari calistir.
 * DENE: Ilk break'i gecici olarak kaldir ve 1 gir. Sonra geri ekle.
 * break olmayinca sonraki case'in komutlari da calisir;
 * oraya gecmek icin secim'in yeniden 2'ye esit olmasi gerekmez.
 * NOT: case 1: gibi sabit deger yazilir; case secim > 1: yazilmaz.
 * switch, int ve char gibi tam sayi turleriyle kullanilir;
 * float, double veya metinle dogrudan kullanilmaz.
 * char orneginde case 'A': yazilabilir.
 */
