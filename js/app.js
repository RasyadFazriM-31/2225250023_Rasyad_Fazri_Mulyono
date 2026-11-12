/*
 * app.js
 * Kerangka aplikasi: navigasi (berbasis #hash), kemajuan belajar, dan
 * pemanggilan halaman. Setiap halaman didaftarkan di window.Halaman.
 */
(function () {
  'use strict';
  const { el, Simpan } = UI;

  const MODUL = [
    { id: 'beranda', judul: 'Beranda', ikon: 'rumah' },
    { id: 'prasyarat', no: 1, judul: 'Perbandingan', ket: 'Rasio, menyederhanakan, kali silang' },
    { id: 'konsep', no: 2, judul: 'Apa itu sebangun?', ket: 'Dua syarat yang harus dipenuhi' },
    { id: 'seletak', no: 3, judul: 'Sisi seletak & rotasi', ket: 'Cari pasangan sisi walau bangunnya diputar' },
    { id: 'segitiga', no: 4, judul: 'Segitiga sebangun', ket: 'Syarat dan bentuk-bentuk khusus' },
    { id: 'contoh', no: 5, judul: 'Contoh soal', ket: 'Langkah demi langkah, bisa ganti angka' },
    { id: 'latihan', no: 6, judul: 'Latihan bertahap', ket: '5 level, dari mudah ke tantangan' },
    { id: 'sketsa', judul: 'Papan sketsa', ikon: 'pensil', ket: 'Gambar ulang dan jelaskan dengan kata-katamu' },
    { id: 'ringkasan', judul: 'Ringkasan', ikon: 'kartu', ket: 'Inti materi dalam satu layar' },
    { id: 'tentang', judul: 'Tentang aplikasi', ikon: 'info' },
  ];

  const IKON = {
    rumah: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9H3z"/></svg>',
    pensil: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 20l4-1L19 8l-3-3L5 16z"/></svg>',
    kartu: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  };

  const posisi = {};
  let pembersih = [];
  let aktif = null;

  const ctx = {
    MODUL,
    posisi,
    param: {},
    bersih(f) {
      pembersih.push(f);
    },
    progres() {
      return Simpan.ambil('progres', {});
    },
    tandai(id) {
      const p = ctx.progres();
      p[id] = true;
      Simpan.taruh('progres', p);
      bangunNav();
    },
    selesai(id) {
      ctx.tandai(id);
      posisi[id] = 0;
      tampilkanSelesai(id);
    },
    berikutnya(id) {
      const belajar = MODUL.filter((m) => m.no);
      const i = belajar.findIndex((m) => m.id === id);
      return belajar[i + 1] || null;
    },
  };

  function tampilkanSelesai(id) {
    const m = MODUL.find((x) => x.id === id);
    const lanjut = ctx.berikutnya(id);
    const isi = document.getElementById('isi');
    bersihkan();
    isi.innerHTML = '';
    isi.append(el('section', { class: 'kartu selesai-modul' },
      el('div', { class: 'lencana', 'aria-hidden': 'true' }, '✓'),
      el('h1', { tabindex: '-1' }, `Modul ${m.no} selesai!`),
      el('p', { class: 'lead' }, `Kamu sudah menyelesaikan “${m.judul}”.`),
      el('div', { class: 'deret-tombol tengah' },
        lanjut ? el('a', { class: 'tombol', href: '#/' + lanjut.id }, `Lanjut: ${lanjut.judul} →`) : el('a', { class: 'tombol', href: '#/ringkasan' }, 'Lihat ringkasan →'),
        el('a', { class: 'tombol sekunder', href: '#/' + id, onclick: () => setTimeout(rute, 0) }, 'Ulangi modul ini'))));
    isi.querySelector('h1').focus();
    window.scrollTo(0, 0);
  }

  function bersihkan() {
    pembersih.forEach((f) => {
      try {
        f();
      } catch (e) {
        /* abaikan */
      }
    });
    pembersih = [];
  }

  function bangunNav() {
    const p = ctx.progres();
    const ul = document.getElementById('nav');
    ul.innerHTML = '';
    for (const m of MODUL) {
      const sudah = m.no && p[m.id];
      const a = el('a', { href: '#/' + m.id, class: sudah ? 'selesai' : null },
        el('span', { class: 'no', 'aria-hidden': 'true', html: m.no ? (sudah ? '✓' : String(m.no)) : IKON[m.ikon] }),
        el('span', null, m.judul, sudah ? el('span', { class: 'sr' }, ' (selesai)') : null));
      if (m.id === aktif) a.setAttribute('aria-current', 'page');
      if (m.id === 'sketsa') ul.append(el('li', { class: 'pemisah', 'aria-hidden': 'true' }));
      ul.append(el('li', null, a));
    }
    const belajar = MODUL.filter((m) => m.no);
    const jml = belajar.filter((m) => p[m.id]).length;
    const kem = document.getElementById('kemajuan');
    kem.innerHTML = '';
    kem.append(
      el('div', { class: 'kemajuan-teks' }, el('span', null, 'Kemajuan'), el('b', null, `${jml}/${belajar.length} modul`)),
      el('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(belajar.length), 'aria-valuenow': String(jml), 'aria-label': 'Kemajuan belajar' },
        el('span', { style: `width:${(jml / belajar.length) * 100}%` })));
  }

  function bacaHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [id, q] = h.split('?');
    const param = {};
    if (q) q.split('&').forEach((kv) => {
      const [k, v] = kv.split('=');
      if (k) param[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { id: id || 'beranda', param };
  }

  function rute() {
    const { id, param } = bacaHash();
    const m = MODUL.find((x) => x.id === id) || MODUL[0];
    bersihkan();
    aktif = m.id;
    ctx.param = param;
    const isi = document.getElementById('isi');
    isi.innerHTML = '';
    isi.dataset.halaman = m.id;
    try {
      window.Halaman[m.id](isi, ctx);
    } catch (e) {
      console.error(e);
      catatGalat(e);
      isi.append(el('div', { class: 'umpan salah' }, 'Maaf, halaman ini gagal dimuat. Coba muat ulang halaman.'));
    }
    document.title = (m.id === 'beranda' ? '' : m.judul + ' · ') + 'KeBangun';
    bangunNav();
    tutupMenu();
    window.scrollTo(0, 0);
  }

  // ---------- menu di layar kecil ----------
  function bukaMenu() {
    document.getElementById('samping').classList.add('buka');
    document.getElementById('tirai').hidden = false;
    document.getElementById('tombol-menu').setAttribute('aria-expanded', 'true');
  }
  function tutupMenu() {
    document.getElementById('samping').classList.remove('buka');
    document.getElementById('tirai').hidden = true;
    document.getElementById('tombol-menu').setAttribute('aria-expanded', 'false');
  }

  // ---------- galat ----------
  window.__galat = [];
  function catatGalat(e) {
    window.__galat.push(String((e && (e.stack || e.message)) || e));
  }
  window.addEventListener('error', (e) => catatGalat(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => catatGalat(e.reason));

  document.getElementById('tombol-menu').addEventListener('click', () => {
    if (document.getElementById('samping').classList.contains('buka')) tutupMenu();
    else bukaMenu();
  });
  document.getElementById('tirai').addEventListener('click', tutupMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tutupMenu();
  });
  window.addEventListener('hashchange', rute);
  window.App = { ctx, rute };
  rute();
})();
