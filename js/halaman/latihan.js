/* Modul 6 — Latihan bertahap: 5 level, skor terbaik disimpan di perangkat. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const L = Logika;

  const LEVEL = [
    { id: 1, judul: 'Perbandingan', ket: 'Sederhanakan & kali silang', tipe: ['sederhanakanRasio', 'cariXPerbandingan'] },
    { id: 2, judul: 'Sebangun atau tidak?', ket: 'Cek sudut dan perbandingan sisi', tipe: ['sebangunAtauTidak'] },
    { id: 3, judul: 'Sisi seletak', ket: 'Cari pasangan sisi pada bangun yang diputar', tipe: ['pilihSisiSeletak'] },
    { id: 4, judul: 'Hitung sisi', ket: 'Persegi panjang & segitiga yang diputar', tipe: ['persegiPanjang', 'segitigaDiputar'] },
    { id: 5, judul: 'Tantangan', ket: 'Garis sejajar, bentuk X, bayangan, garis tinggi', tipe: ['bersarang', 'modelX', 'bayangan', 'garisTinggi'] },
  ];
  const JUMLAH = 5;

  const bintang = (skor) => (skor >= JUMLAH ? 3 : skor >= 3 ? 2 : skor >= 1 ? 1 : 0);
  const teksBintang = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  window.Halaman.latihan = function (akar, ctx) {
    let warna = UI.Simpan.ambil('bantuanWarna', true);

    function skorTerbaik() {
      return UI.Simpan.ambil('skorLatihan', {});
    }

    function daftarLevel() {
      akar.innerHTML = '';
      const terbaik = skorTerbaik();
      const saran = LEVEL.find((lv) => bintang(terbaik[lv.id] || 0) < 2) || LEVEL[LEVEL.length - 1];
      akar.append(
        el('header', { class: 'kepala-modul' },
          el('p', { class: 'label-kecil' }, 'Modul 6'),
          el('h1', null, 'Latihan bertahap'),
          el('p', { class: 'lead' }, `Tiap level ada ${JUMLAH} soal. Mulai dari level 1, naik pelan-pelan.`)),
        el('div', { class: 'kartu pengaturan' },
          UI.sakelar('Bantuan warna sisi', warna, (v) => { warna = v; UI.Simpan.taruh('bantuanWarna', v); }),
          el('p', { class: 'catatan' }, 'Sudah lancar? Matikan bantuan warna supaya kamu terbiasa tanpa warna, seperti di buku.')),
        el('ol', { class: 'daftar-level' }, LEVEL.map((lv) => {
          const s = terbaik[lv.id];
          const b = bintang(s || 0);
          return el('li', null, el('button', {
            type: 'button', class: 'kartu-level' + (lv === saran ? ' saran' : ''),
            onclick: () => mulai(lv),
          },
          el('span', { class: 'no-level' }, String(lv.id)),
          el('span', { class: 'teks-level' }, el('b', null, lv.judul), el('small', null, lv.ket)),
          el('span', { class: 'bintang', 'aria-label': s == null ? 'Belum dicoba' : `Skor terbaik ${s} dari ${JUMLAH}` },
            s == null ? (lv === saran ? 'Mulai →' : '') : teksBintang(b))));
        })));
    }

    function mulai(lv) {
      const urutan = [];
      while (urutan.length < JUMLAH) urutan.push(...L.kocok(lv.tipe));
      let nomor = 0, skor = 0;
      akar.innerHTML = '';
      const judul = el('p', { class: 'label-kecil' });
      const bar = el('div', { class: 'bar besar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(JUMLAH) }, el('span'));
      const kartu = el('section', { class: 'kartu' });
      akar.append(
        el('header', { class: 'kepala-modul' },
          el('div', { class: 'baris-antara' },
            el('h1', null, `Level ${lv.id}: ${lv.judul}`),
            tombol('Keluar', daftarLevel, 'teks'))),
        judul, bar, kartu);

      function soalBerikut() {
        if (nomor >= JUMLAH) return hasil();
        const tipe = urutan[nomor];
        nomor++;
        judul.textContent = `Soal ${nomor} dari ${JUMLAH}  ·  Benar: ${skor}`;
        bar.setAttribute('aria-valuenow', String(nomor - 1));
        bar.firstChild.style.width = `${((nomor - 1) / JUMLAH) * 100}%`;
        kartu.innerHTML = '';
        const p = PemainSoal.coba(BankSoal.buat(tipe), {
          warna,
          onSelesai({ benarPertama, wadah }) {
            if (benarPertama) skor++;
            judul.textContent = `Soal ${nomor} dari ${JUMLAH}  ·  Benar: ${skor}`;
            bar.firstChild.style.width = `${(nomor / JUMLAH) * 100}%`;
            const t = tombol(nomor >= JUMLAH ? 'Lihat hasil →' : 'Soal berikutnya →', soalBerikut);
            wadah.append(el('div', { class: 'deret-tombol' }, t));
            t.focus({ preventScroll: true });
          },
        });
        kartu.append(p.elemen);
        p.fokus();
        window.scrollTo(0, 0);
      }

      function hasil() {
        const terbaik = skorTerbaik();
        const rekor = terbaik[lv.id] == null || skor > terbaik[lv.id];
        if (rekor) {
          terbaik[lv.id] = skor;
          UI.Simpan.taruh('skorLatihan', terbaik);
        }
        const cukup = LEVEL.filter((x) => bintang(terbaik[x.id] || 0) >= 2).length;
        if (cukup >= 3) ctx.tandai('latihan');
        const b = bintang(skor);
        const berikut = LEVEL.find((x) => x.id === lv.id + 1);
        const pesan = b === 3 ? 'Sempurna! Kamu siap naik level.' : b === 2 ? 'Bagus! Sedikit lagi sempurna.' : 'Tidak apa-apa. Lihat lagi contoh soalnya, lalu ulangi.';
        akar.innerHTML = '';
        akar.append(el('section', { class: 'kartu selesai-modul' },
          el('p', { class: 'label-kecil' }, `Level ${lv.id}: ${lv.judul}`),
          el('div', { class: 'bintang besar', 'aria-hidden': 'true' }, teksBintang(b)),
          el('h1', { tabindex: '-1' }, `${skor} dari ${JUMLAH} benar`),
          el('p', { class: 'catatan' }, '(dihitung yang benar pada percobaan pertama tanpa petunjuk)'),
          el('p', { class: 'lead' }, pesan + (rekor && skor > 0 ? ' Skor terbaik baru!' : '')),
          el('div', { class: 'deret-tombol tengah' },
            berikut && b >= 2 ? tombol(`Level ${berikut.id} →`, () => mulai(berikut)) : null,
            tombol('Ulangi level', () => mulai(lv), b >= 2 && berikut ? 'sekunder' : ''),
            b < 2 ? el('a', { class: 'tombol sekunder', href: '#/contoh' }, 'Lihat contoh soal') : null,
            tombol('Pilih level', daftarLevel, 'teks'))));
        akar.querySelector('h1').focus();
        window.scrollTo(0, 0);
      }

      soalBerikut();
    }

    daftarLevel();
  };
})();
