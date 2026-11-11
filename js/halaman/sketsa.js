/* Papan sketsa berpetak (menggambar ulang) dan kotak "Jelaskan ke teman". */
(function () {
  'use strict';
  const { el, tombol, Simpan } = UI;
  const L = Logika, W = Gambar.WARNA;

  const KOTAK = 28;
  const WARNA_PENA = [['Biru', W.biru], ['Ungu', W.ungu], ['Oranye', W.oranye], ['Pink', W.pink], ['Hitam', '#1e293b']];
  const TANTANGAN = [
    'Gambar persegi panjang 3 × 2 kotak. Lalu gambar yang sebangun dengan k = 2. Warnai sisi seletak dengan warna sama.',
    'Gambar segitiga siku-siku dengan alas 4 dan tinggi 3 kotak. Gambar lagi yang sebangun, tetapi posisinya diputar.',
    'Gambar ΔABC, lalu tarik garis DE yang sejajar BC. Warnai AD dan AB dengan biru, DE dan BC dengan oranye.',
    'Gambar persegi 3 × 3 kotak dan persegi panjang 3 × 5 kotak. Apakah keduanya sebangun? Tulis alasannya di bawah.',
    'Gambar bentuk X: dua garis sejajar, lalu dua garis miring yang berpotongan. Warnai pasangan sisinya.',
  ];
  const PERTANYAAN = [
    'Bagaimana cara mencari sisi seletak kalau bangunnya diputar?',
    'Kapan dua bangun disebut sebangun?',
    'Apa langkah-langkah mencari sisi yang belum diketahui pada dua segitiga sebangun?',
    'Pada soal garis sejajar (DE ∥ BC), kenapa kita memakai AB, bukan DB?',
  ];
  const CEKLIS = ['Menyebut sudut yang sama besar', 'Menyebut pasangan sisi seletak', 'Menulis perbandingan yang sama', 'Memberi contoh dengan angka'];

  function papan(akar, ctx) {
    let goresan = Simpan.ambil('sketsa', []);
    if (!Array.isArray(goresan)) goresan = [];
    let alat = 'garis', warna = W.biru, aktif = null, lebar = 0, tinggi = 0;
    const kanvas = el('canvas', { class: 'kanvas', role: 'img', 'aria-label': 'Papan sketsa berpetak. Seret untuk menggambar.' });
    const wadah = el('div', { class: 'wadah-kanvas' }, kanvas);
    const c2d = kanvas.getContext('2d');

    const segAlat = UI.segmen([['garis', 'Garis lurus'], ['pena', 'Pena bebas']], alat, (a) => { alat = a; }, 'Alat gambar');
    const paletWarna = el('div', { class: 'palet', role: 'group', 'aria-label': 'Warna pena' });
    WARNA_PENA.forEach(([nama, w]) => {
      const b = el('button', { type: 'button', class: 'warna-pena', 'aria-label': nama, 'aria-pressed': String(w === warna), style: `--w:${w}`, onclick: () => {
        warna = w;
        paletWarna.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      } });
      paletWarna.append(b);
    });

    const simpan = () => Simpan.taruh('sketsa', goresan);
    const alatAlat = el('div', { class: 'bilah-alat' },
      segAlat.elemen, paletWarna,
      el('div', { class: 'deret-tombol rapat' },
        tombol('↶ Urungkan', () => { goresan.pop(); simpan(); gambarUlang(); }, 'sekunder kecil'),
        tombol('Hapus semua', () => {
          if (!goresan.length || window.confirm('Hapus semua gambar?')) { goresan = []; simpan(); gambarUlang(); }
        }, 'sekunder kecil'),
        tombol('Simpan gambar', unduh, 'sekunder kecil')));

    akar.append(alatAlat, wadah);

    function ukur() {
      const r = wadah.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      lebar = Math.max(280, Math.floor(r.width));
      tinggi = Math.round(Math.min(520, Math.max(320, lebar * 0.62)));
      kanvas.width = lebar * dpr;
      kanvas.height = tinggi * dpr;
      kanvas.style.height = tinggi + 'px';
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      gambarUlang();
    }

    function gambarGores(g) {
      if (!g.titik || g.titik.length < 1) return;
      c2d.strokeStyle = g.warna;
      c2d.lineWidth = g.alat === 'garis' ? 3.5 : 3;
      c2d.lineCap = 'round';
      c2d.lineJoin = 'round';
      c2d.beginPath();
      g.titik.forEach((p, i) => (i ? c2d.lineTo(p[0], p[1]) : c2d.moveTo(p[0], p[1])));
      c2d.stroke();
      if (g.alat === 'garis') {
        c2d.fillStyle = g.warna;
        g.titik.forEach((p) => { c2d.beginPath(); c2d.arc(p[0], p[1], 3.5, 0, Math.PI * 2); c2d.fill(); });
      }
    }

    function gambarUlang(latarPutih) {
      c2d.fillStyle = '#ffffff';
      c2d.fillRect(0, 0, lebar, tinggi);
      c2d.strokeStyle = W.grid;
      c2d.lineWidth = 1;
      c2d.beginPath();
      for (let x = 0.5; x <= lebar; x += KOTAK) { c2d.moveTo(x, 0); c2d.lineTo(x, tinggi); }
      for (let y = 0.5; y <= tinggi; y += KOTAK) { c2d.moveTo(0, y); c2d.lineTo(lebar, y); }
      c2d.stroke();
      goresan.forEach(gambarGores);
      if (aktif) {
        gambarGores(aktif);
        if (aktif.alat === 'garis' && !latarPutih) {
          const [p, q] = aktif.titik;
          const pjg = Math.hypot(q[0] - p[0], q[1] - p[1]) / KOTAK;
          if (pjg > 0) {
            const teks = L.formatAngka(pjg, 1) + ' kotak';
            c2d.font = '700 13px Nunito, system-ui, sans-serif';
            const tw = c2d.measureText(teks).width;
            const x = Math.min(lebar - tw - 10, q[0] + 12), y = Math.max(18, q[1] - 12);
            c2d.fillStyle = 'rgba(255,255,255,.92)';
            c2d.fillRect(x - 5, y - 13, tw + 10, 19);
            c2d.fillStyle = '#0f172a';
            c2d.fillText(teks, x, y);
          }
        }
      }
    }

    const titikDari = (e) => {
      const r = kanvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const jepret = (p) => [Math.round((p[0] - 0.5) / KOTAK) * KOTAK + 0.5, Math.round((p[1] - 0.5) / KOTAK) * KOTAK + 0.5];

    kanvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      kanvas.setPointerCapture(e.pointerId);
      const p = titikDari(e);
      aktif = alat === 'garis' ? { alat, warna, titik: [jepret(p), jepret(p)] } : { alat, warna, titik: [p] };
      gambarUlang();
    });
    kanvas.addEventListener('pointermove', (e) => {
      if (!aktif) return;
      const p = titikDari(e);
      if (aktif.alat === 'garis') aktif.titik[1] = jepret(p);
      else aktif.titik.push(p);
      gambarUlang();
    });
    const akhiri = () => {
      if (!aktif) return;
      const [p, q] = aktif.titik;
      const kosong = aktif.alat === 'garis' && p[0] === q[0] && p[1] === q[1];
      if (!kosong) {
        goresan.push(aktif);
        simpan();
      }
      aktif = null;
      gambarUlang();
    };
    kanvas.addEventListener('pointerup', akhiri);
    kanvas.addEventListener('pointercancel', akhiri);

    function unduh() {
      gambarUlang(true);
      kanvas.toBlob((blob) => {
        if (!blob) return;
        const a = el('a', { href: URL.createObjectURL(blob), download: 'sketsa-kesebangunan.png' });
        document.body.append(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      });
    }

    const onResize = () => ukur();
    window.addEventListener('resize', onResize);
    ctx.bersih(() => window.removeEventListener('resize', onResize));
    ukur();
  }

  function jelaskan(akar) {
    const data = Simpan.ambil('penjelasan', { teks: '', centang: [], q: 0 });
    let q = data.q || 0;
    const pertanyaan = el('p', { class: 'pertanyaan' });
    const area = el('textarea', { class: 'area-teks', rows: '5', placeholder: 'Tulis dengan kata-katamu sendiri, seolah menjelaskan ke teman…', 'aria-label': 'Penjelasanmu' });
    area.value = data.teks || '';
    const simpan = () => Simpan.taruh('penjelasan', { teks: area.value, centang: ambilCentang(), q });
    area.addEventListener('input', simpan);
    const daftarCek = el('ul', { class: 'ceklis' });
    CEKLIS.forEach((teks, i) => {
      const cb = el('input', { type: 'checkbox' });
      cb.checked = (data.centang || []).indexOf(i) !== -1;
      cb.addEventListener('change', simpan);
      daftarCek.append(el('li', null, el('label', null, cb, el('span', null, teks))));
    });
    function ambilCentang() {
      return Array.from(daftarCek.querySelectorAll('input')).map((c, i) => (c.checked ? i : -1)).filter((i) => i >= 0);
    }
    const status = el('span', { class: 'catatan', role: 'status' });
    function tampilPertanyaan() { pertanyaan.textContent = PERTANYAAN[q]; }
    tampilPertanyaan();
    akar.append(
      pertanyaan, area,
      el('p', { class: 'label-kecil' }, 'Cek penjelasanmu. Sudah ada…'), daftarCek,
      el('div', { class: 'deret-tombol' },
        tombol('Pertanyaan lain', () => { q = (q + 1) % PERTANYAAN.length; tampilPertanyaan(); simpan(); }, 'sekunder'),
        tombol('Salin teks', async () => {
          try {
            await navigator.clipboard.writeText(`${PERTANYAAN[q]}\n\n${area.value}`);
            status.textContent = 'Tersalin. Kirim ke temanmu!';
          } catch (e) {
            area.select();
            status.textContent = 'Tekan Ctrl+C untuk menyalin.';
          }
        }, 'sekunder'),
        status));
  }

  window.Halaman.sketsa = function (akar, ctx) {
    let t = L.acakInt(0, TANTANGAN.length - 1);
    const teksTantangan = el('p', { class: 'teks-utama' }, TANTANGAN[t]);
    const kartuPapan = el('section', { class: 'kartu' });
    const kartuJelas = el('section', { class: 'kartu' });
    akar.append(
      el('header', { class: 'kepala-modul' },
        el('p', { class: 'label-kecil' }, 'Latihan tambahan'),
        el('h1', null, 'Papan sketsa'),
        el('p', { class: 'lead' }, 'Menggambar ulang bangunnya membantumu lebih ingat dan paham.')),
      el('section', { class: 'kartu tantangan' },
        el('p', { class: 'label-kecil' }, 'Tantangan gambar'), teksTantangan,
        tombol('Tantangan lain', () => { t = (t + 1) % TANTANGAN.length; teksTantangan.textContent = TANTANGAN[t]; }, 'teks')),
      kartuPapan,
      el('h2', { class: 'judul-bagian' }, 'Jelaskan ke teman'),
      el('p', { class: 'catatan' }, 'Menjelaskan dengan kata-katamu sendiri adalah cara ampuh untuk mengecek pemahaman. Tulisanmu hanya tersimpan di perangkat ini.'),
      kartuJelas);
    papan(kartuPapan, ctx);
    jelaskan(kartuJelas);
  };
})();
