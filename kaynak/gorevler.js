/* Oyunun tüm içeriği burada. Yeni görev eklemek ya da metin değiştirmek için bu dosyayı düzenle,
   sonra kaynak/derle.sh çalıştır. */
const R = String.raw;

const SECTORS = [
  /* ==================== PWR ==================== */
  {
    id: "pwr", code: "PWR", name: "Güç Devresi", topic: "Bit, bayt, adres",
    missions: [
      {
        id: "bits", type: "bits", title: "Anahtarları Çevir",
        say: "Bak stajyer. Bellek dediğin şey sihir değil. Milyarlarca minik anahtar. Açık ya da kapalı. Hepsi bu.",
        card: `<p>Bir anahtar <b>bit</b> demek: <code>0</code> ya da <code>1</code>. Yan yana 8 bit <b>1 bayt</b> yapar.</p>
<p>Her anahtarın bir ağırlığı var: 128, 64, 32, 16, 8, 4, 2, 1. Açık olanların toplamı o baytın değeridir.</p>`,
        targets: [
          { v: 5, say: "5 yaz bakalım. 4 ile 1 senin dostun." },
          { v: 12, say: "Şimdi 12." },
          { v: 42, say: "42. Evrenin cevabı, senin de ilk sınavın." },
          { v: 65, say: "65 yaz. Sonra karakter kısmına bak.", reveal: true },
        ],
        win: "01000001. Sayı gibi okursan 65, harf gibi okursan 'A'. Bitler aynı. Onlara ne anlam vereceğini TİP söyler. Bunu unutma, sınavda karşına çıkar.",
      },
      {
        id: "addr", type: "addr", title: "Adrese Teslim",
        say: "Her baytın bir adresi var, apartman daireleri gibi. Şimdi kuryelik yapacaksın.",
        card: `<p>Bellek uzun bir sokak. Her dairede 1 bayt oturuyor, her dairenin kapı numarası var. Bu numaraya <b>adres</b> denir.</p>
<p><code>0x</code> sadece "bu sayı 16'lık tabanda" demek. Şimdilik posta kodu gibi düşün.</p>
<p><b>Adres</b> kutunun yeri, <b>değer</b> kutunun içindeki şey. Bu ikisini karıştırmak C'nin en pahalı hatası.</p>`,
        tasks: [
          { op: "put", addr: 0x1003, val: 7, text: "<code>0x1003</code> adresine <code>7</code> bırak." },
          { op: "put", addr: 0x1006, val: 42, text: "<code>0x1006</code> adresine <code>42</code> bırak." },
          { op: "read", addr: 0x1003, text: "<code>0x1003</code> adresinde ne var? Önce o kutuya tıkla, sonra içindekini yaz." },
          { op: "copy", from: 0x1006, to: 0x1000, text: "<code>0x1006</code> içindekini <code>0x1000</code> adresine kopyala. Önce kaynağa, sonra hedefe tıkla." },
          { op: "read", addr: 0x1006, text: "Kopyaladıktan sonra <code>0x1006</code> adresinde ne kaldı? Tıkla ve yaz." },
        ],
        after: [
          {
            q: "Bunca adresi ezberlemek sence mantıklı mı? C bu derdi nasıl çözüyor?",
            opts: ["Adrese bir isim takıyoruz. Buna değişken diyoruz.", "Adresleri bir deftere yazıyoruz.", "Bellek zaten tek hücre olduğu için adrese gerek yok."], a: 0,
            why: "Değişken dediğin şey, bir adrese taktığın isimden ibaret. Sıradaki devrede göreceksin.",
          },
        ],
        win: "Kopyalamak kaynağı silmez. Bir köşeye yaz, RAM devresinde hayat kurtaracak.",
      },
    ],
  },

  /* ==================== RAM ==================== */
  {
    id: "ram", code: "RAM", name: "Bellek Yuvası", topic: "Değişken nedir, nasıl çalışır",
    missions: [
      {
        id: "first", type: "exec", title: "İlk Değişkenin",
        say: "Artık işlemcisin. Kodu sen okuyacaksın, RAM'e sen yazacaksın. Satır satır. Ben de başında durup söyleneceğim.",
        card: `<p>Bir değişkenin dört özelliği var:</p>
<div class="anat"><span><b>tip</b> kaç bayt, nasıl okunur</span><span><b>isim</b> senin taktığın etiket</span><span><b>değer</b> kutunun içi</span><span><b>adres</b> kutunun yeri</span></div>
<pre class="mini">int yas = 19;</pre>
<p>Bu satırı gören işlemci üç şey yapar: 4 bayt ayırır, oraya <code>yas</code> etiketini yapıştırır, içine <code>19</code> yazar.</p>`,
        code: R`int yas = 19;
int kat = 3;`,
        after: [
          {
            q: "Kodda <code>yas</code> yazdığında bilgisayar aslında neye bakıyor?",
            opts: ["0x1000 adresindeki 4 bayta", "Kodun yazıldığı satıra", "'yas' kelimesinin harflerine"], a: 0,
            why: "Derlendikten sonra 'yas' ismi kaybolur, geriye sadece adres kalır. İsim senin için, adres makine için.",
          },
        ],
        win: "İki kutu, iki etiket. Çok da korkunç değilmiş, değil mi?",
      },
      {
        id: "overwrite", type: "exec", title: "Üstüne Yazma",
        say: "Klasik yanlış inanış: 'Değişken eski değerlerini hatırlar.' Hatırlamaz. Göreceksin.",
        card: `<p>Tipi başa yazınca <b>yeni kutu</b> açılır. Tip yazmadan <code>skor = 9;</code> dersen <b>var olan kutunun içi</b> değişir.</p>
<p>Kutu aynı anda tek değer tutar.</p>`,
        code: R`int skor = 5;
skor = 9;
skor = 2;`,
        after: [
          {
            q: "Program bitti. İlk yazılan <code>5</code> şu an nerede?",
            opts: ["Hiçbir yerde. Üstüne yazıldı, kayboldu.", "skor'un yanındaki baytlarda duruyor.", "Geri alınabilir bir geçmişte saklanıyor."], a: 0,
            why: "RAM'de geçmiş yok, geri al tuşu yok. Eski değer lazımsa yazmadan önce başka bir kutuya kopyalaman gerekir.",
          },
        ],
        win: "Unutma: RAM'in Ctrl+Z'si yok.",
      },
      {
        id: "copy", type: "exec", title: "Kopya mı, Bağ mı?",
        say: "Bu görev sınıfın yarısını yakıyor. <code>b = a</code> ne demek sence? Dikkatli oku, sonunda soracağım.",
        card: `<p>Atama <b>bir kerelik fotokopidir</b>. O anda sağdaki değer okunur, soldaki kutuya yazılır. İş biter.</p>
<p>Excel formülü gibi canlı bir bağ kurulmaz.</p>`,
        code: R`int a = 3;
int b = a;
a = 10;`,
        after: [
          {
            q: "Program bitti. <code>b</code> kaç? Neden?",
            opts: ["3, çünkü b = a satırında a'nın o anki değeri kopyalandı.", "10, çünkü b artık a'ya bağlı.", "13, çünkü iki değer toplandı."], a: 0,
            why: "b, a'nın değerini aldı, a'nın kendisini değil. Sonra a değişse de b'nin kutusuna kimse dokunmuyor.",
          },
        ],
        win: "Yarısı yandı dedim, sen yanmadın. Şimdilik.",
      },
      {
        id: "assign", type: "exec", title: "Eşittir Eşitlik Değildir",
        say: "Matematik hocan <code>x = x + 1</code> görse bayılır. Ben görsem sadece bir saat döngüsü harcarım.",
        card: `<p>C'de <code>=</code> "eşittir" demek değil, <b>"sağdakini hesapla, soldaki kutuya yaz"</b> demek.</p>
<pre class="mini">x = x + 1;</pre>
<p>Okuma sırası: <b>1.</b> x'in şu anki değerini oku <b>2.</b> 1 ekle <b>3.</b> sonucu x'e yaz. Önce sağ, sonra sol.</p>`,
        code: R`int x = 5;
x = x + 1;
x = x * 2;
x = x - x;`,
        win: "Son satır komikti, kabul et. Kendini sıfırlayan değişken.",
      },
      {
        id: "garbage", type: "exec", title: "Çöp Değer",
        say: "Sana bir sır: RAM kiralık daire gibidir. Önceki kiracı neyi bıraktıysa içinde o durur.",
        card: `<p><code>int t;</code> yazarsan 4 bayt ayrılır ama <b>temizlenmez</b>. İçinde önceki programlardan kalan rastgele bitler vardır. Buna <b>çöp değer</b> denir.</p>
<p>Değeri belli olmayan yerlere <b>???</b> düğmesiyle cevap ver.</p>`,
        code: R`int t;
t = t + 5;
int u = 2;
u = u + 5;`,
        trapText: { "t:5": "Neden 5? t'nin içinde 0 olduğunu kim söyledi? Kimse t'ye değer yazmadı." },
        after: [
          {
            q: "<code>t</code> değişkeninin sonucu neden belirsiz, <code>u</code> neden 7?",
            opts: ["t'ye ilk değer verilmedi, içindeki çöpün üstüne 5 eklendi.", "C'de değişken adı tek harf olunca rastgele davranır.", "t = t + 5 satırı C'de yasak olduğu için."], a: 0,
            why: "Değişkeni açtığında içi 0 olmaz. Toplam tutacaksan mutlaka int toplam = 0; yaz. Döngülerde bu hatayı çok göreceksin.",
          },
        ],
        win: "Laboratuvarda aynı kodu iki kez çalıştır. Çöp her seferinde başka çıkar. Ürkütücü, değil mi?",
      },
      {
        id: "mental1", type: "predict", title: "Zihinsel Derleme",
        say: "Bu sefer ben çalıştırmıyorum. Kafanda çalıştır, sonucu söyle. Kağıt kalem serbest, kopya serbest değil.",
        card: `<p>Bir kutu <b>her satırda</b> değişebilir. Yukarıdan aşağı in, her satırdan sonra kutuların durumunu kağıda yaz. Buna <b>iz sürme</b> denir ve programcılığın gerçek kas gücüdür.</p>`,
        code: R`int a = 2;
int b = a + 3;
a = b * 2;
b = a - b;`,
        ask: ["a", "b"],
        win: "Her satırda sadece bir kutu değişiyor. Bunu gören yarışı kazanır.",
      },
      {
        id: "swapfail", type: "exec", title: "Takas Felaketi",
        say: "Patron dedi ki: 'a ile b'yi değiştir.' Stajyerin biri de aşağıdaki kodu yazmış. Çalıştır da görelim.",
        card: `<p>Hedef: <code>a</code> 8, <code>b</code> 3 olsun. Bakalım bu kod başarabilecek mi?</p>`,
        code: R`int a = 3;
int b = 8;
a = b;
b = a;`,
        after: [
          {
            q: "<code>3</code> değeri ne zaman kayboldu?",
            opts: ["a = b satırında, a'nın üstüne yazıldığı anda.", "b = a satırında.", "Hiç kaybolmadı, b'nin içinde duruyor."], a: 0,
            why: "a'nın içindeki 3'ün üstüne 8 yazıldı. b = a dediğinde artık a'da 8 var, 3 ise yok oldu. İki bardaktaki suyu değiştirmek için üçüncü bardak gerekir.",
          },
        ],
        win: "İki bardak, üçüncü bardak olmadan yer değiştirmez. Sıradaki görevde bardağı sen getir.",
      },
      {
        id: "swapfix", type: "parsons", title: "Üçüncü Bardak",
        say: "Satırları sırala, takası kurtar. İçinde tuzak satırlar da var, hepsini kullanmak zorunda değilsin.",
        card: `<p>Bir satıra dokununca programa eklenir, programdaki satıra dokununca geri döner. Sıra önemli.</p>`,
        given: ["int a = 3;", "int b = 8;"],
        lines: ["int temp = a;", "a = b;", "b = temp;", "b = a;", "temp = b;"],
        goal: "Sonuçta <code>a</code> 8, <code>b</code> 3 olmalı.",
        expectVars: { a: 8, b: 3 },
        win: "İşte bu. Eski değeri kaybetmeden önce yedeğini al. Bütün programcılık bu cümle aslında.",
      },
      {
        id: "gccgame", type: "arcade", title: "GCC Sensin",
        say: "Bir günlüğüne koltuğu sana bırakıyorum. Derleyici sensin. Bu satır derlenir mi, derlenmez mi? Süre var, hızlı ol.",
        card: `<p>Değişken adı kuralları: harf veya <code>_</code> ile başlar, içinde harf, rakam, <code>_</code> olur. Boşluk olmaz. C'nin kendi kelimeleri (<code>int</code>, <code>for</code>...) kullanılamaz. Büyük-küçük harf farklıdır.</p>`,
        seconds: 12,
        items: [
          { q: "int yas;", code: true, a: 0, why: "Tertemiz bir tanım." },
          { q: "int 2yas;", code: true, a: 1, why: "Ad rakamla başlayamaz." },
          { q: "int ogrenci_sayisi = 40;", code: true, a: 0, why: "Alt çizgi serbest." },
          { q: "float ortalama not;", code: true, a: 1, why: "Adda boşluk olmaz." },
          { q: "int for = 3;", code: true, a: 1, why: "for C'nin kendi kelimesi." },
          { q: "char c = 'A';", code: true, a: 0, why: "Tek karakter, tek tırnak. Doğru." },
          { q: "int _x;", code: true, a: 0, why: "Alt çizgiyle başlayabilir." },
          { q: "int x = 5", code: true, a: 1, why: "Noktalı virgül nerede stajyer?" },
          { q: "int toplam-para;", code: true, a: 1, why: "Tire adda kullanılamaz, çıkarma sanılır." },
          { q: "int Yas, yas;", code: true, a: 0, why: "Büyük-küçük harf farklı olduğu için iki ayrı kutu." },
          { q: "float f = 2,5;", code: true, a: 1, why: "Ondalıkta nokta kullanılır: 2.5" },
          { q: "double pi = 3.14;", code: true, a: 0, why: "Gayet düzgün." },
          { q: "x = 3;", code: true, a: 1, why: "Önceden tanımlanmadı. Hangi kutuya yazacağım?" },
          { q: "5 = x;", code: true, a: 1, why: "Değer sağdan sola akar. 5 bir kutu değil." },
        ],
        options: ["DERLENİR", "HATA"],
        check: "compile",
        win: "Fena değil. Benim işim ne kadar zormuş gördün mü? Bir de dakikada bin satır düşün.",
      },
      {
        id: "rambos", type: "write", title: "Üçlü Takas", boss: true,
        say: "Devre sonu sınavı. Bu sefer kodu sen yazıyorsun. Hile yapma, sayı yazarsan anlarım.",
        card: `<p>İlk üç satır hazır. Altına kendi kodunu yaz.</p>`,
        goal: "Değerleri döndür: <code>a</code> b'nin eski değerini, <code>b</code> c'nin eski değerini, <code>c</code> a'nın eski değerini alsın. Sonuç <code>a=2, b=9, c=7</code> olmalı. Kendi kodunda sayı yazma, sadece değişken kullan.",
        code: R`int a = 7;
int b = 2;
int c = 9;

// kodunu buraya yaz
`,
        tests: [{ expectVars: { a: 2, b: 9, c: 7 } }],
        check: (src) => {
          const rest = src.split("\n").slice(3).join("\n").replace(/\/\/.*$/gm, "");
          return /\d/.test(rest) ? "Kendi kodunda sayı yazmışsın. a = 2 demek takas değil, kopya. Sadece değişken kullan." : null;
        },
        hints: ["Bir değerin yedeğini almadan üstüne yazarsan kaybolur.", "int temp = a; ile başla. Sonra a'ya b'yi, b'ye c'yi koy.", "int temp = a;  a = b;  b = c;  c = temp;"],
        win: "RAM devresi yandı, ama iyi anlamda. Artık değişkenin ne olduğunu biliyorsun. Çoğu insan bilmiyor.",
      },
    ],
  },

  /* ==================== TYPE ==================== */
  {
    id: "type", code: "TYPE", name: "Tip Çözücü", topic: "int, float, double, char ve baytlar",
    missions: [
      {
        id: "typepick", type: "arcade", title: "Doğru Kutu",
        say: "Her veriye uygun kutu seçilir. Telefon numarasını float'a koyanı geçen yıl fırına verdik.",
        card: `<div class="typetab">
<div><code>char</code><span>1 bayt</span><em>tek karakter: 'A'</em></div>
<div><code>int</code><span>4 bayt</span><em>tam sayı: 42</em></div>
<div><code>float</code><span>4 bayt</span><em>ondalıklı: 3.75</em></div>
<div><code>double</code><span>8 bayt</span><em>hassas ondalıklı: 3.14159265</em></div>
</div>`,
        seconds: 10,
        options: ["int", "float", "double", "char"],
        items: [
          { q: "Sınıftaki öğrenci sayısı: 42", a: [0], why: "Yarım öğrenci olmaz. int." },
          { q: "Harf notu: B", a: [3], why: "Tek karakter. char." },
          { q: "Vize ortalaması: 3.75", a: [1, 2], why: "Ondalıklı. float ya da double." },
          { q: "Pi: 3.14159265358979", a: [2], why: "Bu kadar basamak float'a sığmaz. double." },
          { q: "Kat numarası: 3", a: [0], why: "Tam sayı. int." },
          { q: "Evet/Hayır cevabı: 'E'", a: [3], why: "Tek harf. char." },
          { q: "Vücut sıcaklığı: 36.6", a: [1, 2], why: "Ondalıklı. float ya da double." },
          { q: "Yıl: 2026", a: [0], why: "Tam sayı. int." },
        ],
        win: "Kutuyu veriye göre seç. Küçük kutuya büyük veri sığmaz, büyük kutu da RAM'i boşa harcar.",
      },
      {
        id: "tetris", type: "place", title: "Bellek Yerleştirme",
        say: "RAM'de yer dar. Şu değişkenleri dizmen lazım. Boşluk bırakırsan ben bilirim, sıkıştıramazsın.",
        card: `<p>Her tip kendi boyu kadar bayt kaplar. Üstelik her yere oturamaz:</p>
<p><code>double</code> 8'in katı adreslere, <code>int</code> ve <code>float</code> 4'ün katı adreslere, <code>char</code> her yere. Buna <b>hizalama</b> denir.</p>
<p>Sıralamak için önce listeden değişkeni seç, sonra RAM'de başlayacağı bayta dokun. Yanlış koyduysan koyduğun kutuya dokunup geri al.</p>
<p>Küçük not: <code>0x1009</code>'dan sonra <code>0x100a</code> gelir. 16'lık tabanda 9'dan sonra a, b, c, d, e, f sayılır.</p>`,
        rounds: [
          { rows: 2, items: [["double", "d"], ["int", "a"], ["int", "b"]], showSize: true, ask: "a" },
          { rows: 2, items: [["double", "d"], ["float", "f"], ["char", "x"], ["char", "y"], ["char", "z"], ["char", "w"]], showSize: true, ask: "f" },
          { rows: 2, items: [["int", "a"], ["char", "c"], ["double", "d"], ["char", "k"], ["char", "m"], ["char", "n"]], showSize: false, ask: "d" },
        ],
        win: "Adres, boyut, hizalama. Çoğu programcı bunu üçüncü sınıfta öğrenir. Sen birinci sınıftasın.",
      },
      {
        id: "sizes", type: "exec", title: "Kaç Bayt?", askSize: true,
        say: "Şimdi yer açmadan önce kaç bayt lazım olduğunu da sen söyleyeceksin. RAM'in tapusu sende.",
        card: `<p>Boyutları hatırlıyor musun? <code>char</code> 1, <code>int</code> 4, <code>float</code> 4, <code>double</code> 8.</p>
<p>Derleyici hizalama yüzünden araya boşluk bırakabilir. <code>char</code>'dan sonraki boş baytlar bu yüzden.</p>`,
        code: R`char harf = 'K';
int sayi = 1000;
float oran = 0.5;
double pi = 3.14;`,
        after: [
          {
            q: "<code>harf</code> 1 bayt, ama <code>sayi</code> neden <code>0x1001</code>'de değil de <code>0x1004</code>'te başladı?",
            opts: ["int'ler 4'ün katı adreslere yerleşir, aradaki baytlar boş kalır.", "char aslında 4 bayttır.", "Bellek sadece 4'er 4'er kullanılabilir."], a: 0,
            why: "Hizalama işlemcinin okumasını hızlandırır. Bu yüzden değişkenler her zaman ardı ardına dizilmez.",
          },
        ],
        win: "sizeof(int) yazınca sayın 4 çıkarsa bil ki işin içinde bu tablo var.",
      },
      {
        id: "divtrap", type: "exec", title: "Bölme Tuzağı",
        say: "Şimdi seni kandıracağım. Hazır mısın? <code>7 / 2</code> kaç? Hayır, cevabın yanlış.",
        card: `<p>C önce <b>sağ tarafı</b> hesaplar, sonucu kutuya sonra koyar.</p>
<p>İki tam sayıyı bölersen sonuç da <b>tam sayıdır</b>, ondalık atılır. Kutu float olsa bile. Taraflardan biri ondalıklıysa sonuç ondalıklı olur.</p>
<p><code>%</code> bölümden kalanı verir.</p>`,
        code: R`int a = 7 / 2;
int k = 7 % 2;
float f = 7 / 2;
float g = 7.0 / 2;`,
        trapText: { "a:3.5": "a bir int. Üstelik 7 / 2 zaten tam sayı bölmesi.", "f:3.5": "Tuzak burada. Önce sağ taraf: 7 / 2, iki int. Sonuç 3. Sonra 3 float kutuya konur: 3.0" },
        after: [
          {
            q: "<code>f</code> float olmasına rağmen neden 3.5 değil?",
            opts: ["Sağ taraf iki int'in bölümü, 3 olarak hesaplanıp sonra float'a kondu.", "float zaten ondalık tutamaz.", "7 sayısı float'a sığmaz."], a: 0,
            why: "Kutu, hesabın nasıl yapılacağını belirlemez. Hesap bittikten sonra sonucu teslim alır.",
          },
        ],
        win: "Bu tuzağa düşmeyen yok. Ortalama hesabı yazarken yine düşeceksin, ben de güleceğim.",
      },
      {
        id: "castit", type: "exec", title: "Kırpma ve Cast",
        say: "int kutusu ondalığı kesip atar. Yuvarlama falan yok, acımasız. Bir de bunun çaresini göstereceğim.",
        card: `<p>int kutusuna <code>3.9</code> koyarsan <code>3</code> olur. Yuvarlanmaz, <b>kırpılır</b>.</p>
<p>İki int'i ondalıklı bölmek istersen birini geçici olarak dönüştür: <code>(float)p / q</code>. Buna <b>cast</b> denir. <code>p</code>'nin kendisi değişmez.</p>`,
        code: R`int x = 3.9;
int p = 7;
int q = 2;
float o = p / q;
float r = (float)p / q;`,
        trapText: { "x:4": "Yuvarlama yok dedim. int kutusu ondalığı keser: 3", "o:3.5": "Ne kadar çabuk unuttun! p ve q ikisi de int." },
        win: "(float) yazmayı unutup sınavda 5 puan kaybedenler kulübüne hoş geldin. Üye olma.",
      },
      {
        id: "charnum", type: "exec", title: "char Aslında Sayıdır",
        say: "Sana PWR devresinde söylemiştim. 'A' aslında 65. Şimdi bunu kullanacağız.",
        card: `<p>Bilgisayar harf bilmez. Her karakterin bir numarası var: <b>ASCII tablosu</b>.</p>
<div class="ascii"><span>'A' = 65</span><span>'B' = 66</span><span>'C' = 67</span><span>'a' = 97</span><span>'b' = 98</span><span>'0' = 48</span></div>
<p>Küçük harf, büyük harften 32 fazladır. char'la aritmetik yapılabilir, çünkü içinde sayı var.</p>
<p>char kutusuna <code>C</code> ya da <code>67</code> yazabilirsin. int kutusuna sayı yazmalısın.</p>`,
        code: R`char c = 'A';
int n = c;
c = c + 2;
char d = 'a' - 32;`,
        after: [
          {
            q: "<code>'7'</code> ile <code>7</code> aynı şey mi?",
            opts: ["Hayır. '7' karakterinin kodu 55, 7 ise gerçekten yedi.", "Evet, ikisi de yedi.", "Evet, ama '7' daha çok yer kaplar."], a: 0,
            why: "'0' karakteri 48'dir, '7' de 55. Ekranda aynı görünürler ama bellekte bambaşka sayılardır.",
          },
        ],
        win: "Şifreleme sanıyorsun, oysa toplama yapıyorsun. Sezar şifresi tam olarak budur.",
      },
      {
        id: "mental2", type: "predict", title: "Tip Karışımı",
        say: "Tipler birbirine girdi. Yine kafanda çalıştır, yine ben izleyeceğim.",
        card: `<p>Kural aynı: önce sağ taraf, kendi tipleriyle hesaplanır. Sonra sol taraftaki kutunun tipine dönüştürülür.</p>
<p>Ondalıklı cevapları <code>2.5</code> gibi yaz.</p>`,
        code: R`int a = 5;
int b = 2;
float c = a / b;
float d = a / 2.0;
int e = a % b + b;`,
        ask: ["c", "d", "e"],
        win: "Tipi gören hesabı görür. Bir sonraki devrede bunları ekrana basmayı öğreneceksin.",
      },
      {
        id: "typeboss", type: "write", title: "Ortalama Makinesi", boss: true,
        say: "Sınav zamanı. Üç notun ortalamasını doğru hesapla. Evet, tuzağı biliyorum. Sen de biliyorsun. Düşme.",
        card: `<p>Üç not hazır. <code>ort</code> adında bir <code>float</code> tanımla, üç notun ortalamasını içine koy.</p>`,
        goal: "<code>float ort</code> değişkeni <code>81.666664</code> olmalı. <code>ort</code> satırında <code>n1</code>, <code>n2</code>, <code>n3</code> değişkenlerini kullan.",
        code: R`int n1 = 70;
int n2 = 85;
int n3 = 90;

// ort burada tanımlanacak
`,
        tests: [{ expectVars: { ort: 81.666664 }, approx: 0.001 }],
        check: (src) => (/ort\s*=.*n1/.test(src) ? null : "ort'u n1, n2, n3 kullanarak hesapla. Elle 81.6 yazmak kopya sayılır."),
        hints: ["(n1 + n2 + n3) / 3 yazarsan sağ taraf tamamen int. Sonuç 81 çıkar.", "Bölenlerden biri ondalıklı olursa bölme de ondalıklı olur: 3.0 gibi.", "float ort = (n1 + n2 + n3) / 3.0;"],
        win: "Tip Çözücü onarıldı. Artık kutunun boyunu ve anlamını biliyorsun.",
      },
    ],
  },

  /* ==================== IO ==================== */
  {
    id: "io", code: "I/O", name: "Giriş Çıkış", topic: "printf, scanf ve & işareti",
    missions: [
      {
        id: "printfsecret", type: "exec", title: "printf'in Sırrı",
        say: "Ekrana yazmak kolay sanılır. Tırnak içi ile tırnak dışını karıştıran çok gördüm.",
        card: `<p>Tırnak içindeki her şey <b>aynen</b> ekrana çıkar. <code>%d</code> ise bir delik gibidir: virgülden sonraki değişkenin <b>değeri</b> o deliğe girer.</p>
<pre class="mini">printf("x = %d\\n", x);</pre>
<p><code>\\n</code> alt satıra geçer. Cevap yazarken onu yazmana gerek yok.</p>`,
        code: R`int x = 7;
printf("x\n");
printf("%d\n", x);
printf("x = %d\n", x);`,
        trapText: {},
        win: "printf(\"x\") ekrana x harfini yazar. Değeri görmek istiyorsan %d şart.",
      },
      {
        id: "formatfill", type: "fill", title: "Format Yuvası",
        say: "Her kutu kendi deliğinden çıkar. Yanlış delik, yanlış çıktı. Sağdaki ekrana bakarak ayarla.",
        card: `<div class="typetab">
<div><code>%d</code><span>int</span><em>tam sayı</em></div>
<div><code>%f</code><span>float, double</span><em>6 basamak ondalık</em></div>
<div><code>%.2f</code><span>float, double</span><em>2 basamak ondalık</em></div>
<div><code>%c</code><span>char</span><em>tek karakter</em></div>
</div>`,
        rounds: [
          {
            template: R`int yas = 20;
printf("{{0}}\n", yas);`,
            slots: [["%d", "%f", "%c"]], start: [1],
            target: "20", say: "int için hangi delik?",
          },
          {
            template: R`float ort = 3.5;
printf("{{0}}\n", ort);`,
            slots: [["%d", "%f", "%.2f", "%c"]], start: [0],
            target: "3.50", say: "Şimdi ondalıklı ve tam 2 basamak.",
          },
          {
            template: R`char harf = 'B';
printf("{{0}}\n", harf);`,
            slots: [["%d", "%f", "%c"]], start: [0],
            target: "B", say: "%d seçiliyken 66 çıkıyor, gördün mü? char aslında sayı.",
          },
          {
            template: R`char harf = 'B';
int yas = 20;
float ort = 3.5;
printf("{{0}} {{1}} {{2}}\n", harf, yas, ort);`,
            slots: [["%d", "%f", "%c"], ["%d", "%f", "%c"], ["%d", "%f", "%.1f", "%c"]], start: [0, 1, 0],
            target: "B 20 3.5", say: "Sıra da önemli: birinci delik birinci değişkeni alır.",
          },
        ],
        win: "Format uyuşmazsa C seni uyarmaz bile, çoğu zaman saçma bir sayı basıp geçer. Dikkat sende.",
      },
      {
        id: "scanamp", type: "exec", title: "scanf ve & İşareti",
        say: "İşte herkesin ezberlediği ama anlamadığı şey: <code>&</code>. Bugün anlıyorsun.",
        card: `<p><code>x</code> dersen kutunun <b>içindeki değer</b>, <code>&x</code> dersen kutunun <b>adresi</b>.</p>
<p>scanf bir kurye gibidir. Klavyeden gelen sayıyı alır ve bir adrese teslim eder. Ona <code>&n</code> vererek "şu adrese bırak" dersin.</p>
<pre class="mini">scanf("%d", &n);</pre>
<p>Bu görevde klavyeden <code>21</code> gelecek.</p>`,
        code: R`int n;
scanf("%d", &n);
printf("%d\n", n);
n = n * 2;
printf("%d\n", n);`,
        stdin: "21",
        after: [
          {
            q: "<code>scanf(\"%d\", n);</code> yazarsak, yani & unutursak ne olur?",
            opts: ["n'nin içindeki sayı adres sanılır, program başka yere yazmaya çalışır ve büyük ihtimalle çöker.", "Derleyici & işaretini kendisi ekler.", "Hiçbir şey olmaz, sadece biraz yavaşlar."], a: 0,
            why: "scanf'e değer verirsen kuryeye yanlış adres vermiş olursun. Sıradaki görevde bunu canlı göreceksin.",
          },
        ],
        win: "printf değere, scanf adrese ihtiyaç duyar. Neden? printf sadece okur, scanf kutuyu değiştirmek zorunda.",
      },
      {
        id: "ampbug", type: "bugfix", title: "Kayıp Kurye",
        say: "Bir stajyer kodu yazmış, makine çöküyor. Hangi satır bozuk? Önce satırı bul, sonra düzelt.",
        card: `<p>Arıza görevlerinde kodun <b>beklenen</b> ve <b>gerçek</b> çıktısı yan yana. Önce bozuk satıra dokun, sonra doğru düzeltmeyi seç.</p>`,
        code: R`int n = 0;
scanf("%d", n);
printf("%d\n", n);`,
        stdin: "21", expect: "21",
        bugLine: 2,
        options: [
          { text: R`scanf("%d", &n);`, ok: true, why: "Kurye sonunda doğru adrese gitti." },
          { text: R`scanf(&n);`, why: "Formatı kaldırırsan scanf ne okuyacağını bilemez." },
          { text: R`scanf("%d", *n);`, why: "O işaret başka bir konu, sonra göreceksin. Burada adres lazım." },
          { text: R`scanf("&d", n);`, why: "& formatın içine değil, değişkenin önüne gelir." },
        ],
        win: "Segmentation fault bu demek: 'Sana ait olmayan bir adrese dokundun.' Duyduğunda & aklına gelsin.",
      },
      {
        id: "fmtbug", type: "bugfix", title: "Anlamsız Sayı",
        say: "Ortalaması 3.5 olan öğrenci ekranda bambaşka bir sayı görmüş. Dekanlık beni aradı. Çöz şunu.",
        card: `<p>Derleyici çoğu zaman sadece uyarı verir, durdurmaz. Program çalışır ama yanlış şey basar.</p>`,
        code: R`float ort = 3.5;
printf("Ort: %d\n", ort);`,
        expect: "Ort: 3.500000",
        bugLine: 2,
        options: [
          { text: R`printf("Ort: %f\n", ort);`, ok: true, why: "float için %f." },
          { text: R`printf("Ort: %c\n", ort);`, why: "%c tek karakter içindir." },
          { text: R`printf("Ort: ort\n");`, why: "Tırnak içindeki ort sadece yazı olarak çıkar." },
          { text: R`printf("Ort: %d\n", &ort);`, why: "& adres verir, değer değil." },
        ],
        win: "%d bitleri tam sayı gibi okur. float'ın bitleri tam sayı gibi okununca saçmalık çıkar. Tip, bitlerin okunma şeklidir.",
      },
      {
        id: "ioboss", type: "write", title: "Hesap Makinesi", boss: true,
        say: "Klavyeden iki sayı oku, toplamını yaz. Farklı sayılarla deneyeceğim, sonucu elle yazma.",
        card: `<p>Şablon boş değil, ama işin çoğu sende. Değişkenleri tanımla, scanf ile oku, printf ile yaz.</p>`,
        goal: `İki tam sayı oku. Çıktı tam olarak <code>Toplam: 7</code> biçiminde olmalı.`,
        code: R`int a, b;

// scanf ile a ve b'yi oku

// printf ile "Toplam: ..." yazdır
`,
        tests: [
          { stdin: "3 4", expect: "Toplam: 7" },
          { stdin: "10 -2", expect: "Toplam: 8" },
          { stdin: "0 0", expect: "Toplam: 0" },
        ],
        hints: [`scanf("%d %d", &a, &b); iki sayıyı birden okur.`, `printf'te metin ve %d yan yana olabilir: "Toplam: %d\\n"`, `printf("Toplam: %d\\n", a + b);`],
        win: "Makine artık konuşuyor ve dinliyor. Sırada karar vermek var.",
      },
    ],
  },

  /* ==================== ALU ==================== */
  {
    id: "alu", code: "ALU", name: "Karar Birimi", topic: "if, else ve karşılaştırma",
    missions: [
      {
        id: "ifpath", type: "exec", title: "Yol Ayrımı",
        say: "Koşul dediğin bir sayıdır. 0 ise yanlış, başka her şey doğru. İşlemci için 'belki' yok.",
        card: `<p><code>if</code> koşulu sorar. Doğruysa ilk blok çalışır, yanlışsa <code>else</code> bloğu. <b>İkisi birden asla.</b></p>
<p>Karşılaştırmalar: <code>==</code> eşit mi, <code>!=</code> farklı mı, <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></p>`,
        code: R`int puan = 65;
if (puan >= 50) {
    printf("Gecti\n");
} else {
    printf("Kaldi\n");
}
puan = puan + 5;`,
        win: "Program çalışan satırların toplamıdır. Atlanan satırlar RAM'e hiç dokunmaz.",
      },
      {
        id: "eqbug", type: "bugfix", title: "Tek Eşittir Laneti",
        say: "Kapı kapalı olmasına rağmen ekranda 'Acik' yazıyor. Üstelik kapı değişkeni de değişmiş. Bu nasıl iş?",
        card: `<p><code>=</code> atama, <code>==</code> karşılaştırma. Birini diğerinin yerine yazarsan derlenir ama olay çıkar.</p>`,
        code: R`int kapi = 0;
if (kapi = 1) {
    printf("Acik\n");
} else {
    printf("Kapali\n");
}`,
        expect: "Kapali",
        bugLine: 2,
        options: [
          { text: R`if (kapi == 1) {`, ok: true, why: "Artık soruyorsun, yazmıyorsun." },
          { text: R`if (kapi === 1) {`, why: "O başka bir dil. C'de === yok." },
          { text: R`if (kapi != 1) {`, why: "Bu tam tersini soruyor: kapı açık DEĞİLSE 'Acik' yazar." },
          { text: R`if (1 = kapi) {`, why: "Değer sağdan sola akar, 1'e bir şey atanamaz." },
        ],
        win: "if (kapi = 1) önce kapi'ye 1 yazar, sonra sonucu 'doğru' sayar. Hem karar yanlış olur hem veri bozulur.",
      },
      {
        id: "mental3", type: "predict", title: "İki Kapı",
        say: "Koşulları da kafanda geç. Hangi blok çalıştı, hangisi atlandı?",
        card: `<p><code>c % 2 == 0</code> sayının çift olup olmadığını sorar. 2'ye bölümden kalan 0 ise çifttir.</p>`,
        code: R`int a = 4;
int b = 7;
int c = 0;
if (a > b) {
    c = a;
} else {
    c = b;
}
if (c % 2 == 0) {
    c = c + 1;
} else {
    c = c - 1;
}`,
        ask: ["c"],
        win: "İlk if ikisinden büyüğünü buldu, ikinci if onunla oynadı. Bu kalıbı yine göreceksin.",
      },
      {
        id: "aluboss", type: "write", title: "Tek mi Çift mi", boss: true,
        say: "Bir sayı al, karar ver, yaz. Hepsi bu. Ama 0 ve eksi sayıları da deneyeceğim.",
        card: `<p>Bir tam sayı oku. Çiftse <code>CIFT</code>, tekse <code>TEK</code> yazdır.</p>`,
        goal: "Klavyeden bir tam sayı oku. Çiftse <code>CIFT</code>, tekse <code>TEK</code> yazdır.",
        code: R`int n;
scanf("%d", &n);

// kararını burada ver
`,
        tests: [
          { stdin: "4", expect: "CIFT" },
          { stdin: "7", expect: "TEK" },
          { stdin: "0", expect: "CIFT" },
          { stdin: "-3", expect: "TEK" },
        ],
        hints: ["n % 2 sayının 2'ye bölümünden kalanı verir.", "n % 2 == 1 yazarsan -3 için çalışmaz, çünkü -3 % 2 sonucu -1'dir. 0'la karşılaştır.", `if (n % 2 == 0) { printf("CIFT\\n"); } else { printf("TEK\\n"); }`],
        win: "Karar birimi çalışıyor. Sırada saat devresi var. Yani derslerde tam kaldığınız yer.",
      },
    ],
  },

  /* ==================== CLK ==================== */
  {
    id: "clk", code: "CLK", name: "Saat Devresi", topic: "for döngüsü",
    missions: [
      {
        id: "anatomy", type: "order", title: "Döngünün Anatomisi",
        say: "for kodu yukarıdan aşağı akmaz, bu yüzden herkes şaşırır. Sırayı sana seçtireceğim. Kendin keşfet.",
        card: `<pre class="mini">for ( başlangıç ; koşul ; artış ) {
    gövde
}</pre>
<p><b>Başlangıç</b> sadece bir kez çalışır. Sonra sürekli şu daire döner: <b>koşul → gövde → artış → koşul → ...</b></p>
<p>Koşul yanlış çıktığı an döngü biter.</p>`,
        code: R`int i;
for (i = 0; i < 3; i++) {
    printf("%d\n", i);
}`,
        after: [
          {
            q: "Döngü bitti. <code>i</code> şu an kaç, neden?",
            opts: ["3. Koşulun yanlış çıkması için i'nin 3 olması gerekti.", "2. Çünkü son yazılan sayı 2'ydi.", "0. Döngü bitince i sıfırlanır."], a: 0,
            why: "Ekrana 2 yazıldı, sonra i++ çalıştı, i 3 oldu, koşul yanlış çıktı. RAM'e bak, hala 3 duruyor.",
          },
        ],
        win: "Şimdi for'un kalbini gördün. Koşul her turun başında, artış her turun sonunda.",
      },
      {
        id: "handloop", type: "exec", title: "Elle Döngü", showTrace: true,
        say: "Bu kez tüm döngüyü sen çalıştır. Sağdaki iz tablosu senin için. RAM'de geçmiş yok, sadece son değer var.",
        card: `<p>Her turda sırasıyla: koşula cevap ver, gövdeyi çalıştır, <code>i</code>'yi artır.</p>
<p><code>i++</code> demek <code>i = i + 1</code> demek.</p>`,
        code: R`int i;
for (i = 1; i <= 3; i++) {
    printf("%d\n", i);
}`,
        win: "Tebrikler. Artık bir bilgisayar kadar yavaş ama bir bilgisayar kadar da doğrusun.",
      },
      {
        id: "accum", type: "exec", title: "Birikimci", showTrace: true,
        say: "Programlamanın en sevilen kalıbı. Bir kutu dışarıda bekler, döngü her turda üstüne ekler.",
        card: `<p><code>toplam</code> döngünün dışında 0 olarak doğar. Her turda eski değerine <code>i</code> eklenir.</p>
<p>Değişken döngü boyunca <b>birikir</b>, çünkü her tur bir önceki turun bıraktığı değerle başlar.</p>`,
        code: R`int toplam = 0;
int i;
for (i = 1; i <= 4; i++) {
    toplam = toplam + i;
}
printf("%d\n", toplam);`,
        after: [
          {
            q: "<code>toplam</code>'ı döngünün <b>içinde</b> <code>int toplam = 0;</code> diye tanımlasaydık ne olurdu?",
            opts: ["Her turda sıfırdan başlar, biriktiremezdi.", "Daha hızlı çalışırdı.", "Hiçbir şey değişmezdi."], a: 0,
            why: "Biriken şey döngünün dışında yaşamak zorunda. İçeride doğan değişken turun sonunda ölür.",
          },
        ],
        win: "Toplam, çarpım, sayaç, en büyük. Hepsi bu kalıp. Bunu kaptıysan döngü konusu bitti demektir.",
      },
      {
        id: "tuner", type: "fill", title: "Döngü Ayar Masası", live: true,
        say: "Dört düğme, tek hedef. Ekranda istenen sayılar çıkana kadar çevir. Sonsuz döngüye girersen fan çıldırır.",
        card: `<p>Başlangıç, koşul ve artışı ayarla. Çıktı anında sağda görünür. Bir sayı dizisini üreten birden fazla ayar olabilir.</p>`,
        rounds: [
          { target: "1 2 3 4 5", start: [0, 0, 0, 1], say: "Birden beşe. En klasiği." },
          { target: "0 2 4 6 8", start: [1, 1, 2, 0], say: "Çiftler. Artış 1 olmak zorunda değil." },
          { target: "5 4 3 2 1", start: [1, 1, 2, 0], say: "Geri sayım. Koşul yönünü de değiştirmen lazım." },
          { target: "10 20 30 40", start: [0, 0, 0, 0], say: "Onar onar." },
          { target: "1 2 4 8 16 32", start: [0, 0, 7, 4], say: "İkiye katlıyoruz. 0'dan başlarsan ne olur, bir dene." },
        ].map((r) => Object.assign(r, {
          template: R`int i;
for (i = {{0}}; i {{1}} {{2}}; {{3}})
    printf("%d ", i);`,
          slots: [["0", "1", "5", "10"], ["<", "<=", ">", ">="], ["0", "1", "5", "6", "8", "9", "10", "32", "40", "50"], ["i++", "i--", "i = i + 2", "i = i + 10", "i = i * 2"]],
        })),
        win: "Bir döngüyü üç şey belirler. Hangi sayıyı üreteceğini kafandan söyleyebiliyorsan döngüyü anladın.",
      },
      {
        id: "tours", type: "tours", title: "Kaç Tur?",
        say: "Döngü kaç tur döner, bitince i kaç olur? Bu ikisini ezbere değil, düşünerek söyleyeceksin.",
        card: `<p>Tur sayısı = gövdenin kaç kez çalıştığı. Tura başlamadan önce koşul sorulur, o yüzden hiç dönmeyen döngü de olabilir.</p>
<p><code>&lt;</code> ile <code>&lt;=</code> arasındaki fark tam 1 turdur. Programcıların yarısının hatası bu bir turdan çıkar.</p>`,
        loops: ["i = 0; i < 5; i++", "i = 1; i <= 5; i++", "i = 0; i <= 5; i++", "i = 10; i > 0; i = i - 3", "i = 5; i < 5; i++", "i = 0; i < 10; i = i + 2"],
        win: "Hiç dönmeyen döngüye şaşırdın mı? Koşul baştan yanlışsa gövde görülmez bile.",
      },
      {
        id: "semibug", type: "bugfix", title: "Noktalı Virgül Laneti",
        say: "0, 1, 2 yazması gerekiyor, ama sadece 3 yazıyor. Kod masum görünüyor. Sen ne dersin?",
        card: `<p>Tek bir karakter bütün mantığı değiştirebilir.</p>`,
        code: R`int i;
for (i = 0; i < 3; i++);
{
    printf("%d\n", i);
}`,
        expect: "0\n1\n2",
        bugLine: 2,
        options: [
          { text: R`for (i = 0; i < 3; i++)`, ok: true, why: "Satır sonundaki ; gitti, döngü artık alttaki bloğu çalıştırıyor." },
          { text: R`for (i = 0; i <= 3; i++);`, why: "Tur sayısını değiştirmek işe yaramaz, gövde hala boş." },
          { text: R`for (i = 1; i < 3; i++);`, why: "Başlangıç sorun değil. Satırın sonuna bak." },
          { text: R`for (i = 0, i < 3, i++);`, why: "for içinde virgül değil noktalı virgül kullanılır." },
        ],
        win: "for satırının sonundaki ; demek 'gövdem boş' demek. Döngü boşa döndü, sonra blok bir kez çalıştı.",
      },
      {
        id: "initbug", type: "bugfix", title: "Saçma Toplam",
        say: "1+2+3 = 6 olmalı. Ekranda her seferinde başka bir sayı çıkıyor. Döngünün suçu yok, ona dikkat et.",
        card: `<p>RAM devresinde öğrendiklerini hatırla. Kiralık daire, önceki kiracı...</p>`,
        code: R`int toplam;
int i;
for (i = 1; i <= 3; i++) {
    toplam = toplam + i;
}
printf("%d\n", toplam);`,
        expect: "6",
        bugLine: 1,
        options: [
          { text: R`int toplam = 0;`, ok: true, why: "Birikime sıfırdan başlıyor." },
          { text: R`int toplam = 1;`, why: "1'den başlarsa sonuç 7 çıkar. Toplama için başlangıç 0'dır." },
          { text: R`float toplam;`, why: "Tip değiştirmek çöpü temizlemez." },
        ],
        win: "Biriktiren her değişkene başlangıç değeri ver. Toplama için 0, çarpma için 1.",
      },
      {
        id: "infbug", type: "bugfix", title: "Fan Çıldırdı",
        say: "Bu kod bitmiyor. Fan havalanacak neredeyse. Hangi satır, hangi düzeltme?",
        card: `<p>Sonsuz döngü: koşul hep doğru kalır. Genellikle artış yanlış yöndedir ya da hiç yoktur.</p>`,
        code: R`int i;
for (i = 0; i < 3; i--) {
    printf("%d\n", i);
}`,
        expect: "0\n1\n2",
        bugLine: 2,
        options: [
          { text: R`for (i = 0; i < 3; i++) {`, ok: true, why: "i artık koşula doğru ilerliyor." },
          { text: R`for (i = 0; i > 3; i--) {`, why: "Koşul baştan yanlış olur, döngü hiç dönmez." },
          { text: R`for (i = 3; i < 3; i--) {`, why: "Yine hiç dönmez." },
        ],
        win: "Döngü yazarken kendine sor: i her turda koşulun yanlış olacağı yere yaklaşıyor mu?",
      },
      {
        id: "factparsons", type: "parsons", title: "Faktöriyel Devresi",
        say: "5! = 120. Parçalar karışmış, doğru olanları dizip programı kur. İçinde yanlış başlangıç değerleri de var.",
        card: `<p>Toplamda başlangıç 0'dı. Çarpımda 0'dan başlarsan ne olur, düşün. Süslü parantezler de birer satır.</p>`,
        given: [],
        lines: ["int f = 1;", "int f = 0;", "int i;", "for (i = 1; i <= 5; i++) {", "f = f * i;", "f = f + i;", "}", R`printf("%d\n", f);`],
        goal: "Ekrana <code>120</code> yazdırmalı.",
        expect: "120",
        win: "0 ile başlasaydın sonuç hep 0 olurdu. Sıfırla çarpınca her şey sıfır.",
      },
      {
        id: "sum100", type: "write", title: "Gauss'u Yenmek",
        say: "Efsaneye göre Gauss küçük bir çocukken 1'den 100'e kadar toplamayı kafadan bulmuş. Sen işlemcisin, döngü yaz.",
        card: `<p>Birikimci kalıbı: dışarıda sıfırla, içeride ekle, sonda yazdır.</p>`,
        goal: "1'den 100'e kadar olan sayıların toplamını <code>for</code> ile hesapla, ekrana yazdır.",
        code: R`// kodunu buraya yaz
`,
        tests: [{ expect: "5050" }],
        check: (src) => (/for\s*\(/.test(src) ? null : "for kullanmadan olmaz. printf(\"5050\") yazmak zekice, ama burada yasak."),
        hints: ["int toplam = 0; ve int i; ile başla.", "for (i = 1; i <= 100; i++) bir kez her sayı için döner.", `for (i = 1; i <= 100; i++) { toplam = toplam + i; }  printf("%d\\n", toplam);`],
        win: "5050. Gauss yine de senden hızlıydı. Ama o for yazamıyordu.",
      },
      {
        id: "table", type: "write", title: "Çarpım Tablosu",
        say: "Klavyeden bir sayı al, tablosunu bas. Boşluklara dikkat, ben titizimdir.",
        card: `<p>Her satır aynı kalıpta. Değişen tek şey <code>i</code>.</p>`,
        goal: "Bir tam sayı <code>n</code> oku. 1'den 3'e kadar <code>n x i = sonuc</code> satırlarını yazdır. Örneğin n=2: <code>2 x 1 = 2</code>, <code>2 x 2 = 4</code>, <code>2 x 3 = 6</code>",
        code: R`int n;
scanf("%d", &n);

// döngün burada
`,
        tests: [
          { stdin: "2", expect: "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6" },
          { stdin: "7", expect: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21" },
        ],
        hints: ["int i; tanımlamayı unutma.", "printf içinde üç tane %d olacak: n, i ve n * i.", `printf("%d x %d = %d\\n", n, i, n * i);`],
        win: "Bir tablo, iki döngü satırı. İlkokulda bunu ezberletmişlerdi, ayıp.",
      },
      {
        id: "counteven", type: "write", title: "Çiftleri Say", boss: true,
        say: "Devre sonu. Döngü, koşul ve sayaç aynı yerde. Bunu çözersen for'u çözdün demektir.",
        card: `<p>Sayaç, birikimcinin kardeşidir: her seferinde <code>i</code> değil, <code>1</code> ekler. Ama sadece şart sağlanınca.</p>`,
        goal: "Bir tam sayı <code>n</code> oku. 1 ile n arasındaki (n dahil) çift sayıların <b>kaç tane</b> olduğunu yazdır.",
        code: R`int n;
scanf("%d", &n);

// kodun burada
`,
        tests: [
          { stdin: "10", expect: "5" },
          { stdin: "7", expect: "3" },
          { stdin: "1", expect: "0" },
          { stdin: "2", expect: "1" },
        ],
        hints: ["int sayac = 0; dışarıda dursun.", "Döngünün içinde if (i % 2 == 0) diye sor.", "if (i % 2 == 0) { sayac++; }"],
        win: "Saat devresi tıklıyor. Sırada bekçi devresi var. Yani for'un kardeşleri.",
      },
    ],
  },

  /* ==================== WDT ==================== */
  {
    id: "wdt", code: "WDT", name: "Bekçi Devresi", topic: "while ve do-while döngüleri",
    missions: [
      {
        id: "whileanat", type: "order", title: "while'ın Anatomisi",
        say: "Anakartta bir bekçi devresi vardır, adı watchdog. Bir şey değişene kadar bekler, sorar, yine bekler. <code>while</code> tam olarak bu.",
        card: `<pre class="mini">başlangıç;
while ( koşul ) {
    gövde
    artış
}</pre>
<p><code>for</code>'daki üç parça hala burada, sadece yerleri değişti. Başlangıç döngüden önce, artış gövdenin içinde.</p>
<p>Daire aynı: <b>koşul → gövde → koşul → ...</b> Koşul yanlış çıktığı an döngü biter.</p>`,
        code: R`int i = 0;
while (i < 3) {
    printf("%d\n", i);
    i++;
}`,
        after: [
          {
            q: "<code>while</code> gövdesindeki <code>i++</code> satırını silsek ne olur?",
            opts: ["i hep 0 kalır, koşul hep doğru olur, döngü bitmez.", "Derleyici i'yi kendisi artırır.", "Döngü hiç çalışmaz."], a: 0,
            why: "for'da artışı unutmak zordur, çünkü parantezde yeri vardır. while'da kimse sana hatırlatmaz. Koşulu değiştirecek satırı sen yazmalısın.",
          },
        ],
        win: "Aynı daire, başka kılık. Parçaların yerini görürsen for ile while arasında geçiş bedava.",
      },
      {
        id: "whilehand", type: "exec", title: "Geri Sayım", showTrace: true,
        say: "Fırlatma rampası gibi düşün. Bekçi her turda soruyor: 'Daha sıfıra gelmedik mi?'",
        card: `<p>Bu kez hepsini sen çalıştırıyorsun. Her turun başında koşula cevap ver, sonra gövdeyi satır satır yürüt.</p>
<p>Gövde bitince otomatik olarak koşula dönülür. Süslü parantezin kapanışı "yukarı dön" demektir.</p>`,
        code: R`int n = 3;
while (n > 0) {
    printf("%d\n", n);
    n = n - 1;
}
printf("Bitti\n");`,
        after: [
          {
            q: "Döngü bittiğinde <code>n</code> kaç, ekrana yazılan son sayı neden 1?",
            opts: ["n 0. Koşul 0 > 0 yanlış çıktığı için gövdeye girilmedi, 0 hiç yazılmadı.", "n 1. Döngü n 1 olunca durur.", "n -1. Döngü bir tur fazla döner."], a: 0,
            why: "Koşul gövdeden önce sorulur. n 0 olduğu anda bekçi kapıyı kapatır, printf'e sıra gelmez.",
          },
        ],
        win: "Üç, iki, bir, bitti. NASA seni henüz aramadı ama sabret.",
      },
      {
        id: "forwhile", type: "parsons", title: "for'dan while'a Çeviri",
        say: "Patron for sevmiyormuş. Aynı işi while ile istiyor. Parçaları diz, tuzaklara dikkat et.",
        card: `<p>Bu <code>for</code> döngüsünü <code>while</code> ile yeniden kur:</p>
<pre class="mini">for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}</pre>
<p>printf ile i++ satırlarının sırası önemli. Yer değiştirirlerse çıktıya ne olur, düşün.</p>`,
        given: [],
        lines: ["int i = 1;", "while (i <= 5) {", "while (i < 5) {", R`printf("%d ", i);`, "i++;", "i--;", "}"],
        goal: "Ekrana <code>1 2 3 4 5</code> yazdırmalı.",
        expect: "1 2 3 4 5",
        win: "Her for bir while'a çevrilebilir, tersi de doğru. Hangisini seçeceğin, kodu okuyacak kişiye bağlı.",
      },
      {
        id: "whiletuner", type: "fill", title: "Bekçi Ayar Masası", live: true,
        say: "Döngü ayar masasının while modeli. Yine dört düğme, yine aynı fan.",
        card: `<p>Başlangıç, koşul ve gövdedeki değişimi ayarla. Çıktı anında sağda görünür.</p>`,
        rounds: [
          { target: "0 1 2 3", start: [1, 0, 0, 0], say: "Sıfırdan üçe." },
          { target: "3 2 1", start: [0, 0, 1, 0], say: "Geri sayım. Hem koşulun yönü hem de değişimin yönü dönmeli." },
          { target: "2 4 6 8", start: [0, 1, 1, 0], say: "İkişer ikişer." },
          { target: "1 2 4 8", start: [2, 0, 2, 2], say: "İkiye katla. 0'dan başlarsan 0 hep 0 kalır, fan kalkar." },
        ].map((r) => Object.assign(r, {
          template: R`int i = {{0}};
while (i {{1}} {{2}}) {
    printf("%d ", i);
    {{3}};
}`,
          slots: [["0", "1", "2", "3"], ["<", "<=", ">", ">="], ["0", "3", "4", "8", "10"], ["i++", "i--", "i = i + 2", "i = i * 2"]],
        })),
        win: "while'ın bitmesi senin elinde. Koşul er geç yanlış olacak mı, kendine bunu sor.",
      },
      {
        id: "whilebug", type: "bugfix", title: "Hesaplayıp Yazmamak",
        say: "0, 1, 2 yazması gereken kod sonsuza kadar 0 yazıyor. Yazan stajyer 'artırdım ama' diyor. Bak bakalım artırmış mı.",
        card: `<p>RAM devresini hatırla: bir kutunun içi ancak <b>atama</b> ile değişir.</p>`,
        code: R`int i = 0;
while (i < 3) {
    printf("%d\n", i);
    i + 1;
}`,
        expect: "0\n1\n2",
        bugLine: 4,
        options: [
          { text: R`    i = i + 1;`, ok: true, why: "Sonuç sonunda kutuya yazıldı." },
          { text: R`    i == i + 1;`, why: "Bu bir soru, atama değil. Cevabı da hiçbir yere gitmiyor." },
          { text: R`    i + 2;`, why: "Daha çok hesaplamak işe yaramaz. Sonuç yine hiçbir kutuya yazılmıyor." },
          { text: R`    i + 1 = i;`, why: "Değer sağdan sola akar. Solda kutu olmalı." },
        ],
        win: "i + 1 hesaplanır ve çöpe gider. Eşittir yoksa RAM'e bir şey yazılmaz. Sınavda bunu gören gülümser.",
      },
      {
        id: "sentinel", type: "exec", title: "Sıfır Gelene Kadar", showTrace: true,
        say: "Şimdi while'ın asıl işi. Kullanıcı kaç sayı girecek, bilmiyoruz. for bunu sevmez, while sever.",
        card: `<p><b>Kaç tur döneceğin belliyse</b> <code>for</code> rahattır. <b>Bir şey olana kadar dönüyorsan</b> <code>while</code> daha doğal.</p>
<p>Burada kullanıcı <code>0</code> girene kadar sayılar toplanıyor. Bu görevde klavyeden sırayla <code>4</code>, <code>7</code>, <code>0</code> gelecek.</p>`,
        code: R`int x;
int toplam = 0;
scanf("%d", &x);
while (x != 0) {
    toplam = toplam + x;
    scanf("%d", &x);
}
printf("%d\n", toplam);`,
        stdin: "4 7 0",
        after: [
          {
            q: "Bu kodda <code>scanf</code> neden iki kez yazıldı?",
            opts: ["İlki koşula bakmadan önce x'i doldurur, ikincisi her turda yeni sayıyı getirir.", "Klavye bazen ilk seferde okunmaz, garanti olsun diye.", "İkisi aynı anda çalışır, biri x'e biri toplam'a yazar."], a: 0,
            why: "İlk scanf olmasa koşul çöp değere bakardı. Gövdedeki olmasa x hiç değişmez, döngü bitmezdi. x'in içinde her an sadece son okunan sayı var.",
          },
        ],
        win: "Bu kalıbın adı nöbetçi değer. Özel bir değer gelene kadar çalış, gelince dur.",
      },
      {
        id: "sumzero", type: "write", title: "Nöbetçi Toplam",
        say: "Az önce çalıştırdığın kalıbı bu sefer kendin yaz. Kopya çekmeden, ben görüyorum.",
        card: `<p>Kullanıcı <code>0</code> girene kadar sayıları topla. 0 geldiğinde toplamı yazdır.</p>`,
        goal: "Klavyeden <code>0</code> gelene kadar tam sayı oku, toplamlarını yazdır. <code>while</code> kullan.",
        code: R`int x;
int toplam = 0;

// kodun burada
`,
        tests: [
          { stdin: "5 3 0", expect: "8" },
          { stdin: "0", expect: "0" },
          { stdin: "-2 2 9 0", expect: "9" },
        ],
        check: (src) => (/while\s*\(/.test(src) ? null : "Bu görevde while kullanacaksın."),
        hints: ["Koşula bakmadan önce x'in dolu olması lazım: önce bir scanf.", "while (x != 0) içinde önce toplama ekle, sonra yeni sayıyı oku.", `scanf("%d", &x);  while (x != 0) { toplam = toplam + x; scanf("%d", &x); }  printf("%d\\n", toplam);`],
        win: "Girdi kaç tane olursa olsun çalışıyor. for ile bunu yazmak için çok dil dökerdin.",
      },
      {
        id: "doanat", type: "order", title: "do-while: Önce Yap, Sonra Sor",
        say: "while önce sorar, sonra yapar. <code>do-while</code> tam tersi. Önce yapar, sonra 'Bir daha mı?' der. Benim stajyer alma yöntemim gibi.",
        card: `<pre class="mini">do {
    gövde
} while ( koşul );</pre>
<p>Koşul <b>sonda</b> sorulur, bu yüzden gövde <b>en az bir kez</b> çalışır.</p>
<p>Sondaki <code>;</code> zorunludur. <code>while</code> ve <code>for</code>'da yoktur, burada vardır.</p>`,
        code: R`int i = 0;
do {
    printf("%d\n", i);
    i++;
} while (i < 2);`,
        mistakes: { body: "do-while önce gövdeyi çalıştırır. Koşul sonra.", cond: "Gövde bitti. Şimdi sıra sondaki koşulda." },
        after: [
          {
            q: "<code>do-while</code>'ın <code>while</code>'dan tek farkı nedir?",
            opts: ["Koşul sonda sorulur, gövde en az bir kez çalışır.", "Sadece ondalıklı sayılarla çalışır.", "Sonsuz döngüye giremez."], a: 0,
            why: "Daire aynı, sadece giriş kapısı farklı. while kapıda kimlik sorar, do-while içeri alıp sonra sorar.",
          },
        ],
        win: "Önce gövde, sonra koşul. Bu kadar basit. Sıradaki görevde farkı canlı göreceksin.",
      },
      {
        id: "dovswhile", type: "exec", title: "Bir Kez Mutlaka", showTrace: true,
        say: "İki döngü, ikisinin de koşulu baştan yanlış. Biri çalışır, biri çalışmaz. Hangisi?",
        card: `<p>İkisinde de değişken 5, koşul <code>&lt; 3</code>. Yani koşul ilk sorulduğu anda yanlış.</p>`,
        code: R`int a = 5;
while (a < 3) {
    printf("while: %d\n", a);
    a++;
}
int b = 5;
do {
    printf("do: %d\n", b);
    b++;
} while (b < 3);`,
        after: [
          {
            q: "Program bitti. <code>a</code> ve <code>b</code> neden farklı?",
            opts: ["while gövdeye hiç girmedi, a 5 kaldı. do-while bir kez girdi, b 6 oldu.", "b double olduğu için farklı artıyor.", "do-while koşula hiç bakmaz."], a: 0,
            why: "Koşul baştan yanlışsa fark ortaya çıkar: while sıfır tur, do-while bir tur döner.",
          },
        ],
        win: "RAM'e bak: a 5, b 6. Tek bir tur farkı, ama bütün hikaye bu.",
      },
      {
        id: "dobug", type: "bugfix", title: "Sondaki Küçük İşaret",
        say: "Derleyici yine bağırıyor. Yani ben bağırıyorum. Kod çalışmıyor bile. Neyi unuttu bu stajyer?",
        card: `<p>do-while'ın kendine has bir yazım kuralı vardı. Bilgi kartını hatırla.</p>`,
        code: R`int i = 0;
do {
    printf("%d\n", i);
    i++;
} while (i < 3)`,
        expect: "0\n1\n2",
        bugLine: 5,
        options: [
          { text: R`} while (i < 3);`, ok: true, why: "do-while noktalı virgülle biter." },
          { text: R`} while (i < 3) {`, why: "Burada yeni blok açılmaz. do-while'ın gövdesi yukarıda bitti." },
          { text: R`} while i < 3;`, why: "Koşulun parantezi şart." },
          { text: R`} while (i < 3):`, why: "İki nokta değil, noktalı virgül." },
        ],
        win: "while (...) sonuna ; koymak normal while'da felaket, do-while'da zorunluluk. C seni böyle sever.",
      },
      {
        id: "validate", type: "exec", title: "Geçerli Giriş", showTrace: true,
        say: "Kullanıcıya 1 ile 5 arası puan ver dedik. 9 giriyor. Kullanıcı böyledir. do-while tam bunun için var.",
        card: `<p>Önce kullanıcıya <b>sormak zorundasın</b>, ancak ondan sonra cevabı kontrol edebilirsin. Bu yüzden gövdenin en az bir kez çalışması gerekir.</p>
<p><code>||</code> "veya" demek: biri doğruysa koşul doğrudur. Bu görevde klavyeden sırayla <code>9</code>, <code>-1</code>, <code>3</code> gelecek.</p>`,
        code: R`int puan;
do {
    printf("Puan gir:\n");
    scanf("%d", &puan);
} while (puan < 1 || puan > 5);
printf("Puan: %d\n", puan);`,
        stdin: "9 -1 3",
        win: "Hatalı girdi geçemez. Her form ekranının arkasında bu mantık var.",
      },
      {
        id: "whiletours", type: "tours", title: "Kaç Tur? Bekçi Sürümü", full: true,
        say: "Yine sayıyoruz. Ama dikkat et, bazıları do-while. Koşul baştan yanlış olsa bile kapı açılabilir.",
        card: `<p>Önce döngü tipine bak: koşul başta mı, sonda mı? Sonra <code>i</code>'nin her turda aldığı değerleri kağıda yaz.</p>
<p>Alttaki şeritte her kutu, o turun başındaki <code>i</code> değerini gösterecek.</p>`,
        loops: [
          "int i = 0;\nwhile (i < 3) {\n    i++;\n}",
          "int i = 5;\nwhile (i < 5) {\n    i++;\n}",
          "int i = 5;\ndo {\n    i++;\n} while (i < 5);",
          "int i = 10;\nwhile (i > 0) {\n    i = i - 3;\n}",
          "int i = 0;\ndo {\n    i = i + 2;\n} while (i < 5);",
          "int i = 1;\nwhile (i < 20) {\n    i = i * 2;\n}",
        ],
        win: "Üçüncü soruda çoğu kişi 0 der. Sen artık demezsin.",
      },
      {
        id: "collatz", type: "predict", title: "Çılgın Dizi",
        say: "Matematikçilerin yüz yıldır çözemediği bir dizi. Korkma, senden çözmeni istemiyorum. Sadece çalıştır.",
        card: `<p>Kural basit: sayı çiftse yarıya indir, tekse 3 ile çarpıp 1 ekle. 1'e gelince dur. Kaç adımda biteceğini önceden bilmek zor, o yüzden <code>for</code> değil <code>while</code>.</p>
<p>Kağıda <code>n</code> ve <code>adim</code> sütunlarını yaz.</p>`,
        code: R`int n = 6;
int adim = 0;
while (n != 1) {
    if (n % 2 == 0) {
        n = n / 2;
    } else {
        n = 3 * n + 1;
    }
    adim++;
}`,
        ask: ["n", "adim"],
        win: "6, 3, 10, 5, 16, 8, 4, 2, 1. Buna Collatz dizisi deniyor. Her sayının 1'e ulaşıp ulaşmadığını hala kimse kanıtlayamadı.",
      },
      {
        id: "pin", type: "write", title: "Şifre Kapısı", boss: true,
        say: "Devre sonu. Kapının şifresi 1234. Doğru girilene kadar sormaya devam et, kaçıncı denemede bilindiğini söyle.",
        card: `<p>Önce sormak zorundasın, sonra kontrol. Bu cümle sana bir şey hatırlatıyor mu?</p>`,
        goal: "Klavyeden sayı oku. Sayı <code>1234</code> olana kadar okumaya devam et, sonunda toplam deneme sayısını yazdır. <code>do-while</code> kullan.",
        code: R`int sifre;
int deneme = 0;

// kodun burada
`,
        tests: [
          { stdin: "1 2 1234", expect: "3" },
          { stdin: "1234", expect: "1" },
          { stdin: "5 1234", expect: "2" },
        ],
        check: (src) => (/\bdo\s*\{/.test(src) ? null : "Bu görevde do-while kullanacaksın."),
        hints: ["Gövdede iki iş var: scanf ile oku, deneme sayacını artır.", "Koşul 'şifre yanlış olduğu sürece' demeli: sifre != 1234", `do { scanf("%d", &sifre); deneme++; } while (sifre != 1234);  printf("%d\\n", deneme);`],
        win: "Bekçi devresi devrede. for, while, do-while hepsi aynı dairenin üç kapısı. Geriye tek çip kaldı: ana işlemci.",
      },
    ],
  },

  /* ==================== CPU ==================== */
  {
    id: "cpu", code: "CPU", name: "Ana İşlemci", topic: "Her şey bir arada",
    missions: [
      {
        id: "finalmental", type: "predict", title: "Son İz Sürme",
        say: "Döngü, if, iki değişken. Kağıdı kalemi al, her turu yaz. Kestirme yok.",
        card: `<p>Tablo yap: <code>i</code>, <code>a</code>, <code>b</code> sütunları. Her turda bir satır. Bu yöntem sınavda hayat kurtarır.</p>`,
        code: R`int i;
int a = 0;
int b = 1;
for (i = 0; i < 5; i++) {
    if (i % 2 == 0) {
        a = a + i;
    } else {
        b = b * 2;
    }
}`,
        ask: ["a", "b", "i"],
        win: "Kafandaki işlemci çalışıyor. Isınmaya da başladı, belli.",
      },
      {
        id: "fib", type: "predict", title: "Tanıdık Dizi",
        say: "Takas ile döngü bir araya gelince çok ünlü bir şey çıkıyor. Bakalım tanıyacak mısın?",
        card: `<p><code>t</code> döngü bloğunun içinde doğuyor. Her tur sonunda ölüyor. Bir sonraki turda yeniden doğuyor.</p>`,
        code: R`int a = 0;
int b = 1;
int i;
for (i = 0; i < 6; i++) {
    int t = a + b;
    a = b;
    b = t;
}`,
        ask: ["a", "b"],
        win: "1, 1, 2, 3, 5, 8, 13. Fibonacci. Değerleri kaybetmeden kaydırdın. Takasın ileri seviyesi.",
      },
      {
        id: "bootcode", type: "write", title: "BOOT Kodu", boss: true, final: true,
        say: "Son görev stajyer. Yeni işlemci gelmedi, gelmeyecek de. Makineyi sen açacaksın. Önce n, sonra n tane sayı oku, en büyüğünü yaz.",
        card: `<p>Şimdiye kadar öğrendiğin her şey burada: değişken, scanf, for, if.</p>
<p>Tuzak uyarısı: testlerde hepsi eksi olan sayılar da var.</p>`,
        goal: "Önce <code>n</code>, sonra <code>n</code> tane tam sayı oku. Bunların en büyüğünü yazdır.",
        code: R`int n;
scanf("%d", &n);

// kodun burada
`,
        tests: [
          { stdin: "3 5 9 2", expect: "9" },
          { stdin: "1 42", expect: "42" },
          { stdin: "4 -3 -7 -1 -9", expect: "-1" },
          { stdin: "5 1 2 3 4 5", expect: "5" },
        ],
        hints: ["En büyüğü tutacak bir değişken lazım: enb.", "enb'yi 0 yaparsan hepsi eksi olduğunda yanlış çıkar. İlk okunan sayıyla başlat.", `scanf("%d", &enb);  for (i = 1; i < n; i++) { scanf("%d", &x); if (x > enb) { enb = x; } }`],
        win: "Güç var. Saat tıklıyor. RAM cevap veriyor. Ekrana bak.",
      },
    ],
  },
];

const ABI = {
  good: ["Doğru. Alışma ama.", "Bak sen. Çalışıyor.", "Tamam, RAM seni sevdi.", "Saat döngüsü boşa gitmedi.", "Hmm. İtiraz edecek bir şey bulamadım.", "İyi. Devam.", "Sıkıcı derecede doğru.", "Bunu nereden öğrendin? Benden tabii."],
  bad: ["Stajyer. O satırı bir daha oku.", "Bu değerle makine açılmaz.", "Çekirdek ısınıyor, dikkat.", "Hayır. Güzel denemeydi. Ama hayır.", "Sakin ol, RAM kaçmıyor. Tekrar bak.", "Yanlış. Ama daha kötülerini gördüm.", "Fan sesi duyuyor musun? O sensin."],
  cell: ["Eşittirin SOLUNA bak. Yazılan yer orası.", "Yanlış kutu. Bu satır o kutuya dokunmuyor.", "Sadece adı geçmesi yetmez. Hangi kutunun içi değişiyor?"],
};

const RANKS = [
  [0, "Stajyer"], [700, "Çaylak Çekirdek"], [2000, "Tek Çekirdek"], [3400, "Çift Çekirdek"], [4800, "Turbo Boost"], [6200, "Overclock Efsanesi"],
];

const LAB_EXAMPLES = [
  { name: "Değişken ve kopya", code: R`#include <stdio.h>

int main() {
    int a = 3;
    int b = a;
    a = 10;
    printf("a = %d, b = %d\n", a, b);
    return 0;
}` },
  { name: "Çöp değer", code: R`int t;
printf("t ilk haliyle: %d\n", t);
t = t + 5;
printf("5 ekleyince: %d\n", t);` },
  { name: "Tam sayı bölmesi", code: R`int p = 7;
int q = 2;
float a = p / q;
float b = (float)p / q;
printf("%f %f\n", a, b);` },
  { name: "scanf ve adres", code: R`int n;
printf("n'nin adresi: %p\n", &n);
scanf("%d", &n);
printf("Okunan: %d\n", n);`, stdin: "21" },
  { name: "for ile toplam", code: R`int toplam = 0;
int i;
for (i = 1; i <= 5; i++) {
    toplam = toplam + i;
    printf("i=%d toplam=%d\n", i, toplam);
}
printf("Sonuc: %d\n", toplam);` },
  { name: "while ile geri sayım", code: R`int n = 3;
while (n > 0) {
    printf("%d\n", n);
    n = n - 1;
}
printf("Bitti\n");` },
  { name: "do-while ve while farkı", code: R`int a = 5;
while (a < 3) {
    a++;
}
int b = 5;
do {
    b++;
} while (b < 3);
printf("a = %d, b = %d\n", a, b);` },
  { name: "Sıfır gelene kadar topla", code: R`int x;
int toplam = 0;
scanf("%d", &x);
while (x != 0) {
    toplam = toplam + x;
    scanf("%d", &x);
}
printf("Toplam: %d\n", toplam);`, stdin: "4 7 0" },
  { name: "İç içe döngü", code: R`int i, j;
for (i = 1; i <= 3; i++) {
    for (j = 1; j <= i; j++) {
        printf("*");
    }
    printf("\n");
}` },
  { name: "En büyüğü bul", code: R`int n, x, enb, i;
scanf("%d", &n);
scanf("%d", &enb);
for (i = 1; i < n; i++) {
    scanf("%d", &x);
    if (x > enb) {
        enb = x;
    }
}
printf("En buyuk: %d\n", enb);`, stdin: "4 12 7 30 5" },
];

