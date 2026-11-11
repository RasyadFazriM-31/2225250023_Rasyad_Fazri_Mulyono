/* Modul 3 — Sisi seletak & rotasi: warna pasangan, putar bangun, 4 jurus, permainan pasangkan sisi. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const L = Logika, G = Gambar, W = G.WARNA, F = L.formatAngka;
  const { tambah, kurang, kali, pusat, putar, batasDari, gabungBatas } = G;

  const namaSisi = (nama, i) => nama[i] + nama[(i + 1) % nama.length];
  const chip = (teks, i) => `<b class="w${i}">${teks}</b>`;

  // ---------- Langkah 1: warna sama = seletak ----------
  function langkahWarna(isi) {
    const abc = L.segitigaDariSisi(5, 4, 6);
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.5 }), 1.5);
    let warna = true;
    const wadah = el('div', { class: 'wadah-gambar' });
    const daftar = el('ul', { class: 'daftar-pasangan' });
    isi.append(wadah, el('div', { class: 'kontrol' }, UI.sakelar('Tampilkan warna', true, (v) => { warna = v; gambar(); })), daftar);
    function gambar() {
      const w = warna ? G.PASANGAN : [W.garis, W.garis, W.garis];
      wadah.innerHTML = G.render([
        ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: w, busur: [1, 2, 3], labelSisi: ['6', '5', '4'] }),
        ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: w, busur: [1, 2, 3], labelSisi: ['9', '7,5', '6'] }),
      ], { lebar: 480, tinggi: 250, label: 'Segitiga ABC dan PQR dengan sisi seletak berwarna sama' });
      daftar.classList.toggle('tanpa-warna', !warna);
    }
    daftar.innerHTML = [['AB', 'PQ', '6', '9'], ['BC', 'QR', '5', '7,5'], ['CA', 'RP', '4', '6']]
      .map(([a, b, x, y], i) => `<li>${chip(a, i)} ↔ ${chip(b, i)} <span class="redup">${x} → ${y}</span></li>`).join('');
    gambar();
  }

  // ---------- Langkah 2: putar bangunnya ----------
  const BENTUK = {
    segitiga: { judul: 'Segitiga', pts: () => L.segitigaDariSisi(5, 4, 6), A: ['A', 'B', 'C'], B: ['P', 'Q', 'R'], busur: [1, 2, 3] },
    pp: { judul: 'Persegi panjang', pts: () => [[0, 0], [5, 0], [5, 3], [0, 3]], A: ['A', 'B', 'C', 'D'], B: ['P', 'Q', 'R', 'S'], busur: ['siku', 'siku', 'siku', 'siku'] },
    persegi: { judul: 'Persegi', pts: () => [[0, 0], [4, 0], [4, 4], [0, 4]], A: ['A', 'B', 'C', 'D'], B: ['P', 'Q', 'R', 'S'], busur: ['siku', 'siku', 'siku', 'siku'] },
    trapesium: { judul: 'Trapesium', pts: () => [[0, 0], [7, 0], [5, 3], [1, 3]], A: ['A', 'B', 'C', 'D'], B: ['P', 'Q', 'R', 'S'], busur: [1, 2, 3, 4] },
  };
  const SKALA = 1.5;

  function langkahPutar(isi, h) {
    const st = { bentuk: 'segitiga', sudut: 0, cx: 1, warna: true, tanda: true, panjang: false };
    let batal = null;
    const wadah = el('div', { class: 'wadah-gambar' });
    const slider = el('input', { type: 'range', min: '0', max: '360', step: '5', value: '0', 'aria-label': 'Besar putaran bangun kanan (derajat)' });
    const keluaran = el('output', { class: 'nilai-slider' }, '0°');
    const catatan = el('div', { class: 'umpan info', hidden: true, role: 'status' });
    const daftar = el('ul', { class: 'daftar-pasangan' });
    const seg = UI.segmen(Object.keys(BENTUK).map((k) => [k, BENTUK[k].judul]), st.bentuk, (id) => { st.bentuk = id; gambar(); }, 'Pilih bangun');

    function animasikan(keSudut, keCx) {
      if (batal) batal();
      const dari = st.sudut, dariCx = st.cx;
      batal = UI.animasi(700, (e) => {
        st.sudut = dari + (keSudut - dari) * e;
        st.cx = dariCx + (keCx - dariCx) * e;
        gambar();
      }, () => {
        st.sudut = ((Math.round(keSudut) % 360) + 360) % 360;
        gambar();
      });
    }
    h.bersih(() => batal && batal());

    slider.addEventListener('input', () => {
      if (batal) batal();
      st.sudut = parseFloat(slider.value);
      gambar();
    });

    isi.append(
      seg.elemen, wadah,
      el('div', { class: 'kontrol' },
        el('label', { class: 'slider' }, el('span', null, 'Putar:'), keluaran, slider)),
      el('div', { class: 'deret-tombol' },
        tombol('↻ Putar 90°', () => animasikan(st.sudut + 90, st.cx), 'sekunder'),
        tombol('⇋ Cerminkan', () => animasikan(st.sudut, st.cx > 0 ? -1 : 1), 'sekunder'),
        tombol('Samakan posisi', () => animasikan(st.sudut > 180 ? 360 : 0, 1))),
      el('div', { class: 'kontrol sakelar-deret' },
        UI.sakelar('Warna sisi', true, (v) => { st.warna = v; gambar(); }),
        UI.sakelar('Tanda sudut', true, (v) => { st.tanda = v; gambar(); }),
        UI.sakelar('Panjang sisi', false, (v) => { st.panjang = v; gambar(); })),
      catatan, daftar);

    function gambar() {
      const b = BENTUK[st.bentuk];
      const ptsA = b.pts();
      const n = ptsA.length;
      const c = pusat(ptsA);
      const R = Math.max(...ptsA.map((p) => G.panjang(kurang(p, c)))) * SKALA;
      const bA = batasDari(ptsA);
      const pusatB = [bA[2] + 1.6 + R, (bA[1] + bA[3]) / 2];
      const ptsB = ptsA.map((p) => {
        let d = kurang(p, c);
        d = [d[0] * st.cx * SKALA, d[1] * SKALA];
        return tambah(pusatB, putar(d, st.sudut));
      });
      const warna = st.warna ? G.PASANGAN.slice(0, n) : Array(n).fill(W.garis);
      const pjg = L.panjangSisi(ptsA);
      wadah.innerHTML = G.render([
        ...G.bangun(ptsA, { nama: b.A, warnaSisi: warna, busur: st.tanda ? b.busur : null, labelSisi: st.panjang ? pjg.map((v) => F(v, 1)) : null }),
        ...G.bangun(ptsB, { nama: b.B, warnaSisi: warna, busur: st.tanda && Math.abs(st.cx) > 0.3 ? b.busur : null, labelSisi: st.panjang ? pjg.map((v) => F(v * SKALA, 1)) : null }),
      ], { lebar: 480, tinggi: 300, batas: gabungBatas(bA, [pusatB[0] - R, pusatB[1] - R, pusatB[0] + R, pusatB[1] + R]), label: `${b.judul} kiri dan ${b.judul.toLowerCase()} kanan yang diputar ${Math.round(st.sudut)} derajat` });

      const sdt = ((Math.round(st.sudut) % 360) + 360) % 360;
      keluaran.textContent = sdt + '°' + (st.cx < 0 ? ' (dicerminkan)' : '');
      if (document.activeElement !== slider) slider.value = String(sdt);
      daftar.innerHTML = Array.from({ length: n }, (_, i) => `<li>${chip(namaSisi(b.A, i), i)} ↔ ${chip(namaSisi(b.B, i), i)}</li>`).join('');
      daftar.classList.toggle('tanpa-warna', !st.warna);
      const miring45 = Math.abs((sdt % 90) - 45) <= 10;
      if (st.bentuk === 'persegi' && miring45) {
        UI.umpan(catatan, 'info', 'Terlihat seperti belah ketupat? Sudutnya tetap 90°, jadi <b>tetap persegi</b>.');
      } else if (st.cx < 0) {
        UI.umpan(catatan, 'info', 'Dicerminkan pun tetap sebangun. Pasangan sisinya tidak berubah.');
      } else {
        catatan.hidden = true;
      }
    }
    gambar();
  }

  // ---------- Langkah 3: empat jurus ----------
  function langkahJurus(isi) {
    const abc = L.segitigaDariSisi(5, 4, 6); // AB=6, BC=5, CA=4
    const klm = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.5, putar: 200, cermin: true }), 2);
    const NA = ['A', 'B', 'C'], NB = ['L', 'M', 'K'];
    const pjgA = [6, 5, 4], pjgB = [9, 7.5, 6];
    const wadah = el('div', { class: 'wadah-gambar' });
    const penjelasan = el('div', { class: 'penjelasan-jurus' });
    const JURUS = [
      ['huruf', '1. Urutan huruf'],
      ['sudut', '2. Tanda sudut'],
      ['depan', '3. Di depan sudut'],
      ['panjang', '4. Urutan panjang'],
    ];
    const seg = UI.segmen(JURUS, 'huruf', tampil, 'Pilih jurus');
    isi.append(seg.elemen, wadah, penjelasan);

    function render(o) {
      wadah.innerHTML = G.render([
        ...G.bangun(abc, { nama: NA, warnaSisi: o.wA, busur: o.busur ? [1, 2, 3] : null, sorotSudut: o.sorot, labelSisi: o.panjang ? pjgA.map((v) => F(v)) : null }),
        ...G.bangun(klm, { nama: NB, warnaSisi: o.wB || o.wA, busur: o.busur ? [1, 2, 3] : null, sorotSudut: o.sorot, labelSisi: o.panjang ? pjgB.map((v) => F(v)) : null }),
      ], { lebar: 480, tinggi: 290, label: 'Segitiga ABC dan segitiga LMK yang diputar dan dicerminkan' });
    }
    const abu = [W.garis, W.garis, W.garis];

    function tampil(id) {
      penjelasan.innerHTML = '';
      if (id === 'huruf') {
        render({ wA: G.PASANGAN.slice(0, 3), busur: false });
        penjelasan.innerHTML = `<p>Kalau soal menulis <b>ΔABC ∼ ΔLMK</b>, huruf ke-1, ke-2, ke-3 saling berpasangan:</p>
          <div class="rumus">A↔L, B↔M, C↔K</div>
          <p>Jadi ${chip('AB', 0)} ↔ ${chip('LM', 0)}, ${chip('BC', 1)} ↔ ${chip('MK', 1)}, ${chip('CA', 2)} ↔ ${chip('KL', 2)}.</p>`;
      } else if (id === 'sudut') {
        render({ wA: abu, busur: true });
        penjelasan.innerHTML = `<p>Sudut dengan <b>jumlah busur sama</b> adalah pasangan:</p>
          <div class="rumus">∠A = ∠L (1) · ∠B = ∠M (2) · ∠C = ∠K (3)</div>
          <p>Sisi di antara dua sudut berpasangan juga berpasangan. AB ada di antara ∠A dan ∠B, maka pasangannya di antara ∠L dan ∠M, yaitu LM.</p>`;
      } else if (id === 'depan') {
        const tombolDeret = el('div', { class: 'deret-tombol' });
        const teks = el('p', { 'aria-live': 'polite' });
        penjelasan.append(el('p', null, 'Pilih sepasang sudut. Sisi di depannya juga berpasangan.'), tombolDeret, teks);
        const pilih = (i) => {
          const s = (i + 1) % 3; // sisi di depan titik i
          const w = abu.slice();
          w[s] = G.PASANGAN[s];
          const sorot = [false, false, false];
          sorot[i] = true;
          render({ wA: w, busur: true, sorot });
          teks.innerHTML = `Di depan ∠${NA[i]} ada ${chip(namaSisi(NA, s), s)}. Di depan ∠${NB[i]} ada ${chip(namaSisi(NB, s), s)}. Jadi ${chip(namaSisi(NA, s), s)} ↔ ${chip(namaSisi(NB, s), s)}.`;
          tombolDeret.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
        };
        [0, 1, 2].forEach((i) => tombolDeret.append(el('button', { type: 'button', class: 'tombol sekunder kecil', onclick: () => pilih(i) }, `∠${NA[i]} & ∠${NB[i]}`)));
        pilih(0);
      } else {
        render({ wA: G.PASANGAN.slice(0, 3), busur: false, panjang: true });
        const batang = (nama, pjg, maks) => {
          const urut = [0, 1, 2].sort((x, y) => pjg[x] - pjg[y]);
          return urut.map((i) => `<div class="batang-baris"><span class="batang-nama w${i}">${namaSisi(nama, i)}</span><span class="batang" style="width:${(pjg[i] / maks) * 100}%;background:${G.PASANGAN[i]}"></span><span class="batang-nilai">${F(pjg[i])}</span></div>`).join('');
        };
        penjelasan.innerHTML = `<p>Urutkan dari terpendek. <b>Terpendek ↔ terpendek, terpanjang ↔ terpanjang.</b></p>
          <div class="dua-kolom batang-wadah"><div><p class="label-kecil">ΔABC</p>${batang(NA, pjgA, 9)}</div><div><p class="label-kecil">ΔLMK</p>${batang(NB, pjgB, 9)}</div></div>`;
      }
    }
    tampil('huruf');
  }

  // ---------- Langkah 4: permainan pasangkan sisi ----------
  const TRAPESIUM = [[[0, 0], [7, 0], [5, 3], [1, 3]], [[0, 0], [6, 0], [4.5, 2.5], [-1, 2.5]]];

  function langkahPasangkan(isi) {
    let soal, pilihA = null, pilihB = null, cocok = new Set(), selesaiJml = 0, panjangTampil = false;
    const skor = el('p', { class: 'label-kecil skor' });
    const wadah = el('div', { class: 'wadah-gambar interaktif' });
    const chipA = el('div', { class: 'chip-sisi', role: 'group', 'aria-label': 'Sisi bangun kiri' });
    const chipB = el('div', { class: 'chip-sisi', role: 'group', 'aria-label': 'Sisi bangun kanan' });
    const fb = el('div', { class: 'umpan', hidden: true, role: 'status' });
    const tBaru = tombol('Bangun baru', () => { buatSoal(); gambar(); }, 'sekunder');
    isi.append(skor, wadah,
      el('div', { class: 'dua-kolom chip-kolom' }, el('div', null, el('p', { class: 'label-kecil' }, 'Bangun kiri'), chipA), el('div', null, el('p', { class: 'label-kecil' }, 'Bangun kanan'), chipB)),
      fb,
      el('div', { class: 'deret-tombol' }, tBaru, UI.sakelar('Tampilkan panjang sisi', false, (v) => { panjangTampil = v; gambar(); })));

    function buatSoal() {
      let ptsA, namaA, namaB, busur;
      if (Math.random() < 0.65) {
        const s = L.kocok(L.pilih(BankSoal.SET_SEGITIGA));
        ptsA = L.segitigaDariSisi(s[1], s[2], s[0]);
        namaA = ['A', 'B', 'C'];
        namaB = L.kocok(['K', 'L', 'M']);
        busur = [1, 2, 3];
      } else {
        ptsA = L.pilih(TRAPESIUM);
        namaA = ['A', 'B', 'C', 'D'];
        const H = ['K', 'L', 'M', 'N'], mulai = L.acakInt(0, 3), arah = Math.random() < 0.5 ? 1 : -1;
        namaB = [0, 1, 2, 3].map((i) => H[(((mulai + arah * i) % 4) + 4) % 4]);
        busur = [1, 2, 3, 4];
      }
      const ptsB = G.letakkanKanan(ptsA, G.transformasi(ptsA, {
        skala: L.pilih([1.25, 1.5, 2]), putar: L.pilih([60, 90, 120, 150, 180, 210, 240, 270, 300]), cermin: Math.random() < 0.5,
      }), 2);
      soal = { ptsA, ptsB, namaA, namaB, busur, n: ptsA.length };
      cocok = new Set();
      pilihA = pilihB = null;
      fb.hidden = true;
    }

    function gambar() {
      const n = soal.n;
      const wA = [], wB = [], tA = [], tB = [];
      for (let i = 0; i < n; i++) {
        wA[i] = cocok.has(i) ? G.PASANGAN[i] : pilihA === i ? W.pilih : W.garis;
        wB[i] = cocok.has(i) ? G.PASANGAN[i] : pilihB === i ? W.pilih : W.garis;
        tA[i] = pilihA === i ? 6 : cocok.has(i) ? 4 : 3.2;
        tB[i] = pilihB === i ? 6 : cocok.has(i) ? 4 : 3.2;
      }
      const pA = L.panjangSisi(soal.ptsA), pB = L.panjangSisi(soal.ptsB);
      wadah.innerHTML = G.render([
        ...G.bangun(soal.ptsA, { nama: soal.namaA, warnaSisi: wA, tebalSisi: tA, busur: soal.busur, id: 'a', klik: true, labelSisi: panjangTampil ? pA.map((v) => F(v, 1)) : null }),
        ...G.bangun(soal.ptsB, { nama: soal.namaB, warnaSisi: wB, tebalSisi: tB, busur: soal.busur, id: 'b', klik: true, labelSisi: panjangTampil ? pB.map((v) => F(v, 1)) : null }),
      ], { lebar: 480, tinggi: 300, interaktif: true, label: 'Ketuk satu sisi di bangun kiri, lalu pasangannya di bangun kanan' });

      const isiChip = (wadahChip, nama, pihak, terpilih) => {
        wadahChip.innerHTML = '';
        for (let i = 0; i < n; i++) {
          const sudah = cocok.has(i);
          wadahChip.append(el('button', {
            type: 'button',
            class: 'chip' + (sudah ? ` w-latar${i}` : ''),
            'aria-pressed': String(terpilih === i),
            disabled: sudah,
            onclick: () => pilihSisi(pihak, i),
          }, namaSisi(nama, i)));
        }
      };
      isiChip(chipA, soal.namaA, 'a', pilihA);
      isiChip(chipB, soal.namaB, 'b', pilihB);
      skor.textContent = `Bangun selesai: ${selesaiJml}  ·  Pasangan ketemu: ${cocok.size}/${n}`;
    }

    function pilihSisi(pihak, i) {
      if (cocok.has(i)) return;
      if (pihak === 'a') pilihA = pilihA === i ? null : i;
      else pilihB = pilihB === i ? null : i;
      if (pilihA != null && pilihB != null) {
        const sA = namaSisi(soal.namaA, pilihA), sB = namaSisi(soal.namaB, pilihB);
        if (pilihA === pilihB) {
          cocok.add(pilihA);
          if (cocok.size === soal.n) {
            selesaiJml++;
            UI.umpan(fb, 'benar', `Tepat! ${sA} ↔ ${sB}. <b>Semua pasangan ketemu.</b> Coba bangun baru.`);
          } else {
            UI.umpan(fb, 'benar', `Tepat! ${sA} ↔ ${sB}.`);
          }
        } else {
          UI.umpan(fb, 'salah', `${sA} dan ${sB} belum berpasangan. Lihat busur sudut di kedua ujung ${sA}.`);
        }
        pilihA = pilihB = null;
      }
      gambar();
    }

    wadah.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sisi]');
      if (!t) return;
      const id = t.getAttribute('data-sisi');
      pilihSisi(id[0], parseInt(id.slice(1), 10));
    });
    buatSoal();
    gambar();
  }

  window.Halaman.seletak = function (akar, ctx) {
    UI.modulLangkah(akar, {
      id: 'seletak', nomor: 3, judul: 'Sisi seletak & rotasi', ctx,
      langkah: [
        {
          judul: 'Warna sama = sisi seletak',
          teks: '<b>Sisi seletak</b> (bersesuaian) adalah sisi yang posisinya sama pada kedua bangun. Di sini, sisi seletak diberi warna yang sama.',
          render: langkahWarna,
        },
        {
          judul: 'Kalau bangunnya diputar?',
          teks: 'Putar bangun kanan. Warnanya ikut berputar, <b>pasangannya tetap sama</b>.',
          render: langkahPutar,
          kenapa: 'Memutar atau mencerminkan tidak mengubah bentuk dan ukuran. Yang berubah hanya posisinya. Jadi pasangan sisi dan sudutnya tetap.',
        },
        {
          judul: 'Empat jurus mencari sisi seletak',
          teks: 'Segitiga kanan diputar <i>dan</i> dicerminkan. Coba keempat jurus.',
          render: langkahJurus,
        },
        {
          judul: 'Permainan: pasangkan sisinya',
          teks: 'Ketuk satu sisi di bangun kiri, lalu pasangannya di bangun kanan.',
          render: langkahPasangkan,
          kenapa: 'Petunjuk: lihat jumlah busur sudut di kedua ujung sisi. Pasangannya punya busur yang sama di kedua ujungnya.',
        },
      ],
    });
  };
})();
