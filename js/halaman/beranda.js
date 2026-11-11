/* Halaman Beranda: sambutan, peta belajar, dan cara belajar. */
(function () {
  'use strict';
  const { el } = UI;
  const G = Gambar, L = Logika;

  function gambarSambutan() {
    const abc = L.segitigaDariSisi(5, 4, 6);
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.5, putar: 205 }), 1.6);
    return G.render([
      ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: G.PASANGAN, busur: [1, 2, 3] }),
      ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: G.PASANGAN, busur: [1, 2, 3] }),
    ], { lebar: 420, tinggi: 270, pad: 30, label: 'Dua segitiga sebangun. Segitiga kedua lebih besar dan diputar, tetapi warna sisi pasangannya sama.' });
  }

  window.Halaman = window.Halaman || {};
  window.Halaman.beranda = function (akar, ctx) {
    const progres = ctx.progres();
    const belajar = ctx.MODUL.filter((m) => m.no);
    const sudahMulai = belajar.some((m) => progres[m.id]);
    const berikut = belajar.find((m) => !progres[m.id]);

    akar.append(
      el('section', { class: 'sambutan' },
        el('div', { class: 'sambutan-teks' },
          el('p', { class: 'label-kecil' }, 'Matematika SMP · Kesebangunan'),
          el('h1', null, 'Belajar sebangun, ', el('span', { class: 'sorot' }, 'satu langkah'), ' demi satu langkah.'),
          el('p', { class: 'lead' }, 'Bangun datar dan segitiga sebangun, dengan gambar berwarna yang bisa kamu putar, geser, dan pisahkan.'),
          el('div', { class: 'deret-tombol' },
            berikut
              ? el('a', { class: 'tombol besar', href: '#/' + berikut.id }, sudahMulai ? `Lanjutkan: ${berikut.judul} →` : 'Mulai belajar →')
              : el('a', { class: 'tombol besar', href: '#/latihan' }, 'Semua modul selesai. Latihan lagi →'),
            el('a', { class: 'tombol sekunder', href: '#/ringkasan' }, 'Lihat ringkasan'))),
        el('figure', { class: 'sambutan-gambar', html: gambarSambutan() + '<figcaption>Warna sama = pasangan sisi seletak, walau diputar.</figcaption>' })),

      el('h2', { class: 'judul-bagian' }, 'Peta belajar'),
      el('ol', { class: 'peta' }, belajar.map((m) =>
        el('li', null, el('a', { href: '#/' + m.id, class: 'kartu-peta' + (progres[m.id] ? ' selesai' : '') + (berikut && berikut.id === m.id ? ' berikut' : '') },
          el('span', { class: 'no', 'aria-hidden': 'true' }, progres[m.id] ? '✓' : String(m.no)),
          el('span', { class: 'teks-peta' }, el('b', null, m.judul), el('small', null, m.ket)),
          progres[m.id] ? el('span', { class: 'sr' }, '(selesai)') : null)))),

      el('section', { class: 'kartu tips' },
        el('h2', null, 'Cara belajar di sini'),
        el('ul', { class: 'daftar-tips' },
          el('li', { html: '<b>Satu langkah, satu ide.</b> Tekan <i>Lanjut</i> kalau sudah paham. Tidak perlu buru-buru.' }),
          el('li', { html: '<b>Warna sama = sisi seletak.</b> <span class="c0">Biru</span> dengan biru, <span class="c1">ungu</span> dengan ungu.' }),
          el('li', { html: '<b>Bingung?</b> Buka tombol <i>Kenapa begitu?</i>, lihat petunjuk, atau buka Ringkasan.' }),
          el('li', { html: '<b>Gambar ulang</b> bangunnya di Papan Sketsa supaya lebih ingat.' })))
    );
  };
})();
