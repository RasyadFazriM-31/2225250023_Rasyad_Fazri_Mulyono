/*
 * soal.js
 * Bank soal dengan angka acak. Setiap pemanggilan menghasilkan soal dengan
 * POLA yang sama tetapi ANGKA berbeda ("ganti angka").
 *
 * Bentuk objek soal:
 *   tipe, judul, pertanyaan (HTML singkat), gambar(st) -> SVG,
 *   jenis: 'angka' | 'rasio' | 'pilihan', jawaban, isian {awalan, akhiran}, pilihan [],
 *   langkah: [{judul, isi, kenapa?, gambar?}], cek (HTML), kesalahanUmum [{nilai, pesan}],
 *   animasi (bool), bocor (warna membocorkan jawaban), data (untuk pengujian)
 */
(function (global) {
  'use strict';
  const L = global.Logika, G = global.Gambar, GK = global.GambarKhusus;
  const F = L.formatAngka, W = G.WARNA, P = G.PASANGAN;

  // ---------- potongan HTML ----------
  const sisi = (nama, i) => `<b class="w${i}">${nama}</b>`;
  const pec = (a, b) => `<span class="pec"><span>${a}</span><span>${b}</span></span>`;
  const rumus = (...bagian) => `<div class="rumus">${bagian.join(' ')}</div>`;
  const awas = (teks) => `<p class="awas">${teks}</p>`;
  const garisSemua = (n) => Array(n).fill(W.garis);
  const pakaiWarna = (st, warna) => (st && st.warna === false ? garisSemua(warna.length) : warna);
  // Kesalahan umum yang nilainya sama dengan jawaban atau dengan kesalahan lain dibuang
  const kesalahan = (daftar, jawaban) => daftar.filter((k, i) =>
    isFinite(k.nilai) && k.nilai > 0 && !L.samaDengan(k.nilai, jawaban) &&
    !daftar.slice(0, i).some((s) => L.samaDengan(s.nilai, k.nilai)));

  // Jarak antar dua segitiga, sebanding dengan ukurannya, agar label sisi tidak bertabrakan
  const celahSegitiga = (sisi, k) => Math.max(2.5, 0.22 * Math.max(...sisi) * Math.max(1, k));

  const PESAN_TAMBAH ='Sebangun artinya diperbesar/diperkecil (dikali), bukan ditambah. Pakai perbandingan.';
  const SET_SEGITIGA = [[4, 5, 6], [5, 6, 8], [6, 8, 9], [4, 6, 7], [5, 7, 8], [6, 7, 9], [3, 5, 6], [4, 7, 8], [6, 9, 12]];

  // =====================================================================
  // 1. Persegi panjang yang diputar 90°
  // =====================================================================
  function persegiPanjang() {
    let p, l, k, n = 0;
    do {
      [p, l] = L.pilih([[8, 4], [6, 4], [10, 4], [9, 6], [12, 8], [10, 6], [8, 6], [6, 3], [12, 4], [9, 3], [5, 2], [4, 3]]);
      k = L.pilih([0.5, 1.5, 2, 2.5, 3]);
      n++;
    } while (n < 200 && !(L.angkaRapi(l * k) && L.angkaRapi(p * k) && l * k >= 1 && p * k <= 30));
    const lk = l * k, x = p * k;
    const A = [0, 0], B = [p, 0], C = [p, l], D = [0, l];
    const gx = Math.ceil(p + 2 + lk);
    const Pp = [gx, 0], Q = [gx, x], R = [gx - lk, x], S = [gx - lk, 0];

    function gambar(st) {
      const w = pakaiWarna(st, [W.biru, W.ungu, W.biru, W.ungu]);
      return G.render([
        ...G.bangun([A, B, C, D], { nama: ['A', 'B', 'C', 'D'], warnaSisi: w, labelSisi: [F(p), F(l), null, null] }),
        ...G.bangun([Pp, Q, R, S], { nama: ['P', 'Q', 'R', 'S'], warnaSisi: w, labelSisi: ['x', F(lk), null, null] }),
      ], { lebar: 480, tinggi: 270, label: `Persegi panjang ABCD dan persegi panjang PQRS yang diputar` });
    }

    return {
      tipe: 'persegiPanjang', judul: 'Persegi panjang diputar',
      pertanyaan: 'ABCD sebangun dengan PQRS (PQRS diputar). Berapa panjang <b>PQ</b>?',
      gambar, jenis: 'angka', jawaban: x, isian: { awalan: 'PQ =', akhiran: 'cm' },
      langkah: [
        {
          judul: 'Pasangkan sisi seletak',
          isi: `Panjang ↔ panjang: ${sisi('AB', 0)} ↔ ${sisi('PQ', 0)}<br>Lebar ↔ lebar: ${sisi('BC', 1)} ↔ ${sisi('QR', 1)}`,
          kenapa: 'PQRS hanya diputar 90°. Sisi panjang tetap berpasangan dengan sisi panjang, sisi pendek dengan sisi pendek.',
        },
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi('PQ', 0), sisi('AB', 0)), '=', pec(sisi('QR', 1), sisi('BC', 1))) +
            rumus(pec('x', F(p)), '=', pec(F(lk), F(l))),
        },
        { judul: 'Kali silang', isi: rumus(`x × ${F(l)}`, '=', `${F(p)} × ${F(lk)}`) + rumus('x =', pec(F(p * lk), F(l))) },
        { judul: 'Hitung', isi: rumus(`x = <b>${F(x)}</b> cm`) },
      ],
      cek: `${pec('PQ', 'AB')} = ${pec(F(x), F(p))} = ${F(k)} dan ${pec('QR', 'BC')} = ${pec(F(lk), F(l))} = ${F(k)}. Hasilnya sama ✓`,
      kesalahanUmum: kesalahan([
        { nilai: (l * lk) / p, pesan: 'Pasangannya tertukar. Ingat: panjang ↔ panjang, lebar ↔ lebar.' },
        { nilai: p / k, pesan: 'Perbandingannya terbalik. Sisi PQRS di atas, sisi ABCD di bawah, untuk kedua pecahan.' },
        { nilai: p + (lk - l), pesan: PESAN_TAMBAH },
      ], x),
      data: { p, l, k, x, A: [A, B, C, D], B: [Pp, Q, R, S] },
    };
  }

  // =====================================================================
  // 2. Segitiga sebangun yang diputar / dicerminkan
  // =====================================================================
  function segitigaDiputar() {
    let s, k, n = 0;
    do {
      s = L.kocok(L.pilih(SET_SEGITIGA));
      k = L.pilih([0.5, 1.5, 2, 2.5, 3]);
      n++;
    } while (n < 200 && !s.every((v) => L.angkaRapi(v * k)));
    const [c, a, b] = s; // s = [AB, BC, CA]
    const abc = L.segitigaDariSisi(a, b, c);
    const sudutPutar = L.pilih([90, 120, 150, 180, 210, 240, 270]);
    const cermin = Math.random() < 0.5;
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: k, putar: sudutPutar, cermin }), celahSegitiga(s, k));
    const u = L.acakInt(0, 2);
    let kn;
    do kn = L.acakInt(0, 2); while (kn === u);
    const NA = ['AB', 'BC', 'CA'], NP = ['PQ', 'QR', 'RP'];
    const x = s[u] * k, diketahui = s[kn] * k;

    function gambar(st) {
      const w = pakaiWarna(st, [P[0], P[1], P[2]]);
      const labP = [null, null, null];
      labP[u] = 'x';
      labP[kn] = F(diketahui);
      return G.render([
        ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: w, busur: [1, 2, 3], labelSisi: s.map((v) => F(v)) }),
        ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: w, busur: [1, 2, 3], labelSisi: labP }),
      ], { lebar: 480, tinggi: 300, label: 'Segitiga ABC dan segitiga PQR yang posisinya diputar' });
    }

    const lainnya = [0, 1, 2].filter((j) => j !== u).map((j) => ({
      nilai: s[j] * k, pesan: 'Itu panjang pasangan sisi yang lain. Cek lagi lewat busur sudut di ujung-ujung sisi.',
    }));

    return {
      tipe: 'segitigaDiputar', judul: 'Segitiga diputar',
      pertanyaan: `ΔABC ∼ ΔPQR (lihat tanda sudutnya). Berapa panjang <b>${NP[u]}</b>?`,
      gambar, jenis: 'angka', jawaban: x, isian: { awalan: `${NP[u]} =`, akhiran: 'cm' },
      langkah: [
        { judul: 'Cocokkan sudutnya', isi: 'Lihat jumlah busur: ∠A ↔ ∠P (1 busur), ∠B ↔ ∠Q (2 busur), ∠C ↔ ∠R (3 busur).' },
        {
          judul: 'Pasangkan sisi seletak',
          isi: `${sisi('AB', 0)} ↔ ${sisi('PQ', 0)}, ${sisi('BC', 1)} ↔ ${sisi('QR', 1)}, ${sisi('CA', 2)} ↔ ${sisi('RP', 2)}`,
          kenapa: 'Sisi seletak menghubungkan sudut-sudut yang berpasangan. AB ada di antara ∠A dan ∠B, jadi pasangannya ada di antara ∠P dan ∠Q, yaitu PQ.',
        },
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi(NP[u], u), sisi(NA[u], u)), '=', pec(sisi(NP[kn], kn), sisi(NA[kn], kn))) +
            rumus(pec('x', F(s[u])), '=', pec(F(diketahui), F(s[kn]))),
        },
        {
          judul: 'Kali silang',
          isi: rumus(`x × ${F(s[kn])}`, '=', `${F(s[u])} × ${F(diketahui)}`) + rumus('x =', pec(F(s[u] * diketahui), F(s[kn]))),
        },
        { judul: 'Hitung', isi: rumus(`x = <b>${F(x)}</b> cm`) },
      ],
      cek: `${pec(NP[u], NA[u])} = ${pec(F(x), F(s[u]))} = ${F(k)} dan ${pec(NP[kn], NA[kn])} = ${pec(F(diketahui), F(s[kn]))} = ${F(k)}. Sama ✓`,
      kesalahanUmum: kesalahan([
        ...lainnya,
        { nilai: s[u] / k, pesan: 'Perbandingannya terbalik. Tulis sisi ΔPQR di atas dan sisi ΔABC di bawah pada kedua pecahan.' },
        { nilai: s[u] + (diketahui - s[kn]), pesan: PESAN_TAMBAH },
      ], x),
      data: { s, k, u, kn, x, A: abc, B: pqr },
    };
  }

  // =====================================================================
  // 3. Bentuk A: DE ∥ BC
  // =====================================================================
  function bersarang() {
    let AD, DB, DE, BC, n = 0;
    do {
      AD = L.pilih([2, 3, 4, 5, 6]);
      DB = L.pilih([1, 2, 3, 4]);
      DE = L.pilih([3, 4, 5, 6, 8]);
      BC = (DE * (AD + DB)) / AD;
      n++;
    } while (n < 300 && !(L.apakahBulat(BC) && BC <= 24));
    const AB = AD + DB, t = AD / AB;
    const ax = Math.min(0.4 * BC, 0.8 * AB);
    const A = [ax, Math.sqrt(AB * AB - ax * ax)], B = [0, 0], C = [BC, 0];

    function gambar(st) {
      st = st || {};
      const pisah = st.t != null ? st.t : st.pisah ? 1 : 0;
      const label = pisah > 0
        ? { AD: F(AD), DE: F(DE), AB: st.ab ? F(AB) : `${F(AD)} + ${F(DB)}`, BC: 'x' }
        : { AD: F(AD), DB: F(DB), DE: F(DE), BC: 'x' };
      const r = GK.figBersarang({ A, B, C, t, pisah, warna: st.warna !== false, label, sudut: pisah > 0 });
      return G.render(r.items, { lebar: 480, tinggi: 300, batas: r.batas, label: 'Segitiga ABC dengan garis DE sejajar BC' });
    }

    return {
      tipe: 'bersarang', judul: 'Garis sejajar (bentuk A)', animasi: true,
      pertanyaan: 'DE ∥ BC. Berapa panjang <b>BC</b>?',
      gambar, jenis: 'angka', jawaban: BC, isian: { awalan: 'BC =', akhiran: 'cm' },
      langkah: [
        {
          judul: 'Pisahkan jadi dua segitiga', gambar: { pisah: true },
          isi: 'Karena DE ∥ BC, ΔADE sebangun dengan ΔABC.',
          kenapa: '∠A dimiliki bersama. ∠ADE = ∠ABC dan ∠AED = ∠ACB karena sudut sehadap pada dua garis sejajar.',
        },
        { judul: 'Hitung sisi utuh AB', gambar: { pisah: true, ab: true }, isi: rumus(`AB = AD + DB = ${F(AD)} + ${F(DB)} = <b>${F(AB)}</b>`) },
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi('DE', 2), sisi('BC', 2)), '=', pec(sisi('AD', 0), sisi('AB', 0))) +
            rumus(pec(F(DE), 'x'), '=', pec(F(AD), F(AB))) + awas('Awas: pakai AB (sisi utuh), bukan DB!'),
        },
        { judul: 'Kali silang', isi: rumus(`${F(AD)} × x`, '=', `${F(DE)} × ${F(AB)}`) + rumus('x =', pec(F(DE * AB), F(AD))) },
        { judul: 'Hitung', isi: rumus(`x = <b>${F(BC)}</b> cm`) },
      ],
      cek: `${pec('AD', 'AB')} = ${pec(F(AD), F(AB))} ≈ ${F(t)} dan ${pec('DE', 'BC')} = ${pec(F(DE), F(BC))} ≈ ${F(DE / BC)}. Sama ✓`,
      kesalahanUmum: kesalahan([
        { nilai: (DE * DB) / AD, pesan: 'Sepertinya kamu memakai DB. Bandingkan dengan sisi utuh: AB = AD + DB.' },
        { nilai: (DE * AD) / DB, pesan: 'Hati-hati: ΔADE dibandingkan dengan ΔABC yang utuh, jadi pakai AB = AD + DB.' },
        { nilai: (DE * AD) / AB, pesan: 'Perbandingannya terbalik. BC (segitiga besar) berpasangan dengan AB (segitiga besar).' },
        { nilai: DE + DB, pesan: PESAN_TAMBAH },
      ], BC),
      data: { AD, DB, DE, BC, AB },
    };
  }

  // =====================================================================
  // 4. Bayangan (soal cerita singkat)
  // =====================================================================
  function bayangan() {
    let h1, s1, m, n = 0;
    do {
      h1 = L.pilih([1, 1.5, 2]);
      s1 = L.pilih([1.5, 2, 2.5, 3, 4]);
      m = L.pilih([2, 2.5, 3, 4, 5]);
      n++;
    } while (n < 200 && (h1 === s1 || !L.angkaRapi(h1 * m) || !L.angkaRapi(s1 * m)));
    const h2 = h1 * m, s2 = s1 * m;

    function gambar(st) {
      const r = GK.figBayangan({
        h1, s1, h2, s2, warna: !(st && st.warna === false),
        label: { h1: F(h1) + ' m', s1: F(s1) + ' m', h2: 'x', s2: F(s2) + ' m' },
      });
      return G.render(r.items, { lebar: 480, tinggi: 280, label: 'Tongkat dan tiang beserta bayangannya' });
    }

    return {
      tipe: 'bayangan', judul: 'Bayangan',
      pertanyaan: `Tongkat ${F(h1)} m punya bayangan ${F(s1)} m. Pada saat yang sama, bayangan tiang ${F(s2)} m. Berapa <b>tinggi tiang</b>?`,
      gambar, jenis: 'angka', jawaban: h2, isian: { awalan: 'tinggi =', akhiran: 'm' },
      langkah: [
        {
          judul: 'Kenali dua segitiga sebangun',
          isi: 'Sinar matahari datang dengan sudut yang sama, jadi segitiga tongkat dan segitiga tiang sebangun.',
          kenapa: 'Keduanya tegak lurus tanah (90°) dan sudut sinarnya sama. Dua pasang sudut sama, jadi sebangun.',
        },
        {
          judul: 'Pasangkan',
          isi: `${sisi('tinggi tiang', 0)} ↔ ${sisi('tinggi tongkat', 0)}<br>${sisi('bayangan tiang', 1)} ↔ ${sisi('bayangan tongkat', 1)}`,
        },
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi('tinggi tiang', 0), sisi('tinggi tongkat', 0)), '=', pec(sisi('bayangan tiang', 1), sisi('bayangan tongkat', 1))) +
            rumus(pec('x', F(h1)), '=', pec(F(s2), F(s1))),
        },
        { judul: 'Kali silang', isi: rumus(`x × ${F(s1)}`, '=', `${F(h1)} × ${F(s2)}`) + rumus('x =', pec(F(h1 * s2), F(s1))) },
        { judul: 'Hitung', isi: rumus(`x = <b>${F(h2)}</b> m`) },
      ],
      cek: `${pec(F(h2), F(h1))} = ${F(m)} dan ${pec(F(s2), F(s1))} = ${F(m)}. Sama ✓`,
      kesalahanUmum: kesalahan([
        { nilai: (s2 * s1) / h1, pesan: 'Pasangannya tertukar. Tinggi dengan tinggi, bayangan dengan bayangan.' },
        { nilai: (h1 * s1) / s2, pesan: 'Perbandingannya terbalik. Benda yang sama harus di posisi yang sama (atas-atas, bawah-bawah).' },
        { nilai: h1 + (s2 - s1), pesan: PESAN_TAMBAH },
      ], h2),
      data: { h1, s1, h2, s2 },
    };
  }

  // =====================================================================
  // 5. Bentuk X: AB ∥ DC
  // =====================================================================
  function modelX() {
    const SET = [[6, 4, 5], [5, 3, 4], [8, 6, 5], [6, 5, 4], [10, 6, 8]]; // [AB, AE, BE]
    let AB, AE, BE, k, n = 0;
    do {
      [AB, AE, BE] = L.pilih(SET);
      k = L.pilih([1.5, 2, 2.5, 3, 0.5]);
      n++;
    } while (n < 200 && ![AB * k, AE * k, BE * k].every(L.angkaRapi));
    const CD = AB * k, CE = AE * k, DE = BE * k;
    const tanya = L.pilih(['CD', 'CE']);
    const sg = L.segitigaDariSisi(BE, AE, AB);
    const A = [0, 0], B = [AB, 0], E = [sg[2][0], -sg[2][1]];
    const jawaban = tanya === 'CD' ? CD : CE;

    function gambar(st) {
      st = st || {};
      const pisah = st.t != null ? st.t : st.pisah ? 1 : 0;
      const label = tanya === 'CD'
        ? { AB: F(AB), AE: F(AE), CE: F(CE), CD: 'x' }
        : { AB: F(AB), AE: F(AE), CD: F(CD), CE: 'x' };
      const r = GK.figX({ A, B, E, k, pisah, warna: st.warna !== false, label, sudut: true });
      return G.render(r.items, { lebar: 480, tinggi: 300, batas: r.batas, label: 'Dua segitiga berhadapan membentuk huruf X' });
    }

    const langkahHitung = tanya === 'CD'
      ? [
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi('CD', 0), sisi('AB', 0)), '=', pec(sisi('CE', 1), sisi('AE', 1))) + rumus(pec('x', F(AB)), '=', pec(F(CE), F(AE))),
        },
        { judul: 'Kali silang', isi: rumus(`x × ${F(AE)}`, '=', `${F(AB)} × ${F(CE)}`) + rumus('x =', pec(F(AB * CE), F(AE))) },
      ]
      : [
        {
          judul: 'Tulis perbandingannya',
          isi: rumus(pec(sisi('CE', 1), sisi('AE', 1)), '=', pec(sisi('CD', 0), sisi('AB', 0))) + rumus(pec('x', F(AE)), '=', pec(F(CD), F(AB))),
        },
        { judul: 'Kali silang', isi: rumus(`x × ${F(AB)}`, '=', `${F(AE)} × ${F(CD)}`) + rumus('x =', pec(F(AE * CD), F(AB))) },
      ];

    return {
      tipe: 'modelX', judul: 'Bentuk X', animasi: true,
      pertanyaan: `AB ∥ DC. Berapa panjang <b>${tanya}</b>?`,
      gambar, jenis: 'angka', jawaban, isian: { awalan: `${tanya} =`, akhiran: 'cm' },
      langkah: [
        {
          judul: 'Lihat dua segitiganya', gambar: { pisah: true },
          isi: 'AB ∥ DC, jadi ΔABE ∼ ΔCDE. ΔCDE seperti ΔABE yang <b>diputar 180°</b>.',
          kenapa: '∠AEB = ∠CED (sudut bertolak belakang). ∠BAE = ∠DCE (sudut dalam berseberangan, karena AB ∥ DC).',
        },
        { judul: 'Pasangkan sisi seletak', isi: `${sisi('AB', 0)} ↔ ${sisi('CD', 0)}, ${sisi('AE', 1)} ↔ ${sisi('CE', 1)}, ${sisi('BE', 2)} ↔ ${sisi('DE', 2)}` },
        ...langkahHitung,
        { judul: 'Hitung', isi: rumus(`x = <b>${F(jawaban)}</b> cm`) },
      ],
      cek: `${pec('CD', 'AB')} = ${pec(F(CD), F(AB))} = ${F(k)} dan ${pec('CE', 'AE')} = ${pec(F(CE), F(AE))} = ${F(k)}. Sama ✓`,
      kesalahanUmum: kesalahan(tanya === 'CD'
        ? [
          { nilai: (AB * AE) / CE, pesan: 'Perbandingannya terbalik. Sisi ΔCDE di atas, sisi ΔABE di bawah.' },
          { nilai: DE, pesan: 'Itu panjang DE. Sisi yang seletak dengan AB adalah CD.' },
          { nilai: AB + (CE - AE), pesan: PESAN_TAMBAH },
        ]
        : [
          { nilai: (AE * AB) / CD, pesan: 'Perbandingannya terbalik. Sisi ΔCDE di atas, sisi ΔABE di bawah.' },
          { nilai: DE, pesan: 'Itu panjang DE. Sisi yang seletak dengan AE adalah CE.' },
          { nilai: AE + (CD - AB), pesan: PESAN_TAMBAH },
        ], jawaban),
      data: { AB, AE, BE, CD, CE, DE, k, tanya },
    };
  }

  // =====================================================================
  // 6. Segitiga siku-siku dengan garis tinggi (tantangan)
  // =====================================================================
  function garisTinggi() {
    const tanya = L.pilih(['AD', 'AB']);
    let p, q, x, n;
    if (tanya === 'AD') {
      [p, q] = L.pilih([[4, 9], [2, 8], [3, 12], [4, 16], [9, 16], [1, 4], [2, 18], [8, 18]]);
      if (Math.random() < 0.5) [p, q] = [q, p];
      n = p + q;
      x = Math.sqrt(p * q);
    } else {
      [p, n] = L.pilih([[4, 9], [2, 8], [3, 12], [4, 16], [1, 9], [9, 16], [2, 18], [4, 25]]);
      q = n - p;
      x = Math.sqrt(p * n);
    }

    function gambar(st) {
      st = st || {};
      const warna = st.warna !== false;
      let r;
      if (!st.pisah) {
        r = GK.figTinggi({ p, q, mode: 'gabung', warna, label: tanya === 'AD' ? { BD: F(p), DC: F(q), AD: 'x' } : { BD: F(p), DC: F(q), AB: 'x' } });
      } else if (tanya === 'AD') {
        r = GK.figTinggi({ p, q, mode: 'dbaDac', warna, label: { dba: [F(p), null, 'x'], dac: ['x', null, F(q)] } });
      } else {
        r = GK.figTinggi({ p, q, mode: 'abcDba', warna, label: { abc: ['x', st.bc ? F(n) : `${F(p)} + ${F(q)}`, null], dba: [F(p), 'x', null] } });
      }
      return G.render(r.items, { lebar: 480, tinggi: 280, label: 'Segitiga siku-siku ABC dengan garis tinggi AD' });
    }

    const langkah = tanya === 'AD'
      ? [
        {
          judul: 'Pisahkan jadi dua segitiga', gambar: { pisah: true },
          isi: 'Garis tinggi AD membagi ΔABC menjadi dua segitiga sebangun: ΔDBA dan ΔDAC.',
          kenapa: 'Keduanya siku-siku di D. ∠B + ∠BAD = 90° dan ∠BAD + ∠DAC = 90°, jadi ∠B = ∠DAC.',
        },
        { judul: 'Pasangkan sisi seletak', isi: `${sisi('BD', 0)} ↔ ${sisi('AD', 0)}, lalu ${sisi('AD', 1)} ↔ ${sisi('DC', 1)}` },
        { judul: 'Tulis perbandingannya', isi: rumus(pec(sisi('BD', 0), sisi('AD', 0)), '=', pec(sisi('AD', 1), sisi('DC', 1))) + rumus(pec(F(p), 'x'), '=', pec('x', F(q))) },
        { judul: 'Kali silang', isi: rumus('x × x', '=', `${F(p)} × ${F(q)}`) + rumus(`x² = ${F(p * q)}`) },
        { judul: 'Hitung', isi: rumus(`x = √${F(p * q)} = <b>${F(x)}</b> cm`) },
      ]
      : [
        {
          judul: 'Pisahkan dua segitiga', gambar: { pisah: true },
          isi: 'ΔABC dan ΔDBA sebangun: sama-sama siku-siku dan ∠B dimiliki bersama.',
        },
        { judul: 'Hitung sisi utuh BC', gambar: { pisah: true, bc: true }, isi: rumus(`BC = BD + DC = ${F(p)} + ${F(q)} = <b>${F(n)}</b>`) },
        { judul: 'Pasangkan sisi seletak', isi: `${sisi('AB', 0)} ↔ ${sisi('DB', 0)}, lalu ${sisi('BC', 2)} ↔ ${sisi('BA', 2)}` },
        { judul: 'Tulis perbandingannya', isi: rumus(pec(sisi('AB', 0), sisi('DB', 0)), '=', pec(sisi('BC', 2), sisi('BA', 2))) + rumus(pec('x', F(p)), '=', pec(F(n), 'x')) },
        { judul: 'Kali silang', isi: rumus('x × x', '=', `${F(p)} × ${F(n)}`) + rumus(`x² = ${F(p * n)}`) },
        { judul: 'Hitung', isi: rumus(`x = √${F(p * n)} = <b>${F(x)}</b> cm`) },
      ];

    const cek = tanya === 'AD'
      ? `${pec('BD', 'AD')} = ${pec(F(p), F(x))} ≈ ${F(p / x)} dan ${pec('AD', 'DC')} = ${pec(F(x), F(q))} ≈ ${F(x / q)}. Sama ✓`
      : `${pec('AB', 'DB')} = ${pec(F(x), F(p))} ≈ ${F(x / p)} dan ${pec('BC', 'BA')} = ${pec(F(n), F(x))} ≈ ${F(n / x)}. Sama ✓`;

    return {
      tipe: 'garisTinggi', judul: 'Garis tinggi ★',
      pertanyaan: `ΔABC siku-siku di A dan AD ⊥ BC. Berapa panjang <b>${tanya}</b>?`,
      gambar, jenis: 'angka', jawaban: x, isian: { awalan: `${tanya} =`, akhiran: 'cm' },
      langkah, cek,
      kesalahanUmum: kesalahan(tanya === 'AD'
        ? [{ nilai: p * q, pesan: 'Itu nilai x². Jangan lupa diakarkan.' }, { nilai: (p + q) / 2, pesan: 'Bukan rata-rata. Pakai perbandingan BD/AD = AD/DC.' }]
        : [{ nilai: p * n, pesan: 'Itu nilai x². Jangan lupa diakarkan.' }, { nilai: Math.sqrt(p * q), pesan: 'Itu panjang AD. Yang ditanya AB: pakai ΔABC dan ΔDBA.' }], x),
      data: { p, q, n, x, tanya },
    };
  }

  // =====================================================================
  // Latihan prasyarat
  // =====================================================================
  function sederhanakanRasio() {
    const g = L.pilih([2, 3, 4, 5, 6]);
    const [x, y] = L.pilih([[1, 2], [2, 3], [3, 4], [1, 3], [3, 5], [2, 5], [4, 5], [5, 6], [3, 2], [5, 3], [4, 3]]);
    const a = x * g, b = y * g;
    return {
      tipe: 'sederhanakanRasio', judul: 'Sederhanakan perbandingan',
      pertanyaan: `Sederhanakan <b>${a} : ${b}</b>`,
      jenis: 'rasio', jawaban: [x, y],
      langkah: [
        { judul: 'Cari FPB', isi: `FPB dari ${a} dan ${b} adalah <b>${g}</b>.` },
        { judul: 'Bagi keduanya', isi: rumus(`${a} ÷ ${g} = ${x}`) + rumus(`${b} ÷ ${g} = ${y}`) },
        { judul: 'Hasil', isi: rumus(`${a} : ${b} = <b>${x} : ${y}</b>`) },
      ],
      cek: `${x} dan ${y} tidak bisa dibagi lagi dengan angka yang sama (selain 1), jadi sudah paling sederhana ✓`,
      data: { a, b, x, y },
    };
  }

  function cariXPerbandingan() {
    let a, b, m, n = 0;
    do {
      a = L.acakInt(2, 9);
      b = L.acakInt(2, 9);
      m = L.pilih([2, 3, 4, 5, 1.5, 2.5]);
      n++;
    } while (n < 200 && (a === b || !L.angkaRapi(a * m) || !L.angkaRapi(b * m)));
    if (Math.random() < 0.5) {
      // a/b = c/x
      const c = a * m, x = b * m;
      return {
        tipe: 'cariXPerbandingan', judul: 'Kali silang',
        pertanyaan: `Tentukan x: ${pec(a, b)} = ${pec(F(c), 'x')}`,
        jenis: 'angka', jawaban: x, isian: { awalan: 'x =' },
        langkah: [
          { judul: 'Kali silang', isi: rumus(`${a} × x`, '=', `${b} × ${F(c)}`) },
          { judul: 'Bagi kedua ruas', isi: rumus('x =', pec(F(b * c), a)) },
          { judul: 'Hitung', isi: rumus(`x = <b>${F(x)}</b>`) },
        ],
        cek: `${pec(a, b)} ≈ ${F(a / b)} dan ${pec(F(c), F(x))} ≈ ${F(c / x)}. Sama ✓`,
        kesalahanUmum: kesalahan([{ nilai: (a * c) / b, pesan: 'Kali silangnya tertukar: kalikan pembilang kiri dengan penyebut kanan.' }], x),
        data: { a, b, c, x },
      };
    }
    // a/b = x/d
    const d = b * m, x = a * m;
    return {
      tipe: 'cariXPerbandingan', judul: 'Kali silang',
      pertanyaan: `Tentukan x: ${pec(a, b)} = ${pec('x', F(d))}`,
      jenis: 'angka', jawaban: x, isian: { awalan: 'x =' },
      langkah: [
        { judul: 'Kali silang', isi: rumus(`${b} × x`, '=', `${a} × ${F(d)}`) },
        { judul: 'Bagi kedua ruas', isi: rumus('x =', pec(F(a * d), b)) },
        { judul: 'Hitung', isi: rumus(`x = <b>${F(x)}</b>`) },
      ],
      cek: `${pec(a, b)} ≈ ${F(a / b)} dan ${pec(F(x), F(d))} ≈ ${F(x / d)}. Sama ✓`,
      kesalahanUmum: kesalahan([{ nilai: (b * d) / a, pesan: 'Kali silangnya tertukar: kalikan pembilang kiri dengan penyebut kanan.' }], x),
      data: { a, b, d, x },
    };
  }

  function senilaiAtauTidak() {
    let a, b, c, d, ya, n = 0;
    do {
      const [x, y] = L.pilih([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 3]]);
      const g1 = L.pilih([1, 2, 3]);
      let g2;
      do g2 = L.pilih([2, 3, 4, 5]); while (g2 === g1);
      ya = Math.random() < 0.5;
      a = x * g1; b = y * g1; c = x * g2;
      d = ya ? y * g2 : y * g2 + L.pilih([1, -1]);
      n++;
    } while (n < 200 && (d <= 0 || L.senilai(a, b, c, d) !== ya));
    const s1 = L.sederhanakan(a, b), s2 = L.sederhanakan(c, d);
    return {
      tipe: 'senilaiAtauTidak', judul: 'Senilai atau tidak?',
      pertanyaan: `Apakah <b>${a} : ${b}</b> senilai dengan <b>${c} : ${d}</b>?`,
      jenis: 'pilihan', pilihan: ['Senilai', 'Tidak senilai'], jawaban: ya ? 0 : 1,
      langkah: [
        { judul: 'Sederhanakan yang pertama', isi: rumus(`${a} : ${b} = ${s1[0]} : ${s1[1]}`) },
        { judul: 'Sederhanakan yang kedua', isi: rumus(`${c} : ${d} = ${s2[0]} : ${s2[1]}`) },
        { judul: 'Bandingkan', isi: ya ? 'Hasilnya sama, jadi <b>senilai</b>.' : 'Hasilnya berbeda, jadi <b>tidak senilai</b>.' },
      ],
      cek: `Cara lain, kali silang: ${a} × ${d} = ${a * d} dan ${b} × ${c} = ${b * c}. ${ya ? 'Sama, jadi senilai' : 'Berbeda, jadi tidak senilai'} ✓`,
      data: { a, b, c, d, ya },
    };
  }

  // =====================================================================
  // Sebangun atau tidak?
  // =====================================================================
  function sebangunAtauTidak(opsi) {
    opsi = opsi || {};
    const semua = ['ppSebangun', 'ppTambah', 'ppBeda', 'ketupat', 'sgSebangun', 'sgBeda'];
    const daftar = opsi.varian ? [].concat(opsi.varian) : semua;
    const varian = L.pilih(daftar);
    if (varian === 'ketupat') return soalKetupat();
    if (varian.indexOf('sg') === 0) return soalSegitigaSSS(varian === 'sgSebangun');
    return soalDuaPersegiPanjang(varian);
  }

  function soalDuaPersegiPanjang(varian) {
    let p, l, p2, l2, n = 0;
    do {
      [p, l] = L.pilih([[3, 2], [4, 2], [4, 3], [5, 2], [6, 4], [6, 3], [5, 3], [6, 2]]);
      const k = L.pilih([1.5, 2, 2.5, 3]);
      if (varian === 'ppSebangun') { p2 = p * k; l2 = l * k; }
      else if (varian === 'ppTambah') { const d = L.pilih([1, 2, 3]); p2 = p + d; l2 = l + d; }
      else { p2 = p * k; l2 = l * k + L.pilih([1, -1]); }
      n++;
    } while (n < 200 && !(L.angkaRapi(p2) && L.angkaRapi(l2) && l2 > 0 && p2 !== l2 && p2 <= 15 &&
      L.cekPersegiPanjang(p, l, p2, l2).sebangun === (varian === 'ppSebangun')));
    const panjang2 = Math.max(p2, l2), lebar2 = Math.min(p2, l2);
    const tegak = Math.random() < 0.5;
    const A = [[0, 0], [p, 0], [p, l], [0, l]];
    const x0 = p + 2;
    const B = tegak
      ? [[x0, 0], [x0 + lebar2, 0], [x0 + lebar2, panjang2], [x0, panjang2]]
      : [[x0, 0], [x0 + panjang2, 0], [x0 + panjang2, lebar2], [x0, lebar2]];
    const sebangun = varian === 'ppSebangun';
    const r1 = panjang2 / p, r2 = lebar2 / l;

    function gambar() {
      return G.render([
        ...G.bangun(A, { nama: ['A', 'B', 'C', 'D'], labelSisi: [F(p), F(l), null, null], warnaSisi: [W.biru, W.ungu, W.biru, W.ungu] }),
        ...G.bangun(B, {
          nama: ['P', 'Q', 'R', 'S'],
          labelSisi: tegak ? [F(lebar2), F(panjang2), null, null] : [F(panjang2), F(lebar2), null, null],
          warnaSisi: tegak ? [W.ungu, W.biru, W.ungu, W.biru] : [W.biru, W.ungu, W.biru, W.ungu],
        }),
      ], { lebar: 480, tinggi: 250, label: 'Dua persegi panjang' });
    }

    return {
      tipe: 'sebangunAtauTidak', judul: 'Sebangun atau tidak?',
      pertanyaan: 'Apakah kedua persegi panjang ini <b>sebangun</b>?',
      gambar, jenis: 'pilihan', pilihan: ['Sebangun', 'Tidak sebangun'], jawaban: sebangun ? 0 : 1,
      langkah: [
        { judul: 'Cek sudut', isi: 'Semua sudut persegi panjang 90°, jadi sudutnya pasti sama ✓' },
        {
          judul: 'Bandingkan sisinya',
          isi: rumus(`${sisi('panjang', 0)}: ${pec(F(panjang2), F(p))} = ${F(r1)}`) + rumus(`${sisi('lebar', 1)}: ${pec(F(lebar2), F(l))} = ${F(r2)}`),
        },
        {
          judul: 'Kesimpulan',
          isi: sebangun
            ? 'Perbandingannya sama, jadi <b>sebangun</b>.'
            : 'Perbandingannya berbeda, jadi <b>tidak sebangun</b>.' + (varian === 'ppTambah' ? ' Menambah panjang yang sama tidak membuat bangun sebangun.' : ''),
        },
      ],
      cek: sebangun ? `Faktor skalanya ${F(r1)}: semua sisi dikali ${F(r1)} ✓` : `${F(r1)} ≠ ${F(r2)}, jadi sisi-sisinya tidak sebanding ✓`,
      data: { p, l, p2, l2, sebangun },
    };
  }

  function soalKetupat() {
    let s, s2, n = 0;
    do {
      s = L.pilih([2, 3, 4]);
      s2 = s * L.pilih([1, 1.5, 2]);
      n++;
    } while (n < 50 && !L.angkaRapi(s2));
    const t = (s2 * Math.sqrt(3)) / 2;
    const A = [[0, 0], [s, 0], [s, s], [0, s]];
    const x0 = s + 2;
    const B = [[x0, 0], [x0 + s2, 0], [x0 + s2 * 1.5, t], [x0 + s2 / 2, t]];
    function gambar() {
      return G.render([
        ...G.bangun(A, { nama: ['A', 'B', 'C', 'D'], busur: ['siku', 0, 0, 0], teksSudut: ['90°'], labelSisi: [F(s), F(s), F(s), F(s)] }),
        ...G.bangun(B, { nama: ['P', 'Q', 'R', 'S'], busur: [1, 2, 0, 0], teksSudut: ['60°', '120°'], labelSisi: [F(s2), F(s2), F(s2), F(s2)] }),
      ], { lebar: 480, tinggi: 240, label: 'Persegi dan belah ketupat' });
    }
    return {
      tipe: 'sebangunAtauTidak', judul: 'Sebangun atau tidak?',
      pertanyaan: 'Persegi dan belah ketupat ini. Apakah keduanya <b>sebangun</b>?',
      gambar, jenis: 'pilihan', pilihan: ['Sebangun', 'Tidak sebangun'], jawaban: 1,
      langkah: [
        { judul: 'Bandingkan sisinya', isi: `Semua sisi sama panjang. Perbandingannya ${pec(F(s2), F(s))} = ${F(s2 / s)} untuk semua sisi ✓` },
        { judul: 'Cek sudutnya', isi: 'Sudut persegi 90°, sudut belah ketupat 60° dan 120°. Tidak sama ✗' },
        { judul: 'Kesimpulan', isi: 'Syarat sudut tidak terpenuhi, jadi <b>tidak sebangun</b>.' },
      ],
      cek: 'Sebangun harus memenuhi DUA syarat: sudut sama besar DAN sisi sebanding ✓',
      data: { s, s2 },
    };
  }

  function soalSegitigaSSS(sebangun) {
    let s1, s2, n = 0;
    do {
      s1 = L.pilih(SET_SEGITIGA);
      const k = L.pilih([1.5, 2, 0.5, 2.5]);
      s2 = s1.map((v) => v * k);
      if (!sebangun) {
        const i = L.acakInt(0, 2);
        s2 = s2.slice();
        s2[i] += L.pilih([1, -1, 2]);
      }
      n++;
    } while (n < 300 && !(s2.every(L.angkaRapi) && L.segitigaValid(s2[1], s2[2], s2[0]) && L.cekSSS(s1, s2).sebangun === sebangun && Math.max(...s2) <= 24));
    const urut2 = L.kocok(s2);
    const t1 = L.segitigaDariSisi(s1[1], s1[2], s1[0]);
    const t2raw = L.segitigaDariSisi(urut2[1], urut2[2], urut2[0]);
    const t2 = G.letakkanKanan(t1, G.transformasi(t2raw, { putar: L.pilih([0, 60, 120, 180, 240, 300]) }), celahSegitiga(s1, Math.max(...s2) / Math.max(...s1)));
    const hasil = L.cekSSS(s1, s2);
    const daftarRasio = hasil.urutA.map((a, i) => `${pec(F(hasil.urutB[i]), F(a))} = ${F(hasil.rasio[i])}`).join('<br>');
    function gambar() {
      return G.render([
        ...G.bangun(t1, { nama: ['A', 'B', 'C'], labelSisi: s1.map((v) => F(v)) }),
        ...G.bangun(t2, { nama: ['P', 'Q', 'R'], labelSisi: urut2.map((v) => F(v)) }),
      ], { lebar: 480, tinggi: 270, label: 'Dua segitiga dengan panjang sisi diketahui' });
    }
    return {
      tipe: 'sebangunAtauTidak', judul: 'Sebangun atau tidak?',
      pertanyaan: 'Apakah ΔABC dan ΔPQR <b>sebangun</b>?',
      gambar, jenis: 'pilihan', pilihan: ['Sebangun', 'Tidak sebangun'], jawaban: sebangun ? 0 : 1,
      langkah: [
        {
          judul: 'Urutkan sisi dari terpendek',
          isi: rumus(`ΔABC: ${hasil.urutA.map((v) => F(v)).join(', ')}`) + rumus(`ΔPQR: ${hasil.urutB.map((v) => F(v)).join(', ')}`),
          kenapa: 'Terpendek berpasangan dengan terpendek, terpanjang dengan terpanjang.',
        },
        { judul: 'Bagi tiap pasangan', isi: `<div class="rumus kolom">${daftarRasio}</div>` },
        { judul: 'Kesimpulan', isi: sebangun ? 'Semua hasilnya sama, jadi <b>sebangun</b> (S-S-S).' : 'Hasilnya tidak sama semua, jadi <b>tidak sebangun</b>.' },
      ],
      cek: sebangun ? `Semua sisi dikali ${F(hasil.rasio[0])} ✓` : 'Satu pasang sisi saja yang tidak sebanding sudah cukup untuk "tidak sebangun" ✓',
      data: { s1, s2, sebangun },
    };
  }

  // =====================================================================
  // Menentukan sisi seletak (pilihan ganda)
  // =====================================================================
  function pilihSisiSeletak() {
    const s = L.kocok(L.pilih(SET_SEGITIGA));
    const [c, a, b] = s;
    const abc = L.segitigaDariSisi(a, b, c);
    const k = L.pilih([1.25, 1.5, 2]);
    const sudutPutar = L.pilih([60, 90, 120, 150, 180, 210, 240, 270, 300]);
    const cermin = Math.random() < 0.5;
    const klm = G.letakkanKanan(abc, G.transformasi(abc, { skala: k, putar: sudutPutar, cermin }), 2);
    const huruf = L.kocok(['K', 'L', 'M']);
    const u = L.acakInt(0, 2);
    const NA = ['AB', 'BC', 'CA'], NAMA = ['A', 'B', 'C'];
    const namaSisiB = (i) => [huruf[i], huruf[(i + 1) % 3]].sort().join('');
    const benar = namaSisiB(u);
    const pilihan = L.kocok([0, 1, 2].map(namaSisiB));
    const i0 = u, i1 = (u + 1) % 3;
    const peringkat = s.slice().sort((x, y) => x - y).indexOf(s[u]);
    const urutanKata = ['terpendek', 'tengah', 'terpanjang'][peringkat];

    function gambar(st) {
      st = st || {};
      const wA = garisSemua(3), wB = garisSemua(3);
      if (st.jawab) { wA[u] = P[0]; wB[u] = P[0]; }
      return G.render([
        ...G.bangun(abc, { nama: NAMA, warnaSisi: wA, busur: [1, 2, 3] }),
        ...G.bangun(klm, { nama: huruf, warnaSisi: wB, busur: [1, 2, 3] }),
      ], { lebar: 480, tinggi: 290, label: 'Segitiga ABC dan segitiga KLM yang diputar' });
    }

    return {
      tipe: 'pilihSisiSeletak', judul: 'Sisi seletak', bocor: true,
      pertanyaan: `Kedua segitiga sebangun. Sisi yang seletak dengan <b>${NA[u]}</b> adalah …`,
      gambar, jenis: 'pilihan', pilihan, jawaban: pilihan.indexOf(benar),
      langkah: [
        { judul: 'Lihat ujung-ujung sisinya', isi: `${NA[u]} menghubungkan ∠${NAMA[i0]} (${i0 + 1} busur) dan ∠${NAMA[i1]} (${i1 + 1} busur).` },
        { judul: 'Cari sudut yang sama di ΔKLM', isi: `∠${NAMA[i0]} ↔ ∠${huruf[i0]} dan ∠${NAMA[i1]} ↔ ∠${huruf[i1]} (jumlah busurnya sama).` },
        { judul: 'Jadi', isi: `Sisi seletaknya ada di antara ∠${huruf[i0]} dan ∠${huruf[i1]}, yaitu <b>${benar}</b>.` },
      ],
      cek: `Cek dengan urutan panjang: ${NA[u]} adalah sisi ${urutanKata} di ΔABC, dan ${benar} juga sisi ${urutanKata} di ΔKLM ✓`,
      data: { abc, klm, huruf, u, benar },
    };
  }

  // =====================================================================
  const GENERATOR = {
    persegiPanjang, segitigaDiputar, bersarang, bayangan, modelX, garisTinggi,
    sederhanakanRasio, cariXPerbandingan, senilaiAtauTidak, sebangunAtauTidak, pilihSisiSeletak,
  };

  function buat(tipe, opsi) {
    const g = GENERATOR[tipe];
    if (!g) throw new Error('Tipe soal tidak dikenal: ' + tipe);
    return g(opsi);
  }

  // Periksa jawaban siswa -> {benar, pesan}
  function periksa(soal, jawaban) {
    if (soal.jenis === 'pilihan') {
      return { benar: jawaban === soal.jawaban, pesan: jawaban === soal.jawaban ? '' : 'Belum tepat. Buka petunjuk untuk melihat caranya.' };
    }
    if (soal.jenis === 'rasio') {
      const [u, v] = jawaban;
      if (!isFinite(u) || !isFinite(v)) return { benar: false, pesan: 'Isi kedua kotak dengan angka.' };
      const [x, y] = soal.jawaban;
      if (L.senilai(u, v, x, y)) {
        if (L.apakahBulat(u) && L.apakahBulat(v) && L.fpb(u, v) === 1) return { benar: true };
        return { benar: false, pesan: 'Sudah senilai, tapi belum paling sederhana. Bagi lagi dengan FPB-nya.' };
      }
      return { benar: false, pesan: 'Belum tepat. Bagi kedua angka dengan FPB yang sama.' };
    }
    if (!isFinite(jawaban)) return { benar: false, pesan: 'Tulis jawabannya berupa angka, misalnya 7,5.' };
    if (L.samaDengan(jawaban, soal.jawaban)) return { benar: true };
    const k = (soal.kesalahanUmum || []).find((e) => L.samaDengan(jawaban, e.nilai));
    return { benar: false, pesan: k ? k.pesan : 'Belum tepat. Coba lagi, atau buka petunjuk.' };
  }

  global.BankSoal = { buat, periksa, GENERATOR: Object.keys(GENERATOR), SET_SEGITIGA };
})(window);
