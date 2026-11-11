/* Modul 5 — Contoh soal: langkah demi langkah, ganti angka, lalu coba sendiri. */
(function () {
  'use strict';
  const { el, tombol } = UI;

  const TIPE = [
    ['persegiPanjang', 'Persegi panjang diputar'],
    ['segitigaDiputar', 'Segitiga diputar'],
    ['bersarang', 'Garis sejajar'],
    ['bayangan', 'Bayangan'],
    ['modelX', 'Bentuk X'],
    ['garisTinggi', 'Garis tinggi ★'],
  ];

  window.Halaman.contoh = function (akar, ctx) {
    let tipe = TIPE.some(([id]) => id === ctx.param.tipe) ? ctx.param.tipe : 'persegiPanjang';
    let mode = 'lihat';
    let soal = null;
    const dilihat = new Set(UI.Simpan.ambil('contohDilihat', []));

    const pilihTipe = el('div', { class: 'chip-deret', role: 'group', 'aria-label': 'Jenis contoh soal' });
    const segMode = UI.segmen([['lihat', 'Lihat langkah'], ['coba', 'Coba sendiri']], mode, (m) => { mode = m; tampil(false); }, 'Mode');
    const kartu = el('section', { class: 'kartu' });
    const isiKartu = el('div');
    const tGanti = tombol('↻ Ganti angka', () => tampil(true), 'sekunder kecil');

    akar.append(
      el('header', { class: 'kepala-modul' },
        el('p', { class: 'label-kecil' }, 'Modul 5'),
        el('h1', null, 'Contoh soal'),
        el('p', { class: 'lead' }, 'Pola sama, angka beda. Ikuti langkahnya, lalu coba sendiri.')),
      pilihTipe, kartu);
    kartu.append(el('div', { class: 'kepala-kartu' }, segMode.elemen, tGanti), isiKartu);

    function bangunChip() {
      pilihTipe.innerHTML = '';
      TIPE.forEach(([id, judul]) => {
        pilihTipe.append(el('button', {
          type: 'button', class: 'chip' + (dilihat.has(id) ? ' sudah' : ''), 'aria-pressed': String(id === tipe),
          onclick: () => { tipe = id; mode = 'lihat'; segMode.pilih('lihat'); tampil(true); bangunChip(); },
        }, judul, dilihat.has(id) ? el('span', { class: 'sr' }, ' (sudah dilihat)') : null));
      });
    }

    function tandaiDilihat() {
      dilihat.add(tipe);
      UI.Simpan.taruh('contohDilihat', Array.from(dilihat));
      bangunChip();
      if (dilihat.size >= 3) ctx.tandai('contoh');
    }

    function tampil(soalBaru) {
      if (soalBaru || !soal) soal = BankSoal.buat(tipe);
      isiKartu.innerHTML = '';
      if (mode === 'lihat') {
        const p = PemainSoal.lihat(soal, {
          onSelesai(wadah) {
            tandaiDilihat();
            wadah.append(el('div', { class: 'ajakan' },
              el('p', null, el('b', null, 'Sudah paham polanya?'), ' Coba soal yang mirip, dengan angka lain.'),
              el('div', { class: 'deret-tombol' },
                tombol('Coba sendiri →', () => { mode = 'coba'; segMode.pilih('coba'); tampil(true); }),
                tombol('Lihat contoh lain', () => tampil(true), 'sekunder'))));
          },
        });
        isiKartu.append(p.elemen);
      } else {
        const p = PemainSoal.coba(soal, {
          onBaru: () => tampil(true), teksBaru: 'Soal lain',
          onSelesai({ wadah }) {
            tandaiDilihat();
            wadah.append(el('div', { class: 'deret-tombol' }, tombol('Soal lain →', () => tampil(true))));
          },
        });
        isiKartu.append(p.elemen);
        p.fokus();
      }
    }

    bangunChip();
    tampil(true);
  };
})();
