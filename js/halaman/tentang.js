/* Tentang aplikasi: dasar rancangan dari hasil wawancara (Cognitive Load Theory). */
(function () {
  'use strict';
  const { el, tombol } = UI;

  // [kode temuan, temuan singkat, fitur di aplikasi]
  const PEMETAAN = [
    ['K01, EL04, DS02', 'Sulit menentukan alur penyelesaian; lebih paham bila dijelaskan urut, pelan, dari konsep dasar.', 'Setiap modul dipecah menjadi langkah pendek (satu ide per layar). Contoh soal dibuka satu langkah demi satu langkah.'],
    ['K02', 'Guru menjelaskan secara abstrak di papan tulis tanpa alat peraga.', 'Setiap konsep diawali gambar konkret di kertas berpetak yang bisa diputar, digeser, dan dipisahkan.'],
    ['K03', 'Materi terlupa karena tertimpa materi kelas 9.', 'Halaman Ringkasan (bisa dicetak) dan modul Prasyarat untuk mengulang dengan cepat.'],
    ['IL01, IL03', 'Perlu menguasai rasio, penyederhanaan (5:10 → 1:2), pecahan, dan perkalian silang.', 'Modul 1: balok yang bisa dikelompokkan, menyederhanakan, perbandingan senilai, dan perkalian silang.'],
    ['IL02, IL04, IL05', 'Bingung menentukan sisi seletak, terutama bila bangun diputar atau berbeda orientasi.', 'Modul 3: penjelajah rotasi & pencerminan, empat jurus mencari sisi seletak, permainan “pasangkan sisi”.'],
    ['EL01, EL03, DS01', 'Buku kotak-kotak dan warna (biru/ungu) pada sisi seletak sangat membantu.', 'Latar berpetak dan kode warna konsisten: sisi seletak selalu berwarna sama. Bantuan warna bisa dimatikan bertahap di latihan.'],
    ['EL02', 'Mudah kehilangan fokus saat penjelasan lisan yang lama dan monoton.', 'Teks 1–2 kalimat per langkah, setiap langkah punya kegiatan (geser, putar, ketuk, jawab).'],
    ['EL05, DS03', 'Soal cerita dan instruksi panjang membuat pusing.', 'Gambar ditampilkan lebih dulu, pertanyaan ≤ 2 baris, penjelasan tambahan disembunyikan di tombol “Kenapa begitu?”.'],
    ['GL01', 'Membuat catatan dan menggambar ulang bangun membantu mengingat.', 'Papan sketsa berpetak dengan garis lurus yang menempel ke titik petak, warna pena, dan simpan gambar.'],
    ['GL02', 'Mengaitkan hasil dengan sifat kesebangunan untuk mengecek jawaban.', 'Kotak “Cek dengan sifat sebangun” di setiap contoh dan latihan: semua perbandingan harus sama.'],
    ['GL03, GL05', 'Memakai pola contoh soal sebelumnya, “tinggal ganti angkanya”.', 'Contoh soal dengan tombol “Ganti angka” dan mode “Coba sendiri” (dari contoh menuju mandiri).'],
    ['GL04', 'Menjelaskan cara penyelesaian kepada teman.', 'Kotak “Jelaskan ke teman” dengan daftar periksa dan tombol salin.'],
    ['DS01', 'Butuh contoh soal latihan bertahap.', 'Latihan 5 level dari prasyarat hingga tantangan, petunjuk dibuka bertahap, umpan balik untuk kesalahan umum.'],
  ];

  window.Halaman.tentang = function (akar) {
    akar.append(
      el('header', { class: 'kepala-modul' },
        el('p', { class: 'label-kecil' }, 'Tentang'),
        el('h1', null, 'Tentang SeBangun'),
        el('p', { class: 'lead' }, 'Media belajar interaktif materi kesebangunan bangun datar dan segitiga untuk siswa SMP.')),
      el('section', { class: 'kartu' },
        el('h2', null, 'Dasar rancangan'),
        el('p', null, 'Aplikasi ini dirancang dari hasil wawancara dengan seorang siswa kelas 9 (kode S01) tentang kesulitan belajar kesebangunan. Temuan dikelompokkan menurut Cognitive Load Theory: beban intrinsik (IL), beban ekstrinsik (EL), beban germane (GL), serta saran desain (DS) dan kesulitan umum (K).'),
        el('div', { class: 'tabel-wadah' },
          el('table', { class: 'tabel tabel-tentang' },
            el('thead', null, el('tr', null, el('th', null, 'Kode'), el('th', null, 'Temuan wawancara'), el('th', null, 'Fitur di aplikasi'))),
            el('tbody', null, PEMETAAN.map(([k, t, f]) => el('tr', null, el('td', null, el('b', null, k)), el('td', null, t), el('td', null, f))))))),
      el('section', { class: 'kartu' },
        el('h2', null, 'Privasi'),
        el('p', null, 'Aplikasi tidak memakai akun dan tidak mengirim data ke mana pun. Kemajuan, skor, sketsa, dan tulisanmu hanya disimpan di peramban (browser) perangkat ini.'),
        tombol('Hapus semua data di perangkat ini', () => {
          if (!window.confirm('Hapus kemajuan, skor, sketsa, dan tulisan di perangkat ini?')) return;
          try {
            Object.keys(localStorage).filter((k) => k.indexOf('sebangun:') === 0).forEach((k) => localStorage.removeItem(k));
          } catch (e) { /* abaikan */ }
          location.hash = '#/beranda';
          location.reload();
        }, 'sekunder kecil')),
      el('section', { class: 'kartu' },
        el('h2', null, 'Pembuat'),
        el('p', null, 'Rasyad Fazri Mulyono (2225250023), S1 Pendidikan Matematika FKIP Universitas Sultan Ageng Tirtayasa.'),
        el('p', { class: 'catatan' }, 'Dibuat dengan HTML, CSS, dan JavaScript tanpa pustaka tambahan. Disusun dengan bantuan AI (Claude, Anthropic); isi telah ditinjau oleh pembuat.')));
  };
})();
