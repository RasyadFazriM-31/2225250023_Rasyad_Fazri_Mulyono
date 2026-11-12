# KeBangun: Media Belajar Interaktif Kesebangunan

Aplikasi web untuk membantu siswa SMP memahami **kesebangunan bangun datar dan segitiga**. Rancangannya disusun dari hasil wawancara dengan seorang siswa kelas 9 (kode S01) dan dianalisis dengan *Cognitive Load Theory* (beban intrinsik, ekstrinsik, dan germane).

- Aplikasi (draf): https://rasyadfazrim-31.github.io/2225250023_Rasyad_Fazri_Mulyono/
- Instrumen pre-test dan post-test: [instrumen/](instrumen/)

## Fitur

| Bagian | Isi |
|--------|-----|
| 1. Perbandingan | Balok yang bisa dikelompokkan (5 : 10 → 1 : 2), menyederhanakan dengan FPB, perbandingan senilai, perkalian silang. |
| 2. Apa itu sebangun? | Rumah yang diperbesar dengan *slider* (dan "ditarik" supaya terlihat mengapa tidak sebangun), dua syarat sebangun, contoh persegi vs belah ketupat. |
| 3. Sisi seletak & rotasi | Penjelajah rotasi dan pencerminan, empat jurus mencari sisi seletak, permainan "pasangkan sisi". |
| 4. Segitiga sebangun | Syarat Sd-Sd, S-S-S, S-Sd-S; bentuk A (garis sejajar) dan bentuk X yang bisa dipisahkan dengan animasi; garis tinggi pada segitiga siku-siku. |
| 5. Contoh soal | 6 jenis soal, langkah dibuka satu per satu, tombol **Ganti angka**, mode **Coba sendiri**, dan kotak **Cek dengan sifat sebangun**. |
| 6. Latihan bertahap | 5 level, petunjuk bertahap, umpan balik untuk kesalahan umum (misalnya memakai DB, bukan AB), bantuan warna yang bisa dimatikan. |
| Papan sketsa | Kertas berpetak, garis lurus yang menempel ke titik petak, warna pena, simpan gambar, kotak "Jelaskan ke teman". |
| Ringkasan | Inti materi dalam satu layar, bisa dicetak. |

## Dasar rancangan (pemetaan hasil wawancara → fitur)

| Kode | Temuan wawancara | Fitur |
|------|------------------|-------|
| K01, EL04, DS02 | Sulit menentukan alur penyelesaian; lebih paham bila dijelaskan urut, pelan, dari konsep dasar. | Modul dipecah menjadi langkah pendek (satu ide per layar); contoh soal dibuka langkah demi langkah. |
| K02 | Guru menjelaskan secara abstrak di papan tulis. | Konsep diawali gambar konkret di kertas berpetak yang bisa diputar, digeser, dipisahkan. |
| K03 | Materi terlupa karena tertimpa materi kelas 9. | Halaman Ringkasan dan modul Prasyarat. |
| IL01, IL03 | Perlu prasyarat rasio, pecahan, perkalian silang. | Modul 1: Perbandingan. |
| IL02, IL04, IL05 | Bingung menentukan sisi seletak, terutama bila bangun diputar. | Modul 3: rotasi interaktif, empat jurus, permainan pasangkan sisi. |
| EL01, EL03, DS01 | Kertas kotak dan warna pada sisi seletak membantu. | Latar berpetak dan kode warna konsisten (sisi seletak = warna sama). |
| EL02 | Mudah kehilangan fokus saat penjelasan panjang dan monoton. | Teks 1–2 kalimat per langkah; setiap langkah punya kegiatan. |
| EL05, DS03 | Instruksi dan soal cerita yang panjang membuat pusing. | Gambar lebih dulu, pertanyaan ≤ 2 baris, penjelasan tambahan disembunyikan di "Kenapa begitu?". |
| GL01 | Menggambar ulang bangun membantu mengingat. | Papan sketsa. |
| GL02 | Mengaitkan hasil dengan sifat kesebangunan untuk mengecek jawaban. | Kotak "Cek dengan sifat sebangun". |
| GL03, GL05 | Memakai pola contoh soal, "tinggal ganti angkanya". | Tombol "Ganti angka" dan mode "Coba sendiri". |
| GL04 | Menjelaskan kepada teman. | Kotak "Jelaskan ke teman". |
| DS01 | Butuh latihan bertahap. | Latihan 5 level. |

## Instrumen pre-test dan post-test

Untuk mengukur pengaruh aplikasi, disediakan instrumen **Mathematical Literacy** pada materi kesebangunan dengan format kisi-kisi dari dosen (4 indikator, skor maksimum 6 per indikator, total 24):

| Berkas | Isi |
|---|---|
| [instrumen/README.md](instrumen/README.md) | Struktur konstruk, kesetaraan pre-test dan post-test, cara pelaksanaan |
| [instrumen/pretest.md](instrumen/pretest.md) | Lembar soal, kisi-kisi jawaban per tahapan, pedoman penskoran pre-test |
| [instrumen/posttest.md](instrumen/posttest.md) | Lembar soal, kisi-kisi jawaban per tahapan, pedoman penskoran post-test |

Indikator: Mathematical Reasoning, Formulating Situations Mathematically, Employing Mathematical Concepts, Facts, and Procedures, serta Interpreting, Applying, and Evaluating Mathematical Outcomes.

## Cara menjalankan di komputer

Tidak perlu instalasi apa pun.

- **Cara cepat:** klik dua kali `index.html` (terbuka di Chrome/Edge/Firefox).
- **Lewat server lokal** (dibutuhkan untuk `tests/uji-tampilan.html`):
  ```
  cd 2225250023_Rasyad_Fazri_Mulyono
  python -m http.server 8000
  ```
  lalu buka `http://localhost:8000`.

## Publikasi dengan GitHub Pages

- Repositori: https://github.com/RasyadFazriM-31/2225250023_Rasyad_Fazri_Mulyono (format `NIM_Nama`)
- Situs: https://rasyadfazrim-31.github.io/2225250023_Rasyad_Fazri_Mulyono/ (GitHub Pages, cabang `main`, folder root)

Setiap kali ada perubahan, cukup `git add`, `git commit`, `git push`; situsnya ikut diperbarui dalam 1–2 menit.

## Struktur folder

```
2225250023_Rasyad_Fazri_Mulyono/
|-- index.html              halaman utama aplikasi KeBangun
|-- css/gaya.css            tampilan
|-- aset/ikon.svg           ikon aplikasi
|-- js/
|   |-- logika.js           fungsi matematika murni (FPB, perbandingan, kali silang, cek sebangun)
|   |-- gambar.js           mesin gambar SVG (petak, sisi berwarna, busur sudut, label)
|   |-- gambar-khusus.js    bentuk A, bentuk X, garis tinggi, bayangan
|   |-- soal.js             bank soal acak (pola sama, angka beda) + pemeriksa jawaban
|   |-- komponen.js         komponen tampilan (tombol, langkah, sakelar, penyimpanan)
|   |-- pemain-soal.js      mode "lihat langkah" dan "coba sendiri"
|   |-- app.js              navigasi dan kemajuan belajar
|   `-- halaman/            satu berkas per halaman/modul
|-- instrumen/
|   |-- README.md           struktur konstruk dan kesetaraan pre-test/post-test
|   |-- pretest.md          soal + kisi-kisi + pedoman penskoran pre-test
|   |-- posttest.md         soal + kisi-kisi + pedoman penskoran post-test
|   `-- gambar/             gambar soal nomor 3
`-- tests/
    |-- uji-logika.html     38 uji logika dan bank soal (300 soal acak per jenis)
    `-- uji-tampilan.html   uji asap: membuka semua halaman, menekan semua tombol, menjawab soal
```

## Pengujian

- `tests/uji-logika.html`: buka langsung di peramban. Hasil terakhir: **38 PASS, 0 FAIL**.
- `tests/uji-tampilan.html`: jalankan lewat server lokal, lalu buka `http://localhost:8000/tests/uji-tampilan.html`. Hasil terakhir: **31 PASS, 0 FAIL** (10 halaman tanpa galat JavaScript, 11 jenis soal menerima jawaban benar, tidak ada gulir horizontal di lebar 360 px).

## Teknologi dan privasi

HTML, CSS, dan JavaScript murni tanpa pustaka tambahan (kecuali huruf Nunito dari Google Fonts). Aplikasi tidak memakai akun dan tidak mengirim data; kemajuan, skor, sketsa, dan tulisan siswa hanya disimpan di peramban perangkat itu (`localStorage`). Nama narasumber wawancara tidak dicantumkan; hanya kode S01.

## Pembuat

| Nama | NIM | Kontribusi |
|------|-----|-----------|
| Rasyad Fazri Mulyono | 2225250023 | Wawancara, analisis kebutuhan, perancangan, pengujian, dokumentasi |

## Referensi/Bantuan

- Hasil wawancara siswa S01 (9 November 2026) tentang kesulitan belajar kesebangunan.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257–285.
- Bantuan AI (Claude, Anthropic): digunakan untuk menyusun kode dan draf dokumentasi berdasarkan hasil wawancara. Seluruh isi perlu ditinjau dan dapat dijelaskan oleh pembuat.
