/*
 * logika.js
 * Fungsi matematika murni (tanpa tampilan): perbandingan, perkalian silang,
 * geometri segitiga, dan pengecekan kesebangunan.
 * Diuji di tests/uji-logika.html.
 */
(function (global) {
  'use strict';

  // ---------- angka ----------
  function bulatkan(x, desimal) {
    const f = Math.pow(10, desimal == null ? 6 : desimal);
    return Math.round(x * f) / f;
  }

  function apakahBulat(x) {
    return Math.abs(x - Math.round(x)) < 1e-9;
  }

  // Angka "rapi" untuk soal: positif dan bulat atau berakhiran ,5
  function angkaRapi(x) {
    return x > 0 && apakahBulat(x * 2);
  }

  // Faktor persekutuan terbesar (algoritma Euclid)
  function fpb(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const sisa = a % b;
      a = b;
      b = sisa;
    }
    return a;
  }

  // 1,5 : 2  ->  15 : 20 (supaya bisa dicari FPB-nya)
  function keBilanganBulat(a, b) {
    let f = 1;
    while (f < 1e6 && (!apakahBulat(a * f) || !apakahBulat(b * f))) f *= 10;
    return [Math.round(a * f), Math.round(b * f)];
  }

  // Bentuk paling sederhana dari a : b
  function sederhanakan(a, b) {
    const [x, y] = keBilanganBulat(a, b);
    const g = fpb(x, y) || 1;
    return [x / g, y / g];
  }

  // Apakah a : b senilai dengan c : d ?  (a x d = b x c)
  function senilai(a, b, c, d) {
    const kiri = a * d, kanan = b * c;
    return Math.abs(kiri - kanan) <= 1e-9 * Math.max(1, Math.abs(kiri), Math.abs(kanan));
  }

  // a/b = c/x  ->  x = (b x c) / a
  function cariX(a, b, c) {
    if (a === 0) return NaN;
    return (b * c) / a;
  }

  // Membaca jawaban siswa: "7,5", "7.5", "15/2", "7,5 cm", "x = 9"
  function parseAngka(teks) {
    if (typeof teks === 'number') return teks;
    if (typeof teks !== 'string') return NaN;
    let t = teks.trim().toLowerCase().replace(/\s+/g, '');
    t = t.replace(/^[a-z]{1,2}=/, '');
    t = t.replace(/(cm|mm|km|m|satuan|derajat|°)$/, '');
    if (!t) return NaN;
    const angka = (s) => {
      s = s.replace(',', '.');
      return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
    };
    if (t.indexOf('/') !== -1) {
      const bagian = t.split('/');
      if (bagian.length !== 2) return NaN;
      const p = angka(bagian[0]), q = angka(bagian[1]);
      return isNaN(p) || isNaN(q) || q === 0 ? NaN : p / q;
    }
    return angka(t);
  }

  // Jawaban dianggap benar bila selisihnya sangat kecil (untuk pembulatan)
  function samaDengan(x, y) {
    if (!isFinite(x) || !isFinite(y)) return false;
    return Math.abs(x - y) <= Math.max(0.011, Math.abs(y) * 0.005);
  }

  // 7.5 -> "7,5" ; 10 -> "10" ; 0.666 -> "0,67"
  function formatAngka(x, maksDesimal) {
    if (typeof x !== 'number' || !isFinite(x)) return '–';
    const d = maksDesimal == null ? 2 : maksDesimal;
    let s = bulatkan(x, d).toFixed(d);
    if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s.replace('.', ',');
  }

  // ---------- geometri ----------
  function jarak(p, q) {
    return Math.hypot(q[0] - p[0], q[1] - p[1]);
  }

  // Besar sudut di titik v (derajat), dibentuk oleh v->p dan v->q
  function besarSudut(v, p, q) {
    const a = [p[0] - v[0], p[1] - v[1]];
    const b = [q[0] - v[0], q[1] - v[1]];
    const cos = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]));
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  }

  function segitigaValid(a, b, c) {
    return a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a;
  }

  // Segitiga dari tiga sisi: a = BC, b = CA, c = AB.
  // Hasil: A(0,0), B(c,0), C di atas AB.
  function segitigaDariSisi(a, b, c) {
    if (!segitigaValid(a, b, c)) return null;
    const x = (b * b + c * c - a * a) / (2 * c);
    const y = Math.sqrt(Math.max(0, b * b - x * x));
    return [[0, 0], [c, 0], [x, y]];
  }

  // Panjang sisi ke-i = titik i -> titik i+1
  function panjangSisi(titik) {
    return titik.map((p, i) => jarak(p, titik[(i + 1) % titik.length]));
  }

  function sudutSudut(titik) {
    const n = titik.length;
    return titik.map((p, i) => besarSudut(p, titik[(i - 1 + n) % n], titik[(i + 1) % n]));
  }

  // Cek kesebangunan dua bangun dengan pasangan titik i <-> i
  function cekSebangun(titikA, titikB) {
    const sA = panjangSisi(titikA), sB = panjangSisi(titikB);
    const uA = sudutSudut(titikA), uB = sudutSudut(titikB);
    const rasio = sB.map((v, i) => v / sA[i]);
    const sisiSebanding = rasio.every((r) => Math.abs(r - rasio[0]) < 1e-6 * Math.max(1, rasio[0]));
    const sudutSama = uA.every((v, i) => Math.abs(v - uB[i]) < 1e-4);
    return { rasio, sisiSebanding, sudutSama, sebangun: sisiSebanding && sudutSama };
  }

  // S-S-S: dua segitiga yang hanya diketahui panjang sisinya.
  // Urutkan dulu (terpendek dengan terpendek, dst.), lalu bandingkan.
  function cekSSS(sisi1, sisi2) {
    const a = sisi1.slice().sort((x, y) => x - y);
    const b = sisi2.slice().sort((x, y) => x - y);
    const rasio = a.map((v, i) => b[i] / v);
    const sebangun = rasio.every((r) => Math.abs(r - rasio[0]) < 1e-9 * Math.max(1, r));
    return { rasio, sebangun, urutA: a, urutB: b };
  }

  // Persegi panjang: panjang dengan panjang, lebar dengan lebar
  function cekPersegiPanjang(p1, l1, p2, l2) {
    const A = [Math.max(p1, l1), Math.min(p1, l1)];
    const B = [Math.max(p2, l2), Math.min(p2, l2)];
    const r1 = B[0] / A[0], r2 = B[1] / A[1];
    return { rasio: [r1, r2], sebangun: Math.abs(r1 - r2) < 1e-9 * Math.max(1, r1) };
  }

  // ---------- acak ----------
  function acakInt(min, maks) {
    return min + Math.floor(Math.random() * (maks - min + 1));
  }

  function pilih(daftar) {
    return daftar[Math.floor(Math.random() * daftar.length)];
  }

  function kocok(daftar) {
    const a = daftar.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  const Logika = {
    bulatkan, apakahBulat, angkaRapi, fpb, keBilanganBulat, sederhanakan, senilai, cariX,
    parseAngka, samaDengan, formatAngka,
    jarak, besarSudut, segitigaValid, segitigaDariSisi, panjangSisi, sudutSudut,
    cekSebangun, cekSSS, cekPersegiPanjang,
    acakInt, pilih, kocok,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Logika;
  global.Logika = Logika;
})(typeof window !== 'undefined' ? window : globalThis);
