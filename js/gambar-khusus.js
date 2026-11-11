/*
 * gambar-khusus.js
 * Gambar susunan segitiga yang sering muncul di soal kesebangunan.
 * Setiap fungsi mengembalikan {items, batas} untuk Gambar.render().
 */
(function (global) {
  'use strict';
  const G = global.Gambar;
  const W = G.WARNA;
  const { tambah, kurang, kali, antara, pusat, putar, batasDari, gabungBatas, bangun } = G;

  function warnaPasangan(aktif) {
    return aktif === false
      ? { b: W.garis, u: W.garis, o: W.garis }
      : { b: W.biru, u: W.ungu, o: W.oranye };
  }

  /**
   * Bentuk A: ΔABC dengan DE ∥ BC (D pada AB, E pada AC).
   * o: {A, B, C, t: AD/AB, pisah: 0..1, warna, label:{AD,DB,AE,EC,DE,BC,AB,AC}, sudut}
   * pisah = 0 -> gabung; pisah = 1 -> ΔADE dikeluarkan ke kiri.
   */
  function figBersarang(o) {
    const { A, B, C, t } = o;
    const D = antara(A, B, t), E = antara(A, C, t);
    const p = Math.max(0, Math.min(1, o.pisah || 0));
    const minX = Math.min(A[0], B[0], C[0]);
    const celah = o.celah == null ? Math.max(2, 0.3 * (Math.max(A[0], B[0], C[0]) - minX)) : o.celah;
    const maxKecil = Math.max(A[0], D[0], E[0]);
    const v = [minX - celah - maxKecil, B[1] - D[1]];
    const w = warnaPasangan(o.warna);
    const lbl = o.label || {};
    const items = [];
    const pABC = pusat([A, B, C]);

    if (p === 0) {
      items.push(
        { t: 'seg', a: A, b: D, warna: w.b, tebal: 3.8 },
        { t: 'seg', a: D, b: B, warna: W.garis, tebal: 3 },
        { t: 'seg', a: A, b: E, warna: w.u, tebal: 3.8 },
        { t: 'seg', a: E, b: C, warna: W.garis, tebal: 3 },
        { t: 'seg', a: D, b: E, warna: w.o, tebal: 3.8, sejajar: 1 },
        { t: 'seg', a: B, b: C, warna: w.o, tebal: 3.8, sejajar: 1 },
        { t: 'teks', p: A, teks: 'A', tetangga: [B, C] },
        { t: 'teks', p: B, teks: 'B', tetangga: [A, C] },
        { t: 'teks', p: C, teks: 'C', tetangga: [B, A] },
        { t: 'teks', p: D, teks: 'D', tetangga: [A, B], ref: pABC },
        { t: 'teks', p: E, teks: 'E', tetangga: [A, C], ref: pABC }
      );
      if (o.sudut) {
        items.push(
          { t: 'sudut', v: D, p: A, n: E, busur: 2 },
          { t: 'sudut', v: B, p: A, n: C, busur: 2 },
          { t: 'sudut', v: E, p: D, n: A, busur: 3 },
          { t: 'sudut', v: C, p: B, n: A, busur: 3 }
        );
      }
      const lblSisi = (a, b, teks, ref, warna) => {
        if (teks != null && teks !== '') items.push({ t: 'teksSisi', a, b, teks, ref, warna });
      };
      lblSisi(A, D, lbl.AD, pABC, w.b === W.garis ? W.teks : w.b);
      lblSisi(D, B, lbl.DB, pABC, W.teks);
      lblSisi(A, E, lbl.AE, pABC, w.u === W.garis ? W.teks : w.u);
      lblSisi(E, C, lbl.EC, pABC, W.teks);
      lblSisi(D, E, lbl.DE, antara(B, C, 0.5), w.o === W.garis ? W.teks : w.o);
      lblSisi(B, C, lbl.BC, A, w.o === W.garis ? W.teks : w.o);
    } else {
      // ΔABC utuh di tempat, bekas DE dibuat samar
      items.push({ t: 'seg', a: D, b: E, warna: W.pudar, tebal: 2, putus: '5 5' });
      items.push(...bangun([A, B, C], {
        nama: ['A', 'B', 'C'], warnaSisi: [w.b, w.o, w.u],
        busur: o.sudut ? [1, 2, 3] : null, labelSisi: [lbl.AB, lbl.BC, lbl.AC],
      }));
      const kecil = [A, D, E].map((q) => tambah(q, kali(v, p)));
      items.push(...bangun(kecil, {
        nama: ['A', 'D', 'E'], warnaSisi: [w.b, w.o, w.u],
        busur: o.sudut ? [1, 2, 3] : null, labelSisi: [lbl.AD, lbl.DE, lbl.AE],
      }));
    }
    const batas = gabungBatas(batasDari([A, B, C]), batasDari([A, D, E].map((q) => tambah(q, v))));
    return { items, batas, D, E };
  }

  /**
   * Bentuk X: AB ∥ DC, AC dan BD berpotongan di E.
   * o: {A, B, E, k: CE/AE, pisah: 0..1, warna, label:{AB,AE,BE,CD,CE,DE}, sudut}
   * pisah = 1 -> ΔCDE diputar 180° lalu diletakkan di kanan ΔABE.
   */
  function figX(o) {
    const { A, B, E, k } = o;
    const p = Math.max(0, Math.min(1, o.pisah || 0));
    const C = tambah(E, kali(kurang(E, A), k));
    const D = tambah(E, kali(kurang(E, B), k));
    const Cr = putar(C, 180, E), Dr = putar(D, 180, E);
    const celah = o.celah == null ? Math.max(2.5, 0.5 * Math.abs(B[0] - A[0])) : o.celah;
    const v = [Math.max(A[0], B[0], E[0]) + celah - Math.min(Cr[0], Dr[0], E[0]), A[1] - Cr[1]];
    const T = (q) => tambah(putar(q, 180 * p, E), kali(v, p));
    const w = warnaPasangan(o.warna);
    const lbl = o.label || {};
    const items = [];
    items.push(...bangun([A, B, E], {
      nama: ['A', 'B', 'E'], arahNama: [null, null, p === 0 ? [1, 0] : null],
      warnaSisi: [w.b, w.o, w.u], busur: o.sudut ? [1, 2, 3] : null,
      labelSisi: [lbl.AB, lbl.BE, lbl.AE],
    }));
    items.push(...bangun([T(C), T(D), T(E)], {
      nama: ['C', 'D', p === 0 ? '' : 'E'],
      warnaSisi: [w.b, w.o, w.u], busur: o.sudut ? [1, 2, 3] : null,
      labelSisi: [lbl.CD, lbl.DE, lbl.CE],
    }));
    const akhir = [A, B, E, Cr, Dr].map((q, i) => (i >= 3 ? tambah(q, v) : q));
    const batas = gabungBatas(batasDari([A, B, C, D, E]), batasDari(akhir));
    return { items, batas, C, D };
  }

  /**
   * Segitiga siku-siku di A dengan garis tinggi AD.
   * o: {p: BD, q: DC, mode: 'gabung'|'dbaDac'|'abcDba'|'tiga', warna, label}
   * label gabung: {AB, AC, AD, BD, DC}; label salinan: {abc:[AB,BC,CA], dba:[DB,BA,AD], dac:[DA,AC,CD]}
   */
  function figTinggi(o) {
    const n = o.p + o.q, h = Math.sqrt(o.p * o.q);
    const A = [o.p, h], B = [0, 0], C = [n, 0], D = [o.p, 0];
    const w = warnaPasangan(o.warna);
    const lbl = o.label || {};
    const items = [];
    const mode = o.mode || 'gabung';
    if (mode === 'gabung') {
      items.push(...bangun([A, B, C], { nama: ['A', 'B', 'C'], busur: ['siku', 0, 0], labelSisi: [lbl.AB, lbl.BC, lbl.AC] }));
      items.push({ t: 'seg', a: A, b: D, warna: W.garis, tebal: 2.6 });
      items.push({ t: 'sudut', v: D, p: C, n: A, siku: true });
      items.push({ t: 'teks', p: D, teks: 'D', arah: [0, -1] });
      if (lbl.BD) items.push({ t: 'teksSisi', a: B, b: D, teks: lbl.BD, ref: A });
      if (lbl.DC) items.push({ t: 'teksSisi', a: D, b: C, teks: lbl.DC, ref: A });
      if (lbl.AD) items.push({ t: 'teksSisi', a: A, b: D, teks: lbl.AD, ref: C });
      return { items, batas: null };
    }
    // Salinan dengan arah yang sama seperti ΔABC (siku di atas, sisi miring di bawah)
    const sAB = Math.sqrt(o.p * n) / n, sAC = Math.sqrt(o.q * n) / n;
    const daftar = {
      dbaDac: [[sAB, ['D', 'B', 'A'], lbl.dba], [sAC, ['D', 'A', 'C'], lbl.dac]],
      abcDba: [[1, ['A', 'B', 'C'], lbl.abc], [sAB, ['D', 'B', 'A'], lbl.dba]],
      tiga: [[1, ['A', 'B', 'C'], lbl.abc], [sAB, ['D', 'B', 'A'], lbl.dba], [sAC, ['D', 'A', 'C'], lbl.dac]],
    }[mode];
    const celah = n * 0.24;
    const gambarSalinan = (sk, nama, label, x, y) => {
      const pts = [A, B, C].map((q) => [q[0] * sk + x, q[1] * sk + y]);
      items.push(...bangun(pts, {
        nama, warnaSisi: [w.b, w.o, w.u], busur: ['siku', 1, 2], labelSisi: label || null,
      }));
    };
    if (o.susun && daftar.length === 3) {
      // layar sempit: ΔABC di baris atas, dua segitiga kecil di baris bawah
      const [besar, k1, k2] = daftar;
      const lebarBawah = n * k1[0] + celah + n * k2[0];
      const yBawah = -(Math.max(k1[0], k2[0]) * h + h * 0.55);
      gambarSalinan(besar[0], besar[1], besar[2], (lebarBawah - n) / 2, 0);
      gambarSalinan(k1[0], k1[1], k1[2], 0, yBawah);
      gambarSalinan(k2[0], k2[1], k2[2], n * k1[0] + celah, yBawah);
      return { items, batas: null };
    }
    let x = 0;
    for (const [sk, nama, label] of daftar) {
      gambarSalinan(sk, nama, label, x, 0);
      x += n * sk + celah;
    }
    return { items, batas: null };
  }

  /**
   * Soal bayangan: tongkat (h1, bayangan s1) dan tiang (h2, bayangan s2).
   * o: {h1, s1, h2, s2, warna, label:{h1,s1,h2,s2}}
   */
  function figBayangan(o) {
    const { h1, s1, h2, s2 } = o;
    const w = warnaPasangan(o.warna);
    const lbl = o.label || {};
    const x0 = s1 + Math.max(1.5, s2 * 0.18);
    const T1 = [0, h1], U1 = [0, 0], E1 = [s1, 0];
    const T2 = [x0, h2], U2 = [x0, 0], E2 = [x0 + s2, 0];
    const items = [];
    const ukuran = Math.max(h2, s2);
    // matahari
    items.push({ t: 'lingkaran', c: [-ukuran * 0.08, h2 * 1.02], r: ukuran * 0.06, isi: '#fde68a', garis: W.sinar });
    // tanah
    items.push({ t: 'seg', a: [-ukuran * 0.08, 0], b: [x0 + s2 + ukuran * 0.06, 0], warna: '#a8a29e', tebal: 2 });
    const sinar = (T, E) => {
      const awal = tambah(T, kali(kurang(T, E), 0.25));
      items.push({ t: 'seg', a: awal, b: E, warna: W.sinar, tebal: 2, putus: '7 6' });
    };
    sinar(T1, E1);
    sinar(T2, E2);
    // bendera kecil di puncak tiang
    items.push({ t: 'poly', pts: [T2, [x0 + h2 * 0.2, h2 * 0.94], [x0, h2 * 0.88]], isi: '#ef4444' });
    items.push(
      { t: 'sudut', v: U1, p: E1, n: T1, siku: true },
      { t: 'sudut', v: U2, p: E2, n: T2, siku: true },
      { t: 'sudut', v: E1, p: T1, n: U1, busur: 1 },
      { t: 'sudut', v: E2, p: T2, n: U2, busur: 1 },
      { t: 'seg', a: U1, b: T1, warna: w.b, tebal: 5 },
      { t: 'seg', a: U1, b: E1, warna: w.u, tebal: 5 },
      { t: 'seg', a: U2, b: T2, warna: w.b, tebal: 5 },
      { t: 'seg', a: U2, b: E2, warna: w.u, tebal: 5 },
      { t: 'teks', p: T1, teks: 'tongkat', arah: [0, 1], tipis: true, ukuran: 13 },
      { t: 'teks', p: T2, teks: 'tiang', arah: [-1, 0.2], jarak: 26, tipis: true, ukuran: 13 }
    );
    const lb = (a, b, teks, ref, warna) => {
      if (teks != null) items.push({ t: 'teksSisi', a, b, teks, ref, warna: warna === W.garis ? W.teks : warna });
    };
    lb(U1, T1, lbl.h1, E1, w.b);
    lb(U1, E1, lbl.s1, T1, w.u);
    lb(U2, T2, lbl.h2, E2, w.b);
    lb(U2, E2, lbl.s2, T2, w.u);
    return { items, batas: null };
  }

  global.GambarKhusus = { figBersarang, figX, figTinggi, figBayangan };
})(window);
