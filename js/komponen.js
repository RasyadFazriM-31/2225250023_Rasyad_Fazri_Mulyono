/*
 * komponen.js
 * Potongan antarmuka yang dipakai berulang: pembuat elemen, tombol,
 * kotak "Kenapa begitu?", umpan balik, penyimpanan, animasi, dan
 * pengatur langkah (satu langkah satu layar).
 */
(function (global) {
  'use strict';

  // Membuat elemen: el('button', {class:'tombol', onclick: fn}, 'Teks')
  function el(tag, atribut, ...anak) {
    const e = document.createElement(tag);
    if (atribut) {
      for (const [k, v] of Object.entries(atribut)) {
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const a of anak.flat(3)) {
      if (a == null || a === false) continue;
      e.append(a instanceof Node ? a : document.createTextNode(String(a)));
    }
    return e;
  }

  function tombol(teks, aksi, kelas) {
    return el('button', { type: 'button', class: 'tombol ' + (kelas || ''), onclick: aksi }, teks);
  }

  function kenapa(isi, judul) {
    return el('details', { class: 'kenapa' }, el('summary', null, judul || 'Kenapa begitu?'), el('div', { html: isi }));
  }

  const IKON = { benar: '✓', salah: '!', info: 'i' };
  function umpan(wadah, jenis, pesan) {
    wadah.hidden = false;
    wadah.className = 'umpan ' + jenis;
    wadah.innerHTML = '';
    wadah.append(el('span', { class: 'ikon-umpan', 'aria-hidden': 'true' }, IKON[jenis] || ''), el('span', { html: pesan }));
    if (jenis === 'salah') {
      wadah.classList.remove('goyang');
      void wadah.offsetWidth;
      wadah.classList.add('goyang');
    }
  }

  function wadahGambar(svg) {
    const d = el('div', { class: 'wadah-gambar' });
    if (svg) d.innerHTML = svg;
    return d;
  }

  function inputAngka(o) {
    o = o || {};
    const input = el('input', {
      type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false',
      class: 'isian', 'aria-label': o.label || (o.awalan ? 'Isi ' + o.awalan.replace('=', '').trim() : 'Jawaban'),
      placeholder: o.placeholder || '?',
    });
    const baris = el('div', { class: 'baris-isian' },
      o.awalan ? el('span', { class: 'awalan' }, o.awalan) : null, input, o.akhiran ? el('span', { class: 'akhiran' }, o.akhiran) : null);
    return { baris, input };
  }

  // Penyimpanan lokal yang aman (bisa gagal di mode privat)
  const Simpan = {
    ambil(kunci, bawaan) {
      try {
        const v = localStorage.getItem('sebangun:' + kunci);
        return v == null ? bawaan : JSON.parse(v);
      } catch (e) {
        return bawaan;
      }
    },
    taruh(kunci, nilai) {
      try {
        localStorage.setItem('sebangun:' + kunci, JSON.stringify(nilai));
      } catch (e) {
        /* abaikan */
      }
    },
  };

  function kurangiGerak() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  // Animasi 0 -> 1 dengan easing; mengembalikan fungsi pembatal
  function animasi(durasi, setiap, selesai) {
    if (kurangiGerak()) {
      setiap(1);
      if (selesai) selesai();
      return () => {};
    }
    const mulai = performance.now();
    let id = 0, batal = false;
    const jalan = (now) => {
      if (batal) return;
      const t = Math.min(1, (now - mulai) / durasi);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setiap(e);
      if (t < 1) id = requestAnimationFrame(jalan);
      else if (selesai) selesai();
    };
    id = requestAnimationFrame(jalan);
    return () => {
      batal = true;
      cancelAnimationFrame(id);
    };
  }

  // Tombol pilihan berderet (seperti tab). Mengembalikan {elemen, pilih(id)}
  function segmen(pilihan, aktif, ubah, label) {
    const wadah = el('div', { class: 'segmen', role: 'group', 'aria-label': label || 'Pilihan' });
    const tombolTombol = pilihan.map(([id, teks]) => {
      const b = el('button', { type: 'button', 'aria-pressed': String(id === aktif), onclick: () => pilih(id, true) }, teks);
      b.dataset.id = id;
      wadah.append(b);
      return b;
    });
    function pilih(id, dariKlik) {
      tombolTombol.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === String(id))));
      if (dariKlik) ubah(id);
    }
    return { elemen: wadah, pilih };
  }

  // Sakelar (checkbox bergaya)
  function sakelar(teks, nyala, ubah) {
    const input = el('input', { type: 'checkbox', role: 'switch' });
    input.checked = !!nyala;
    input.addEventListener('change', () => ubah(input.checked));
    return el('label', { class: 'sakelar' }, input, el('span', { class: 'jalur', 'aria-hidden': 'true' }), el('span', null, teks));
  }

  /**
   * Modul berlangkah: satu langkah per layar dengan titik kemajuan.
   * o: {id, nomor, judul, langkah:[{judul, teks, render(isi, ctx), kenapa}], ctx}
   */
  function modulLangkah(akar, o) {
    const ctx = o.ctx;
    const posisi = ctx.posisi;
    let i = Math.min(posisi[o.id] || 0, o.langkah.length - 1);
    let bersihLangkah = [];

    const kepala = el('header', { class: 'kepala-modul' },
      el('p', { class: 'label-kecil' }, `Modul ${o.nomor}`),
      el('h1', null, o.judul));
    const titik = el('nav', { class: 'titik-langkah', 'aria-label': 'Langkah dalam modul ini' });
    const kartu = el('section', { class: 'kartu langkah', 'aria-live': 'polite' });
    const kaki = el('div', { class: 'kaki-langkah' });
    akar.append(kepala, titik, kartu, kaki);

    function bersihkan() {
      bersihLangkah.forEach((f) => f());
      bersihLangkah = [];
    }
    ctx.bersih(bersihkan);

    function pindah(j) {
      i = Math.max(0, Math.min(o.langkah.length - 1, j));
      tampil();
      const atas = kepala.getBoundingClientRect().top;
      if (atas < 0) kepala.scrollIntoView({ behavior: kurangiGerak() ? 'auto' : 'smooth', block: 'start' });
      const h = kartu.querySelector('h2');
      if (h) h.focus({ preventScroll: true });
    }

    function tampil() {
      bersihkan();
      posisi[o.id] = i;
      titik.innerHTML = '';
      o.langkah.forEach((l, j) => {
        titik.append(el('button', {
          type: 'button',
          class: 'titik' + (j === i ? ' aktif' : '') + (j < i ? ' lewat' : ''),
          'aria-label': `Langkah ${j + 1}: ${l.judul}`,
          'aria-current': j === i ? 'step' : null,
          title: l.judul,
          onclick: () => pindah(j),
        }, String(j + 1)));
      });
      const L = o.langkah[i];
      kartu.innerHTML = '';
      kartu.append(
        el('p', { class: 'label-kecil' }, `Langkah ${i + 1} dari ${o.langkah.length}`),
        el('h2', { tabindex: '-1' }, L.judul)
      );
      if (L.teks) kartu.append(el('p', { class: 'teks-utama', html: L.teks }));
      const isi = el('div', { class: 'isi-langkah' });
      kartu.append(isi);
      if (L.render) L.render(isi, { bersih: (f) => bersihLangkah.push(f) });
      if (L.kenapa) kartu.append(kenapa(L.kenapa));

      kaki.innerHTML = '';
      const kembali = tombol('← Kembali', () => pindah(i - 1), 'sekunder');
      if (i === 0) kembali.style.visibility = 'hidden';
      kaki.append(kembali);
      if (i < o.langkah.length - 1) {
        kaki.append(tombol('Lanjut →', () => pindah(i + 1)));
      } else {
        kaki.append(tombol('Selesai ✓', () => ctx.selesai(o.id)));
      }
    }
    tampil();
  }

  global.Halaman = global.Halaman || {};
  global.UI = { el, tombol, kenapa, umpan, wadahGambar, inputAngka, Simpan, animasi, segmen, sakelar, modulLangkah, kurangiGerak };
})(window);
