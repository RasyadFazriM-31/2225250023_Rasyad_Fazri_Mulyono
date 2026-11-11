/* Modul 2 — Konsep sebangun: diperbesar/diperkecil, dua syarat, contoh bukan sebangun. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const L = Logika, G = Gambar, W = G.WARNA, F = L.formatAngka;

  // ---------- Langkah 1: rumah diperbesar ----------
  function langkahSkala(isi) {
    const RUMAH = [[0, 0], [4, 0], [4, 3], [2, 5], [0, 3]];
    const X0 = 5.5;
    let k = 2, tarik = false;
    const wadah = el('div', { class: 'wadah-gambar' });
    const slider = el('input', { type: 'range', min: '0.5', max: '2.5', step: '0.5', value: '2', 'aria-label': 'Faktor skala k' });
    const keluaran = el('output', { class: 'nilai-slider' }, '2');
    const tabel = el('div', { class: 'tabel-wadah' });
    const putusan = el('div', { class: 'umpan', role: 'status' });
    isi.append(
      wadah,
      el('div', { class: 'kontrol' },
        el('label', { class: 'slider' }, el('span', null, 'Faktor skala k ='), keluaran, slider),
        UI.sakelar('Tarik lebarnya saja', false, (v) => { tarik = v; gambar(); })),
      tabel, putusan);
    slider.addEventListener('input', () => {
      k = parseFloat(slider.value);
      gambar();
    });

    function gambar() {
      const ky = tarik ? 1 : k;
      const B = RUMAH.map(([x, y]) => [X0 + x * k, y * ky]);
      const sudut2 = L.besarSudut(B[3], B[2], B[4]);
      const warna = [W.biru, W.ungu, W.garis, W.garis, W.garis];
      wadah.innerHTML = G.render([
        ...G.bangun(RUMAH, { warnaSisi: warna, busur: [0, 0, 0, 1, 0], teksSudut: [null, null, null, '90°'], labelSisi: ['4', '3'] }),
        ...G.bangun(B, { warnaSisi: warna, busur: [0, 0, 0, 1, 0], teksSudut: [null, null, null, F(sudut2, 0) + '°'], labelSisi: [F(4 * k), F(3 * ky)] }),
        { t: 'teks', p: [2, 0], teks: 'Rumah 1', arah: [0, -1], jarak: 30, tipis: true, ukuran: 13 },
        { t: 'teks', p: [X0 + 2 * k, 0], teks: 'Rumah 2', arah: [0, -1], jarak: 30, tipis: true, ukuran: 13 },
      ], { lebar: 480, tinggi: 340, batas: [0, -0.8, X0 + 4 * 2.5, 5 * 2.5], label: 'Rumah 1 dan rumah 2 di kertas berpetak' });

      const sama = !tarik || k === 1;
      keluaran.textContent = F(k);
      tabel.innerHTML = `<table class="tabel">
        <thead><tr><th></th><th>Rumah 1</th><th>Rumah 2</th><th>Dikali</th></tr></thead>
        <tbody>
          <tr><th><span class="c0">Lantai</span></th><td>4</td><td>${F(4 * k)}</td><td>× ${F(k)}</td></tr>
          <tr><th><span class="c1">Dinding</span></th><td>3</td><td>${F(3 * ky)}</td><td>× ${F(ky)}</td></tr>
          <tr><th>Sudut atap</th><td>90°</td><td>${F(sudut2, 0)}°</td><td>${sama ? 'sama' : 'berubah'}</td></tr>
        </tbody></table>`;
      UI.umpan(putusan, sama ? 'benar' : 'salah', sama
        ? `<b>Sebangun.</b> Semua sisi dikali ${F(k)}, sudutnya tetap.`
        : '<b>Tidak sebangun.</b> Lantai dan dinding dikali dengan angka berbeda, jadi bentuknya berubah (gepeng).');
    }
    gambar();
  }

  // ---------- Langkah 2: dua syarat ----------
  function langkahDuaSyarat(isi) {
    const abc = L.segitigaDariSisi(5, 4, 6);
    const pqr = G.letakkanKanan(abc, G.transformasi(abc, { skala: 1.5 }), 1.5);
    const g1 = G.render([
      ...G.bangun(abc, { nama: ['A', 'B', 'C'], busur: [1, 2, 3] }),
      ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], busur: [1, 2, 3] }),
    ], { lebar: 420, tinggi: 220, pad: 28, label: 'Sudut yang bersesuaian sama besar' });
    const g2 = G.render([
      ...G.bangun(abc, { nama: ['A', 'B', 'C'], warnaSisi: G.PASANGAN, labelSisi: ['6', '5', '4'] }),
      ...G.bangun(pqr, { nama: ['P', 'Q', 'R'], warnaSisi: G.PASANGAN, labelSisi: ['9', '7,5', '6'] }),
    ], { lebar: 420, tinggi: 220, pad: 28, label: 'Sisi yang bersesuaian sebanding' });
    isi.append(el('div', { class: 'dua-kolom' },
      el('div', { class: 'kartu-syarat' },
        el('p', { class: 'nomor-syarat' }, 'Syarat 1'),
        el('h3', null, 'Sudut-sudut yang bersesuaian sama besar'),
        el('div', { class: 'wadah-gambar', html: g1 }),
        el('p', { class: 'catatan' }, 'Jumlah busur sama = besar sudut sama.')),
      el('div', { class: 'kartu-syarat' },
        el('p', { class: 'nomor-syarat' }, 'Syarat 2'),
        el('h3', null, 'Sisi-sisi yang bersesuaian sebanding'),
        el('div', { class: 'wadah-gambar', html: g2 }),
        el('div', { class: 'rumus', html: '<span class="pec"><span class="c0">9</span><span class="c0">6</span></span> = <span class="pec"><span class="c1">7,5</span><span class="c1">5</span></span> = <span class="pec"><span class="c2">6</span><span class="c2">4</span></span> = 1,5' }))),
    el('p', { class: 'kotak-inti' }, 'Sebangun ditulis ', el('b', null, 'ΔABC ∼ ΔPQR'), '. Urutan hurufnya menunjukkan pasangan: A↔P, B↔Q, C↔R.'));
  }

  // ---------- Langkah 3: harus dua-duanya ----------
  function langkahDuaDuanya(isi) {
    const KASUS = {
      ketupat: {
        judul: 'Persegi & belah ketupat',
        gambar: () => {
          const A = [[0, 0], [3, 0], [3, 3], [0, 3]];
          const t = 3 * Math.sqrt(3) / 2;
          const B = [[5, 0], [8, 0], [9.5, t], [6.5, t]];
          return G.render([
            ...G.bangun(A, { nama: ['A', 'B', 'C', 'D'], busur: ['siku', 0, 0, 0], teksSudut: ['90°'], labelSisi: ['3', '3', '3', '3'] }),
            ...G.bangun(B, { nama: ['P', 'Q', 'R', 'S'], busur: [1, 2, 0, 0], teksSudut: ['60°', '120°'], labelSisi: ['3', '3', '3', '3'] }),
          ], { lebar: 480, tinggi: 230, label: 'Persegi dan belah ketupat dengan sisi 3' });
        },
        sisi: [true, 'Semua sisi 3 → perbandingan 3/3 = 1, sama.'],
        sudut: [false, 'Persegi 90°, belah ketupat 60° dan 120°.'],
      },
      pp: {
        judul: 'Dua persegi panjang',
        gambar: () => G.render([
          ...G.bangun([[0, 0], [6, 0], [6, 2], [0, 2]], { nama: ['A', 'B', 'C', 'D'], busur: ['siku', 'siku', 'siku', 'siku'], labelSisi: ['6', '2'], warnaSisi: [W.biru, W.ungu, W.biru, W.ungu] }),
          ...G.bangun([[8, 0], [12, 0], [12, 3], [8, 3]], { nama: ['P', 'Q', 'R', 'S'], busur: ['siku', 'siku', 'siku', 'siku'], labelSisi: ['4', '3'], warnaSisi: [W.biru, W.ungu, W.biru, W.ungu] }),
        ], { lebar: 480, tinggi: 200, label: 'Persegi panjang 6 kali 2 dan 4 kali 3' }),
        sisi: [false, `<span class="c0">panjang</span> 4/6 ≈ 0,67 tetapi <span class="c1">lebar</span> 3/2 = 1,5. Berbeda.`],
        sudut: [true, 'Semua sudut 90°, sama.'],
      },
      ya: {
        judul: 'Yang sebangun',
        gambar: () => G.render([
          ...G.bangun([[0, 0], [4, 0], [4, 2], [0, 2]], { nama: ['A', 'B', 'C', 'D'], busur: ['siku', 'siku', 'siku', 'siku'], labelSisi: ['4', '2'], warnaSisi: [W.biru, W.ungu, W.biru, W.ungu] }),
          ...G.bangun([[6, 0], [12, 0], [12, 3], [6, 3]], { nama: ['P', 'Q', 'R', 'S'], busur: ['siku', 'siku', 'siku', 'siku'], labelSisi: ['6', '3'], warnaSisi: [W.biru, W.ungu, W.biru, W.ungu] }),
        ], { lebar: 480, tinggi: 200, label: 'Persegi panjang 4 kali 2 dan 6 kali 3' }),
        sisi: [true, `<span class="c0">panjang</span> 6/4 = 1,5 dan <span class="c1">lebar</span> 3/2 = 1,5. Sama.`],
        sudut: [true, 'Semua sudut 90°, sama.'],
      },
    };
    const wadahGambar = el('div', { class: 'wadah-gambar' });
    const daftar = el('ul', { class: 'daftar-cek' });
    const putusan = el('div', { class: 'umpan', role: 'status' });
    const seg = UI.segmen(Object.keys(KASUS).map((id) => [id, KASUS[id].judul]), 'ketupat', tampil, 'Pilih contoh');
    isi.append(seg.elemen, wadahGambar, daftar, putusan);
    function tampil(id) {
      const c = KASUS[id];
      wadahGambar.innerHTML = c.gambar();
      const baris = (ok, judul, teks) => `<li class="${ok ? 'ok' : 'tidak'}"><span class="tanda" aria-hidden="true">${ok ? '✓' : '✗'}</span><div><b>${judul}</b> ${ok ? '' : '<span class="sr">(tidak terpenuhi)</span>'}<br>${teks}</div></li>`;
      daftar.innerHTML = baris(c.sudut[0], 'Sudut sama besar?', c.sudut[1]) + baris(c.sisi[0], 'Sisi sebanding?', c.sisi[1]);
      const ok = c.sudut[0] && c.sisi[0];
      UI.umpan(putusan, ok ? 'benar' : 'salah', ok ? '<b>Sebangun</b>, karena kedua syarat terpenuhi.' : '<b>Tidak sebangun</b>, karena ada syarat yang tidak terpenuhi.');
    }
    tampil('ketupat');
  }

  // ---------- Langkah 4: cek sendiri ----------
  function langkahCek(isi) {
    const URUT = ['ppSebangun', 'ppTambah', 'ppBeda'];
    let nomor = 0;
    const kepala = el('p', { class: 'label-kecil' });
    const kotak = el('div', { class: 'kuis-kecil' });
    isi.append(kepala, kotak);
    function baru() {
      const varian = nomor < URUT.length ? URUT[L.acakInt(0, URUT.length - 1)] : L.pilih(URUT);
      nomor++;
      kepala.textContent = `Soal ${nomor}`;
      kotak.innerHTML = '';
      kotak.append(PemainSoal.coba(BankSoal.buat('sebangunAtauTidak', { varian }), {
        onBaru: baru, teksBaru: 'Soal lain',
      }).elemen);
    }
    baru();
  }

  window.Halaman.konsep = function (akar, ctx) {
    UI.modulLangkah(akar, {
      id: 'konsep', nomor: 2, judul: 'Apa itu sebangun?', ctx,
      langkah: [
        {
          judul: 'Bentuk sama, ukuran boleh beda',
          teks: 'Geser faktor skala. Hitung kotaknya: semua sisi dikali angka yang sama.',
          render: langkahSkala,
          kenapa: 'Seperti foto yang diperbesar: semua bagian membesar dengan kelipatan yang sama, jadi bentuknya tidak berubah. Kalau hanya lebarnya yang ditarik, fotonya jadi gepeng.',
        },
        { judul: 'Dua syarat sebangun', teks: 'Dua bangun sebangun jika memenuhi <b>kedua</b> syarat ini.', render: langkahDuaSyarat },
        {
          judul: 'Harus dua-duanya!',
          teks: 'Satu syarat saja belum cukup. Pilih contoh di bawah.',
          render: langkahDuaDuanya,
          kenapa: 'Persegi dan belah ketupat sama-sama punya 4 sisi sama panjang, tetapi sudutnya berbeda. Jadi bentuknya tidak sama.',
        },
        { judul: 'Cek sendiri', teks: 'Sebangun atau tidak? Bandingkan panjang dengan panjang, lebar dengan lebar.', render: langkahCek },
      ],
    });
  };
})();
