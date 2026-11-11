/*
 * gambar.js
 * Mesin gambar SVG sederhana. Bangun digambar dalam koordinat "dunia"
 * (1 satuan = 1 kotak, sumbu y ke atas), lalu otomatis diskalakan agar pas.
 *
 * Jenis item:
 *   {t:'seg', a, b, warna, tebal, putus, sejajar, id, klik}      ruas garis
 *   {t:'poly', pts, isi}                                          bidang berisi warna
 *   {t:'sudut', v, p, n, busur, siku, teks}                       tanda sudut di v
 *   {t:'teks', p, teks, tetangga, arah, ref}                      nama titik
 *   {t:'teksSisi', a, b, teks, ref, warna}                        label panjang sisi
 *   {t:'lingkaran', c, r, isi, garis}
 */
(function (global) {
  'use strict';

  const WARNA = {
    biru: '#2563eb',
    ungu: '#9333ea',
    oranye: '#e8590c',
    pink: '#db2777',
    garis: '#334155',
    abu: '#94a3b8',
    pudar: '#cbd5e1',
    sudut: '#b45309',
    sudutIsi: 'rgba(245, 158, 11, 0.26)',
    sudutSorot: 'rgba(245, 158, 11, 0.55)',
    grid: '#e6eaf0',
    teks: '#0f172a',
    sinar: '#f59e0b',
    pilih: '#0f766e',
  };
  // Warna pasangan sisi seletak: pasangan ke-0 biru, ke-1 ungu, ke-2 oranye, ke-3 pink
  const PASANGAN = [WARNA.biru, WARNA.ungu, WARNA.oranye, WARNA.pink];

  // ---------- vektor ----------
  const tambah = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const kurang = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const kali = (p, s) => [p[0] * s, p[1] * s];
  const panjang = (p) => Math.hypot(p[0], p[1]);
  const satuan = (p) => {
    const l = panjang(p) || 1;
    return [p[0] / l, p[1] / l];
  };
  const antara = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const pusat = (pts) => kali(pts.reduce(tambah, [0, 0]), 1 / pts.length);

  // Putar titik p sebesar `derajat` (berlawanan jarum jam) terhadap c
  function putar(p, derajat, c) {
    c = c || [0, 0];
    const r = (derajat * Math.PI) / 180;
    const s = Math.sin(r), k = Math.cos(r);
    const d = kurang(p, c);
    return [c[0] + d[0] * k - d[1] * s, c[1] + d[0] * s + d[1] * k];
  }

  // Skala, cermin, lalu putar terhadap titik pusat bangun
  function transformasi(pts, o) {
    o = o || {};
    const c = o.titikPusat || pusat(pts);
    const skala = o.skala == null ? 1 : o.skala;
    return pts.map((p) => {
      let d = kurang(p, c);
      if (o.cermin) d = [-d[0], d[1]];
      d = kali(d, skala);
      d = putar(d, o.putar || 0);
      return tambah(tambah(c, d), o.geser || [0, 0]);
    });
  }

  function batasDari(pts) {
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    for (const p of pts) {
      b = [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])];
    }
    return b;
  }

  function gabungBatas(...daftar) {
    return daftar.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  }

  // Geser `kanan` agar berada di sebelah kanan `kiri` (jarak `celah`), tengahnya sejajar
  function letakkanKanan(kiri, kanan, celah, bulat) {
    const bk = batasDari(kiri), bn = batasDari(kanan);
    let dx = bk[2] + celah - bn[0];
    let dy = (bk[1] + bk[3]) / 2 - (bn[1] + bn[3]) / 2;
    if (bulat) {
      dx = Math.ceil(dx);
      dy = Math.round(dy);
    }
    return kanan.map((p) => [p[0] + dx, p[1] + dy]);
  }

  // ---------- render ----------
  const f = (v) => Math.round(v * 10) / 10;
  const xy = (p) => `${f(p[0])} ${f(p[1])}`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function titikItem(it) {
    switch (it.t) {
      case 'seg':
      case 'teksSisi':
        return [it.a, it.b];
      case 'poly':
        return it.pts;
      case 'sudut':
        return [it.v];
      case 'teks':
        return [it.p];
      case 'lingkaran':
        return [[it.c[0] - it.r, it.c[1] - it.r], [it.c[0] + it.r, it.c[1] + it.r]];
      default:
        return [];
    }
  }

  function svgGrid(W, H, s, ox, oy, langkah) {
    let st = langkah || 1;
    while (st * s < 12) st *= 2;
    const x0 = Math.floor((0 - ox) / s / st) * st;
    const x1 = (W - ox) / s;
    const y0 = Math.floor((oy - H) / s / st) * st;
    const y1 = oy / s;
    let d = '';
    for (let x = x0; x <= x1 + 1e-9; x += st) d += `M${f(x * s + ox)} 0V${H}`;
    for (let y = y0; y <= y1 + 1e-9; y += st) d += `M0 ${f(oy - y * s)}H${W}`;
    return `<path d="${d}" stroke="${WARNA.grid}" stroke-width="1" fill="none"/>`;
  }

  function svgSeg(it, T) {
    const A = T(it.a), B = T(it.b);
    const w = it.warna || WARNA.garis;
    const tb = it.tebal || 3;
    let s = `<line x1="${f(A[0])}" y1="${f(A[1])}" x2="${f(B[0])}" y2="${f(B[1])}" stroke="${w}" stroke-width="${tb}" stroke-linecap="round"`;
    if (it.putus) s += ` stroke-dasharray="${it.putus}"`;
    if (it.opacity != null) s += ` opacity="${it.opacity}"`;
    s += '/>';
    // tanda sejajar (>) di tengah ruas
    if (it.sejajar) {
      const u = satuan(kurang(B, A)), n = [-u[1], u[0]];
      const m = kali(tambah(A, B), 0.5);
      for (let i = 0; i < it.sejajar; i++) {
        const c = tambah(m, kali(u, i * 6 - (it.sejajar - 1) * 3 + 3));
        const p1 = tambah(kurang(c, kali(u, 6)), kali(n, 5));
        const p2 = kurang(kurang(c, kali(u, 6)), kali(n, 5));
        s += `<path d="M${xy(p1)} L${xy(c)} L${xy(p2)}" fill="none" stroke="${w}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    }
    return s;
  }

  function svgHit(it, T) {
    const A = T(it.a), B = T(it.b);
    return `<line class="hit" data-sisi="${esc(it.id)}" x1="${f(A[0])}" y1="${f(A[1])}" x2="${f(B[0])}" y2="${f(B[1])}" stroke="transparent" stroke-width="24" stroke-linecap="round" pointer-events="stroke"/>`;
  }

  function svgSudut(it, T) {
    const V = T(it.v), P = T(it.p), N = T(it.n);
    const u1 = satuan(kurang(P, V)), u2 = satuan(kurang(N, V));
    const maks = Math.min(panjang(kurang(P, V)), panjang(kurang(N, V)));
    const w = it.warna || WARNA.sudut;
    const isi = it.isi || WARNA.sudutIsi;
    let s = '';
    if (it.siku) {
      const r = Math.max(6, Math.min(12, maks * 0.3));
      const a = tambah(V, kali(u1, r)), c = tambah(V, kali(u2, r)), b = tambah(a, kali(u2, r));
      s += `<path d="M${xy(V)} L${xy(a)} L${xy(b)} L${xy(c)} Z" fill="${isi}" stroke="none"/>`;
      s += `<path d="M${xy(a)} L${xy(b)} L${xy(c)}" fill="none" stroke="${w}" stroke-width="1.6"/>`;
    } else {
      const n = it.busur || 1;
      const a1 = Math.atan2(u1[1], u1[0]), a2 = Math.atan2(u2[1], u2[0]);
      let d = a2 - a1;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      // sudut lancip kecil: busur dibuat lebih besar supaya jumlah busurnya mudah dihitung
      const r0 = Math.abs(d) < 0.65
        ? Math.max(7, Math.min(26, maks * 0.45))
        : Math.max(7, Math.min(16, maks * 0.3));
      const sw = d > 0 ? 1 : 0;
      const rLuar = r0 + (n - 1) * 3.6;
      let p = tambah(V, kali(u1, rLuar)), q = tambah(V, kali(u2, rLuar));
      s += `<path d="M${xy(V)} L${xy(p)} A${f(rLuar)} ${f(rLuar)} 0 0 ${sw} ${xy(q)} Z" fill="${isi}" stroke="none"/>`;
      for (let k = 0; k < n; k++) {
        const r = r0 + k * 3.6;
        p = tambah(V, kali(u1, r));
        q = tambah(V, kali(u2, r));
        s += `<path d="M${xy(p)} A${f(r)} ${f(r)} 0 0 ${sw} ${xy(q)}" fill="none" stroke="${w}" stroke-width="1.6"/>`;
      }
    }
    if (it.teks) {
      const bis = satuan(tambah(u1, u2));
      const pos = tambah(V, kali(bis, (it.siku ? 12 : 16) + 16));
      s += `<text x="${f(pos[0])}" y="${f(pos[1])}" class="lbl-sudut" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="${WARNA.sudut}">${esc(it.teks)}</text>`;
    }
    return s;
  }

  function svgTeks(it, T) {
    const P = T(it.p);
    let arah = [0, -1];
    if (it.arah) {
      arah = satuan([it.arah[0], -it.arah[1]]);
    } else if (it.tetangga) {
      const u1 = satuan(kurang(T(it.tetangga[0]), P));
      const u2 = satuan(kurang(T(it.tetangga[1]), P));
      let d = kali(tambah(u1, u2), -1);
      if (panjang(d) < 0.2) {
        // titik pada garis lurus: pakai arah tegak lurus, menjauhi ref
        d = [-u1[1], u1[0]];
        if (it.ref) {
          const r = kurang(T(it.ref), P);
          if (d[0] * r[0] + d[1] * r[1] > 0) d = kali(d, -1);
        }
      }
      arah = satuan(d);
    }
    const jarak = it.jarak == null ? 14 : it.jarak;
    const pos = tambah(P, kali(arah, jarak));
    const warna = it.warna || WARNA.teks;
    const ukuran = it.ukuran || 15;
    return `<text x="${f(pos[0])}" y="${f(pos[1])}" class="lbl-titik" text-anchor="middle" dominant-baseline="central" font-size="${ukuran}" font-weight="${it.tipis ? 600 : 800}" fill="${warna}">${esc(it.teks)}</text>`;
  }

  function svgTeksSisi(it, T) {
    const A = T(it.a), B = T(it.b), m = kali(tambah(A, B), 0.5);
    let n = satuan([-(B[1] - A[1]), B[0] - A[0]]);
    if (it.ref) {
      const r = kurang(T(it.ref), m);
      if (n[0] * r[0] + n[1] * r[1] > 0) n = kali(n, -1);
    }
    const lebarTeks = String(it.teks).length * 7.6;
    const jarak = 9 + (Math.abs(n[0]) * lebarTeks) / 2 + Math.abs(n[1]) * 7;
    const pos = tambah(m, kali(n, jarak));
    const warna = it.warna || WARNA.teks;
    return `<text x="${f(pos[0])}" y="${f(pos[1])}" class="lbl-sisi" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${warna}">${esc(it.teks)}</text>`;
  }

  /**
   * Ubah daftar item menjadi string SVG.
   * o: {lebar, tinggi, pad, batas:[minX,minY,maxX,maxY], grid, langkahGrid, label, interaktif}
   */
  function render(items, o) {
    o = o || {};
    // Di layar HP, kanvas SVG dibuat lebih sempit supaya huruf label tetap terbaca
    const hp = typeof window !== 'undefined' && window.innerWidth < 560;
    const fk = hp ? 0.72 : 1;
    const W = Math.round((o.lebar || 480) * fk), H = Math.round((o.tinggi || 300) * fk);
    const pad = (o.pad == null ? 36 : o.pad) * (hp ? 0.8 : 1);
    const semua = [];
    items.forEach((it) => semua.push(...titikItem(it)));
    const b = o.batas || batasDari(semua.length ? semua : [[0, 0], [1, 1]]);
    const bw = Math.max(b[2] - b[0], 0.001), bh = Math.max(b[3] - b[1], 0.001);
    const s = Math.min((W - 2 * pad) / bw, (H - 2 * pad) / bh);
    const ox = (W - bw * s) / 2 - b[0] * s;
    const oy = (H + bh * s) / 2 + b[1] * s;
    const T = (p) => [p[0] * s + ox, oy - p[1] * s];

    const lap = { grid: [], poly: [], sudut: [], seg: [], hit: [], teks: [] };
    if (o.grid !== false) lap.grid.push(svgGrid(W, H, s, ox, oy, o.langkahGrid));
    for (const it of items) {
      switch (it.t) {
        case 'poly': {
          const d = it.pts.map((p, i) => (i ? 'L' : 'M') + xy(T(p))).join(' ') + ' Z';
          lap.poly.push(`<path d="${d}" fill="${it.isi || 'none'}" stroke="${it.garis || 'none'}"${it.opacity != null ? ` opacity="${it.opacity}"` : ''}/>`);
          break;
        }
        case 'lingkaran': {
          const C = T(it.c);
          lap.poly.push(`<circle cx="${f(C[0])}" cy="${f(C[1])}" r="${f(it.r * s)}" fill="${it.isi || 'none'}" stroke="${it.garis || 'none'}" stroke-width="2"/>`);
          break;
        }
        case 'sudut':
          lap.sudut.push(svgSudut(it, T));
          break;
        case 'seg':
          lap.seg.push(svgSeg(it, T));
          if (it.klik && it.id != null) lap.hit.push(svgHit(it, T));
          break;
        case 'teks':
          lap.teks.push(svgTeks(it, T));
          break;
        case 'teksSisi':
          lap.teks.push(svgTeksSisi(it, T));
          break;
      }
    }
    const peran = o.interaktif ? 'group' : 'img';
    const label = o.label ? ` aria-label="${esc(o.label)}"` : '';
    return (
      `<svg class="gambar" viewBox="0 0 ${W} ${H}" role="${peran}"${label} xmlns="http://www.w3.org/2000/svg">` +
      lap.grid.join('') + lap.poly.join('') + lap.sudut.join('') + lap.seg.join('') + lap.hit.join('') + lap.teks.join('') +
      '</svg>'
    );
  }

  /**
   * Bangun (poligon) lengkap: sisi berwarna, tanda sudut, nama titik, label sisi.
   * o: {nama:[], warnaSisi:[], busur:[n|'siku'|0], teksSudut:[], labelSisi:[], warnaLabel:[],
   *     isi, tebal, id, klik, arahNama:[[dx,dy]|null], sorotSudut:[bool]}
   */
  function bangun(pts, o) {
    o = o || {};
    const n = pts.length, c = pusat(pts), items = [];
    if (o.isi) items.push({ t: 'poly', pts, isi: o.isi });
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
      const bs = o.busur ? o.busur[i] : 0;
      if (bs) {
        items.push({
          t: 'sudut', v: cur, p: prev, n: next,
          busur: bs === 'siku' ? 1 : bs, siku: bs === 'siku',
          teks: o.teksSudut ? o.teksSudut[i] : null,
          isi: o.sorotSudut && o.sorotSudut[i] ? WARNA.sudutSorot : null,
        });
      }
      const warna = o.warnaSisi ? o.warnaSisi[i] || WARNA.garis : WARNA.garis;
      items.push({
        t: 'seg', a: cur, b: next, warna,
        tebal: o.tebalSisi ? o.tebalSisi[i] : o.tebal || 3.2,
        putus: o.putusSisi ? o.putusSisi[i] : null,
        id: o.id != null ? o.id + i : null, klik: o.klik,
      });
      const lbl = o.labelSisi ? o.labelSisi[i] : null;
      if (lbl != null && lbl !== '') {
        const wl = o.warnaLabel ? o.warnaLabel[i] : warna === WARNA.garis ? WARNA.teks : warna;
        items.push({ t: 'teksSisi', a: cur, b: next, teks: lbl, ref: c, warna: wl });
      }
      if (o.nama && o.nama[i]) {
        const arah = o.arahNama ? o.arahNama[i] : null;
        items.push({ t: 'teks', p: cur, teks: o.nama[i], tetangga: arah ? null : [prev, next], arah, ref: c });
      }
    }
    return items;
  }

  global.Gambar = {
    WARNA, PASANGAN,
    tambah, kurang, kali, panjang, satuan, antara, pusat, putar, transformasi,
    batasDari, gabungBatas, letakkanKanan,
    render, bangun,
  };
})(window);
