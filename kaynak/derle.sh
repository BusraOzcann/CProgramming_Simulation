#!/bin/sh
# Kaynak dosyaları tek bir HTML dosyasında birleştirir.
# Kullanım: sh kaynak/derle.sh [yayın gövdesi için çıktı yolu]
cd "$(dirname "$0")" || exit 1
HEAD='<title>CPU Stajyeri</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap&subset=latin-ext">'
body() {
  printf '%s\n' "$HEAD"
  printf '<style>\n'; cat stil.css; printf '</style>\n'
  printf '<div id="app"></div>\n<script>\n'
  cat yorumlayici.js gorevler.js oyun.js
  printf '</script>\n'
}
# Tek başına çalışan dosya: çift tıklayınca açılır, e-postayla ya da Moodle üzerinden paylaşılabilir.
{
  printf '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%%}</style>\n'
  printf '</head>\n<body>\n'
  body
  printf '</body>\n</html>\n'
} > ../cpu-stajyeri.html
# Claude Artifact için yalnızca gövde
if [ -n "$1" ]; then body > "$1"; fi
wc -c ../cpu-stajyeri.html
