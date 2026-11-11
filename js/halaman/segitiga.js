/* Modul 4 — Segitiga sebangun: syarat, bentuk A (garis sejajar), bentuk X, garis tinggi. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const L = Logika, G = Gambar, GK = GambarKhusus, W = G.WARNA, F = L.formatAngka;
  const chip = (teks, i) => `<b class="w${i}">${teks}</b>`;
  const pec = (a, b) => `<span class="pec"><span>${a}</span><span>${b}</span></span>`;

  // ---------- Langkah 1: tiga syarat ----------
  function langkahSyarat(isi) {
    const rad = Math.PI / 180;
    // segitiga bersudut 60°, 50°, 70°
    const sg = L.segitigaDariSisi(6 * Math.sin(60 * rad), 6 * Math.sin(50 * rad), 6 * Math.sin(70 * rad));
    const sg2 = G.letakkanKanan(sg, G.transformasi(sg, { skala: 1.4, putar: 15 }), 1.5);
    const abc = L.segitigaDariSisi(5, 4, 6);
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.5 }), 1.5);
    const SYARAT = {
      sdsd: {
        judul: 'Sd-Sd',
        nama: 'Sudut-sudut',
        teks: '<b>Dua pasang sudut</b> sama besar.',
        gambar: () => G.render([
          ...G.bangun(sg, { nama: ['A', 'B', 'C'], busur: [1, 2, 0], teksSudut: ['60°', '50°'] }),
          ...G.bangun(sg2, { nama: ['P', 'Q', 'R'], busur: [1, 2, 0], teksSudut: ['60°', '50°'] }),
        ], { lebar: 480, tinggi: 240, label: 'Dua segitiga dengan dua pasang sudut sama' }),
        tambahan: '<div class="rumus">∠C = 180° − 60° − 50° = 70° = ∠R</div><p class="catatan">Sudut ketiga pasti sama, karena jumlah sudut segitiga selalu 180°.</p>',
      },
      sss: {
        judul: 'S-S-S',
        nama: 'Sisi-sisi-sisi',
        teks: '<b>Ketiga pasang sisi</b> sebanding.',
        gambar: () => G.render([
          ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: G.PASANGAN, labelSisi: ['6', '5', '4'] }),
          ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: G.PASANGAN, labelSisi: ['9', '7,5', '6'] }),
        ], { lebar: 480, tinggi: 240, label: 'Dua segitiga dengan tiga pasang sisi sebanding' }),
        tambahan: `<div class="rumus">${pec(chip('9', 0), chip('6', 0))} = ${pec(chip('7,5', 1), chip('5', 1))} = ${pec(chip('6', 2), chip('4', 2))} = 1,5</div>`,
      },
      sdsds: {
        judul: 'S-Sd-S',
        nama: 'Sisi-sudut-sisi',
        teks: '<b>Dua pasang sisi</b> sebanding dan <b>sudut apitnya</b> sama besar.',
        gambar: () => G.render([
          ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: [G.PASANGAN[0], W.garis, G.PASANGAN[2]], busur: [1, 0, 0], labelSisi: ['6', null, '4'] }),
          ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: [G.PASANGAN[0], W.garis, G.PASANGAN[2]], busur: [1, 0, 0], labelSisi: ['9', null, '6'] }),
        ], { lebar: 480, tinggi: 240, label: 'Dua segitiga dengan dua sisi sebanding dan sudut apit sama' }),
        tambahan: `<div class="rumus">${pec(chip('9', 0), chip('6', 0))} = ${pec(chip('6', 2), chip('4', 2))} = 1,5 dan ∠A = ∠P</div><p class="catatan">Sudut apit = sudut yang berada di antara kedua sisi itu.</p>`,
      },
    };
    const kepala = el('div', { class: 'kepala-syarat' });
    const wadah = el('div', { class: 'wadah-gambar' });
    const tambahan = el('div');
    const seg = UI.segmen(Object.keys(SYARAT).map((k) => [k, SYARAT[k].judul]), 'sdsd', tampil, 'Pilih syarat');
    isi.append(seg.elemen, kepala, wadah, tambahan);
    function tampil(id) {
      const s = SYARAT[id];
      kepala.innerHTML = `<p class="label-kecil">${s.nama}</p><p class="teks-utama">${s.teks}</p>`;
      wadah.innerHTML = s.gambar();
      tambahan.innerHTML = s.tambahan;
    }
    tampil('sdsd');
  }

  // ---------- Langkah 2: bentuk A ----------
  function langkahBentukA(isi, h) {
    const A = [3, 6], B = [0, 0], C = [8, 0];
    let t = 0.6, pisah = 0, batal = null;
    const wadah = el('div', { class: 'wadah-gambar' });
    const slider = el('input', { type: 'range', min: '0.25', max: '0.8', step: '0.05', value: '0.6', 'aria-label': 'Posisi garis DE' });
    const rasio = el('div', { class: 'rumus', 'aria-live': 'polite' });
    const tPisah = tombol('Pisahkan segitiganya', () => {
      if (batal) batal();
      const dari = pisah, ke = pisah > 0.5 ? 0 : 1;
      tPisah.textContent = ke ? 'Gabungkan lagi' : 'Pisahkan segitiganya';
      batal = UI.animasi(900, (e) => { pisah = dari + (ke - dari) * e; gambar(); });
    });
    h.bersih(() => batal && batal());
    slider.addEventListener('input', () => { t = parseFloat(slider.value); gambar(); });
    isi.append(wadah,
      el('div', { class: 'kontrol' }, el('label', { class: 'slider' }, el('span', null, 'Geser DE:'), slider)),
      el('div', { class: 'deret-tombol' }, tPisah),
      rasio,
      el('p', { class: 'awas' }, 'Awas! Bandingkan AD dengan AB (sisi utuh), bukan dengan DB.'));
    function gambar() {
      const r = GK.figBersarang({ A, B, C, t, pisah, sudut: pisah > 0 });
      wadah.innerHTML = G.render(r.items, { lebar: 480, tinggi: 290, batas: r.batas, label: 'Segitiga ABC dengan DE sejajar BC' });
      rasio.innerHTML = `${pec(chip('AD', 0), chip('AB', 0))} = ${pec(chip('AE', 1), chip('AC', 1))} = ${pec(chip('DE', 2), chip('BC', 2))} = <b>${F(t)}</b>`;
    }
    gambar();
  }

  // ---------- Langkah 3: bentuk X ----------
  function langkahBentukX(isi, h) {
    const AB = 6, AE = 4, BE = 5, k = 1.5;
    const sg = L.segitigaDariSisi(BE, AE, AB);
    const A = [0, 0], B = [AB, 0], E = [sg[2][0], -sg[2][1]];
    let pisah = 0, batal = null;
    const wadah = el('div', { class: 'wadah-gambar' });
    const label = { AB: '6', AE: '4', BE: '5', CD: '9', CE: '6', DE: '7,5' };
    const tPisah = tombol('Putar 180° & pisahkan', () => {
      if (batal) batal();
      const dari = pisah, ke = pisah > 0.5 ? 0 : 1;
      tPisah.textContent = ke ? 'Kembalikan' : 'Putar 180° & pisahkan';
      batal = UI.animasi(1100, (e) => { pisah = dari + (ke - dari) * e; gambar(); });
    });
    h.bersih(() => batal && batal());
    isi.append(wadah, el('div', { class: 'deret-tombol' }, tPisah),
      el('div', { class: 'rumus', html: `${pec(chip('CD', 0), chip('AB', 0))} = ${pec(chip('CE', 1), chip('AE', 1))} = ${pec(chip('DE', 2), chip('BE', 2))}` }),
      el('div', { class: 'rumus', html: `${pec(chip('9', 0), chip('6', 0))} = ${pec(chip('6', 1), chip('4', 1))} = ${pec(chip('7,5', 2), chip('5', 2))} = 1,5` }));
    function gambar() {
      const r = GK.figX({ A, B, E, k, pisah, label, sudut: true });
      wadah.innerHTML = G.render(r.items, { lebar: 480, tinggi: 300, batas: r.batas, label: 'Dua segitiga berhadapan membentuk huruf X' });
    }
    gambar();
  }

  // ---------- Langkah 4: garis tinggi ----------
  function langkahGarisTinggi(isi) {
    const p = 16, q = 9; // BC = 25, AD = 12, AB = 20, AC = 15
    const wadah = el('div', { class: 'wadah-gambar' });
    const seg = UI.segmen([['gabung', 'Gabung'], ['tiga', 'Pisah jadi 3']], 'gabung', tampil, 'Tampilan');
    const rumusRumus = el('div', { class: 'daftar-rumus' });
    isi.append(seg.elemen, wadah, rumusRumus);
    function tampil(mode) {
      const susun = window.innerWidth < 560;
      const r = mode === 'gabung'
        ? GK.figTinggi({ p, q, mode, label: { BD: '16', DC: '9', AD: '12', AB: '20', AC: '15' } })
        : GK.figTinggi({ p, q, mode, susun, label: { abc: ['20', '25', '15'], dba: ['16', '20', '12'], dac: ['12', '15', '9'] } });
      wadah.classList.remove('ganti');
      void wadah.offsetWidth;
      wadah.classList.add('ganti');
      wadah.innerHTML = G.render(r.items, { lebar: 480, tinggi: mode !== 'gabung' && susun ? 400 : 260, label: 'Segitiga siku-siku dengan garis tinggi' });
    }
    rumusRumus.innerHTML = `
      <div class="rumus"><span>AD² = BD × DC</span><span class="redup">→ 12² = 16 × 9 = 144 ✓</span></div>
      <div class="rumus"><span>AB² = BD × BC</span><span class="redup">→ 20² = 16 × 25 = 400 ✓</span></div>
      <div class="rumus"><span>AC² = CD × CB</span><span class="redup">→ 15² = 9 × 25 = 225 ✓</span></div>`;
    tampil('gabung');
  }

  window.Halaman.segitiga = function (akar, ctx) {
    UI.modulLangkah(akar, {
      id: 'segitiga', nomor: 4, judul: 'Segitiga sebangun', ctx,
      langkah: [
        {
          judul: 'Syarat segitiga sebangun',
          teks: 'Untuk segitiga, <b>cukup salah satu</b> syarat ini.',
          render: langkahSyarat,
          kenapa: 'Pada segitiga, kalau sudutnya sama pasti sisinya sebanding, dan sebaliknya. Itu sebabnya satu syarat sudah cukup. Pada bangun lain (misalnya persegi panjang), keduanya harus dicek.',
        },
        {
          judul: 'Garis sejajar (bentuk A)',
          teks: 'Jika DE ∥ BC, maka ΔADE ∼ ΔABC. Pisahkan supaya pasangannya terlihat.',
          render: langkahBentukA,
          kenapa: '∠A dimiliki bersama. ∠ADE = ∠ABC dan ∠AED = ∠ACB karena sudut sehadap pada garis sejajar.',
        },
        {
          judul: 'Segitiga berhadapan (bentuk X)',
          teks: 'Jika AB ∥ DC, maka ΔABE ∼ ΔCDE. Segitiga bawah adalah segitiga atas yang <b>diputar 180°</b>.',
          render: langkahBentukX,
          kenapa: '∠AEB = ∠CED (bertolak belakang), ∠BAE = ∠DCE dan ∠ABE = ∠CDE (dalam berseberangan).',
        },
        {
          judul: 'Tantangan: garis tinggi',
          teks: 'Pada ΔABC siku-siku di A, garis tinggi AD membuat <b>tiga segitiga sebangun</b>.',
          render: langkahGarisTinggi,
          kenapa: 'Semuanya siku-siku dan punya sudut lancip yang sama. Bentuk “Pisah jadi 3” memperlihatkan ketiganya dalam posisi yang sama.',
        },
      ],
    });
  };
})();
