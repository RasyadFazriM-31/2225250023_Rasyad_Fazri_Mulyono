/* Ringkasan: inti materi dalam satu layar, bisa dicetak. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const G = Gambar, GK = GambarKhusus, L = Logika;
  const chip = (teks, i) => `<b class="w${i}">${teks}</b>`;
  const pec = (a, b) => `<span class="pec"><span>${a}</span><span>${b}</span></span>`;

  function kartu(judul, isiHtml, svg) {
    return el('article', { class: 'kartu ringkas' },
      el('h2', null, judul),
      svg ? el('div', { class: 'wadah-gambar kecil', html: svg }) : null,
      el('div', { html: isiHtml }));
  }

  window.Halaman.ringkasan = function (akar) {
    const abc = L.segitigaDariSisi(5, 4, 6);
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.4, putar: 160 }), 1.4);
    const gSebangun = G.render([
      ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: G.PASANGAN, busur: [1, 2, 3] }),
      ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: G.PASANGAN, busur: [1, 2, 3] }),
    ], { lebar: 320, tinggi: 170, pad: 24, grid: false, label: 'Dua segitiga sebangun' });
    const fA = GK.figBersarang({ A: [3, 6], B: [0, 0], C: [8, 0], t: 0.55, label: {} });
    const gA = G.render(fA.items, { lebar: 320, tinggi: 170, pad: 22, grid: false, batas: null, label: 'Bentuk A' });
    const sg = L.segitigaDariSisi(5, 4, 6);
    const fX = GK.figX({ A: [0, 0], B: [6, 0], E: [sg[2][0], -sg[2][1]], k: 1.5, sudut: true });
    const gX = G.render(fX.items, { lebar: 320, tinggi: 170, pad: 22, grid: false, label: 'Bentuk X' });
    const fT = GK.figTinggi({ p: 16, q: 9, mode: 'gabung' });
    const gT = G.render(fT.items, { lebar: 320, tinggi: 150, pad: 24, grid: false, label: 'Segitiga siku-siku dengan garis tinggi' });

    akar.append(
      el('header', { class: 'kepala-modul baris-antara' },
        el('div', null, el('p', { class: 'label-kecil' }, 'Satu layar'), el('h1', null, 'Ringkasan')),
        tombol('Cetak', () => window.print(), 'sekunder kecil jangan-cetak')),
      el('div', { class: 'grid-ringkas' },
        kartu('Sebangun artinya…', `<ol class="rapat">
            <li>Sudut-sudut yang bersesuaian <b>sama besar</b>, dan</li>
            <li>Sisi-sisi yang bersesuaian <b>sebanding</b>.</li></ol>
            <p>Harus <b>keduanya</b>. Ditulis <b>ΔABC ∼ ΔPQR</b>.</p>`, gSebangun),
        kartu('Mencari sisi seletak', `<ol class="rapat">
            <li><b>Urutan huruf</b>: ΔABC ∼ ΔPQR → AB↔PQ, BC↔QR, CA↔RP.</li>
            <li><b>Tanda sudut</b>: jumlah busur sama = pasangan.</li>
            <li><b>Di depan sudut</b>: sisi di depan sudut yang sama berpasangan.</li>
            <li><b>Urutan panjang</b>: terpendek↔terpendek, terpanjang↔terpanjang.</li></ol>
            <p class="catatan">Diputar atau dicerminkan? Pasangannya tetap sama.</p>`),
        kartu('Segitiga sebangun jika (cukup satu)', `<ul class="rapat">
            <li><b>Sd-Sd</b>: dua pasang sudut sama besar.</li>
            <li><b>S-S-S</b>: tiga pasang sisi sebanding.</li>
            <li><b>S-Sd-S</b>: dua pasang sisi sebanding dan sudut apitnya sama.</li></ul>`),
        kartu('Langkah menghitung', `<ol class="rapat">
            <li>Pasangkan sisi seletak (pakai warna).</li>
            <li>Tulis perbandingan (bangun yang sama di posisi yang sama):
              <div class="rumus">${pec('sisi bangun 2', 'sisi bangun 1')} = ${pec('sisi bangun 2', 'sisi bangun 1')}</div></li>
            <li>Kali silang.</li>
            <li>Hitung x.</li>
            <li><b>Cek</b>: semua perbandingan harus sama.</li></ol>`),
        kartu('Garis sejajar (bentuk A)', `<p>DE ∥ BC → ΔADE ∼ ΔABC</p>
            <div class="rumus">${pec(chip('AD', 0), chip('AB', 0))} = ${pec(chip('AE', 1), chip('AC', 1))} = ${pec(chip('DE', 2), chip('BC', 2))}</div>
            <p class="awas">Pakai AB (sisi utuh), bukan DB.</p>`, gA),
        kartu('Bentuk X', `<p>AB ∥ DC → ΔABE ∼ ΔCDE (diputar 180°)</p>
            <div class="rumus">${pec(chip('AB', 0), chip('CD', 0))} = ${pec(chip('AE', 1), chip('CE', 1))} = ${pec(chip('BE', 2), chip('DE', 2))}</div>`, gX),
        kartu('Siku-siku + garis tinggi', `<p>ΔABC siku-siku di A, AD ⊥ BC:</p>
            <div class="rumus kolom"><span>AD² = BD × DC</span><span>AB² = BD × BC</span><span>AC² = CD × CB</span></div>`, gT),
        kartu('Prasyarat', `<ul class="rapat">
            <li><b>Sederhanakan</b>: bagi dengan FPB. 5 : 10 = 1 : 2</li>
            <li><b>Kali silang</b>: ${pec('a', 'b')} = ${pec('c', 'd')} → a × d = b × c</li>
            <li>Sebangun itu <b>dikali</b> (diperbesar), bukan ditambah.</li></ul>`)));
  };
})();
