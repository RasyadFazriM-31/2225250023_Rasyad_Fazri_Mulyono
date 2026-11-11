/*
 * pemain-soal.js
 * Menampilkan satu soal dari BankSoal dalam dua mode:
 *   - lihat(): contoh soal, langkah dibuka satu per satu (worked example)
 *   - coba():  siswa menjawab sendiri, petunjuk bisa dibuka bertahap
 */
(function (global) {
  'use strict';
  const { el, tombol, kenapa, umpan, inputAngka, animasi } = global.UI;
  const L = global.Logika;

  // Mengatur gambar soal + animasi "pisahkan"
  function pengelolaGambar(wadah, soal, awal) {
    let st = Object.assign({}, awal);
    st.t = st.pisah ? 1 : 0;
    let batal = null;
    const gambar = () => {
      wadah.innerHTML = soal.gambar(st);
    };
    gambar();
    return {
      set(ubah) {
        const sebelum = !!st.pisah;
        st = Object.assign({}, st, ubah);
        const sesudah = !!st.pisah;
        if (soal.animasi && sebelum !== sesudah) {
          if (batal) batal();
          const dari = sesudah ? 0 : 1, ke = sesudah ? 1 : 0;
          batal = animasi(900, (e) => {
            st.t = dari + (ke - dari) * e;
            gambar();
          });
        } else {
          st.t = sesudah ? 1 : 0;
          wadah.classList.remove('ganti');
          void wadah.offsetWidth;
          wadah.classList.add('ganti');
          gambar();
        }
      },
    };
  }

  function itemLangkah(l, nomor) {
    const li = el('li', { class: 'langkah-soal muncul' },
      el('span', { class: 'nomor-langkah', 'aria-hidden': 'true' }, String(nomor)),
      el('div', null, el('b', { class: 'judul-langkah' }, l.judul), el('div', { class: 'isi', html: l.isi }), l.kenapa ? kenapa(l.kenapa) : null));
    return li;
  }

  function kotakCek(soal) {
    return el('div', { class: 'cek muncul' },
      el('p', { class: 'judul-cek' }, el('span', { 'aria-hidden': 'true' }, '✓ '), 'Cek dengan sifat sebangun'),
      el('div', { html: soal.cek }));
  }

  /**
   * Mode contoh: langkah dibuka satu per satu.
   * opsi: {onSelesai()}
   */
  function lihat(soal, opsi) {
    opsi = opsi || {};
    const akar = el('div', { class: 'pemain' });
    let gambar = null;
    if (soal.gambar) {
      const w = el('div', { class: 'wadah-gambar' });
      akar.append(w);
      gambar = pengelolaGambar(w, soal, { warna: true });
    }
    akar.append(el('p', { class: 'pertanyaan', html: soal.pertanyaan }));
    const daftar = el('ol', { class: 'daftar-langkah' });
    const akhir = el('div');
    let dibuka = 0;
    const n = soal.langkah.length;
    const tLanjut = tombol(`Langkah berikutnya (1/${n})`, buka);
    const tSemua = tombol('Buka semua', () => {
      while (dibuka < n) buka(true);
    }, 'teks');
    const deret = el('div', { class: 'deret-tombol' }, tLanjut, tSemua);
    akar.append(daftar, deret, akhir);

    function buka(cepat) {
      if (dibuka >= n) return;
      const l = soal.langkah[dibuka++];
      const li = itemLangkah(l, dibuka);
      daftar.append(li);
      if (l.gambar && gambar) gambar.set(l.gambar);
      if (dibuka < n) {
        tLanjut.textContent = `Langkah berikutnya (${dibuka + 1}/${n})`;
      } else {
        deret.remove();
        akhir.append(kotakCek(soal));
        if (opsi.onSelesai) opsi.onSelesai(akhir);
      }
      if (cepat !== true) li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return { elemen: akar };
  }

  /**
   * Mode coba sendiri.
   * opsi: {warna (bantuan warna), onSelesai({benarPertama}), onBaru, teksBaru}
   */
  function coba(soal, opsi) {
    opsi = opsi || {};
    const pakaiWarna = opsi.warna !== false;
    const akar = el('div', { class: 'pemain' + (pakaiWarna ? '' : ' tanpa-warna') });
    let gambar = null;
    if (soal.gambar) {
      const w = el('div', { class: 'wadah-gambar' });
      akar.append(w);
      gambar = pengelolaGambar(w, soal, { warna: pakaiWarna && !soal.bocor });
    }
    akar.append(el('p', { class: 'pertanyaan', html: soal.pertanyaan }));

    const areaJawab = el('div', { class: 'area-jawab' });
    const fb = el('div', { class: 'umpan', hidden: true, role: 'status' });
    const daftarPetunjuk = el('ol', { class: 'daftar-langkah' });
    const wadahCek = el('div');
    let percobaan = 0, petunjuk = 0, selesai = false;
    const n = soal.langkah.length;
    let ambil, fokusAwal;
    const masukan = [];

    if (soal.jenis === 'angka') {
      const { baris, input } = inputAngka(soal.isian);
      masukan.push(input);
      areaJawab.append(baris);
      ambil = () => L.parseAngka(input.value);
      fokusAwal = input;
    } else if (soal.jenis === 'rasio') {
      const a = inputAngka({ label: 'Angka kiri' }), b = inputAngka({ label: 'Angka kanan' });
      masukan.push(a.input, b.input);
      areaJawab.append(el('div', { class: 'baris-isian' }, a.input, el('span', { class: 'titik-dua' }, ':'), b.input));
      ambil = () => [L.parseAngka(a.input.value), L.parseAngka(b.input.value)];
      fokusAwal = a.input;
    } else {
      const grup = el('div', { class: 'pilihan-ganda', role: 'group', 'aria-label': 'Pilihan jawaban' });
      soal.pilihan.forEach((teks, idx) => {
        const b = el('button', { type: 'button', class: 'opsi', onclick: () => periksa(idx, b) }, teks);
        masukan.push(b);
        grup.append(b);
      });
      areaJawab.append(grup);
    }
    masukan.forEach((m) => {
      if (m.tagName === 'INPUT') m.addEventListener('keydown', (e) => { if (e.key === 'Enter') periksa(); });
    });

    const tPeriksa = soal.jenis !== 'pilihan' ? tombol('Periksa', () => periksa()) : null;
    const tPetunjuk = tombol(`Petunjuk (0/${n})`, bukaPetunjuk, 'sekunder');
    const tBaru = opsi.onBaru ? tombol(opsi.teksBaru || 'Soal lain', opsi.onBaru, 'teks') : null;
    const deret = el('div', { class: 'deret-tombol' }, tPeriksa, tPetunjuk, tBaru);
    akar.append(areaJawab, deret, fb, daftarPetunjuk, wadahCek);

    function bukaPetunjuk() {
      if (petunjuk >= n) return;
      const l = soal.langkah[petunjuk++];
      daftarPetunjuk.append(itemLangkah(l, petunjuk));
      if (l.gambar && gambar) gambar.set(l.gambar);
      // petunjuk adalah bantuan: warna sisi dinyalakan lagi
      if (!pakaiWarna) {
        akar.classList.remove('tanpa-warna');
        if (gambar && !soal.bocor) gambar.set({ warna: true });
      }
      tPetunjuk.textContent = petunjuk >= n ? 'Semua petunjuk terbuka' : `Petunjuk berikutnya (${petunjuk}/${n})`;
      tPetunjuk.disabled = petunjuk >= n;
    }

    function periksa(pilihanIdx, tombolOpsi) {
      if (selesai) return;
      const jawaban = soal.jenis === 'pilihan' ? pilihanIdx : ambil();
      const hasil = global.BankSoal.periksa(soal, jawaban);
      percobaan++;
      if (hasil.benar) {
        selesai = true;
        const pertama = percobaan === 1 && petunjuk === 0;
        umpan(fb, 'benar', pertama ? 'Benar! Hebat.' : 'Benar!');
        if (tombolOpsi) tombolOpsi.classList.add('benar');
        masukan.forEach((m) => (m.disabled = true));
        if (tPeriksa) tPeriksa.remove();
        tPetunjuk.remove();
        wadahCek.append(kotakCek(soal));
        if (gambar) gambar.set({ warna: true, jawab: true });
        if (opsi.onSelesai) opsi.onSelesai({ benarPertama: pertama, wadah: wadahCek });
      } else {
        umpan(fb, 'salah', hasil.pesan || 'Belum tepat. Coba lagi.');
        if (tombolOpsi) {
          tombolOpsi.classList.add('salah');
          tombolOpsi.disabled = true;
        }
      }
    }

    return {
      elemen: akar,
      fokus() {
        // di layar sentuh, fokus otomatis memunculkan keyboard dan menutupi gambar
        let mouse = false;
        try { mouse = window.matchMedia('(pointer: fine)').matches; } catch (e) { /* abaikan */ }
        if (fokusAwal && mouse) fokusAwal.focus({ preventScroll: true });
      },
    };
  }

  global.PemainSoal = { lihat, coba };
})(window);
