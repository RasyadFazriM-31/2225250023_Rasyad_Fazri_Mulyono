/* Modul 1 — Prasyarat: perbandingan, menyederhanakan, senilai, kali silang. */
(function () {
  'use strict';
  const { el, tombol } = UI;
  const L = Logika, G = Gambar;

  // Kuis kecil yang bisa diganti soalnya
  function kuisKecil(wadah, tipe, judul) {
    const kotak = el('div', { class: 'kuis-kecil' });
    wadah.append(el('p', { class: 'label-kecil' }, judul || 'Coba sendiri'), kotak);
    function baru() {
      kotak.innerHTML = '';
      kotak.append(PemainSoal.coba(BankSoal.buat(tipe), { onBaru: baru }).elemen);
    }
    baru();
  }

  // ---------- Langkah 1: balok perbandingan ----------
  function langkahBalok(isi) {
    const PASANGAN = [[5, 10], [6, 9], [4, 6], [6, 8], [4, 10], [3, 9], [8, 12], [6, 10], [2, 8]];
    let [a, b] = PASANGAN[0];
    let dikelompokkan = false;
    const S = 26, J = 6, JK = 20, BARIS2 = S + J + 18;
    const wadah = el('div', { class: 'wadah-gambar balok-wadah' });
    const ket = el('p', { class: 'keterangan-besar', 'aria-live': 'polite' });
    const tKelompok = tombol('Kelompokkan', () => {
      dikelompokkan = !dikelompokkan;
      atur(false);
    });
    const tGanti = tombol('Ganti angka', () => {
      let baru;
      do baru = L.pilih(PASANGAN); while (baru[0] === a && baru[1] === b);
      [a, b] = baru;
      dikelompokkan = false;
      bangunUlang();
    }, 'sekunder');
    isi.append(wadah, ket, el('div', { class: 'deret-tombol' }, tKelompok, tGanti));

    function hitung() {
      const g = L.fpb(a, b), pa = a / g, pb = b / g, gw = Math.max(pa, pb);
      const lebarKel = gw * (S + J) + JK;
      const pos = [];
      for (let i = 0; i < a; i++) {
        pos.push(dikelompokkan ? [Math.floor(i / pa) * lebarKel + (i % pa) * (S + J), 0] : [i * (S + J), 0]);
      }
      for (let j = 0; j < b; j++) {
        pos.push(dikelompokkan ? [Math.floor(j / pb) * lebarKel + (j % pb) * (S + J), BARIS2] : [j * (S + J), BARIS2]);
      }
      return { pos, g, pa, pb, gw, lebarKel };
    }

    function bangunUlang() {
      const { g, gw, lebarKel } = hitung();
      const lebar = Math.max(Math.max(a, b) * (S + J), g * lebarKel) + 24;
      const tinggi = BARIS2 + S + 28;
      let s = `<svg class="gambar" viewBox="-12 -14 ${lebar} ${tinggi}" role="img" aria-label="${a} kotak biru dan ${b} kotak ungu">`;
      for (let k = 0; k < g; k++) {
        s += `<rect class="bingkai-kelompok" x="${k * lebarKel - 7}" y="-7" width="${gw * (S + J) - J + 14}" height="${BARIS2 + S + 14}" rx="10"/>`;
      }
      for (let i = 0; i < a; i++) s += `<rect class="balok" width="${S}" height="${S}" rx="6" fill="${G.WARNA.biru}"/>`;
      for (let j = 0; j < b; j++) s += `<rect class="balok" width="${S}" height="${S}" rx="6" fill="${G.WARNA.ungu}"/>`;
      wadah.innerHTML = s + '</svg>';
      atur(true);
    }

    function atur(langsung) {
      const { pos, g, pa, pb } = hitung();
      wadah.querySelectorAll('.balok').forEach((r, i) => {
        r.style.transition = langsung ? 'none' : '';
        r.style.transform = `translate(${pos[i][0]}px, ${pos[i][1]}px)`;
      });
      wadah.querySelector('svg').classList.toggle('terkelompok', dikelompokkan);
      ket.innerHTML = dikelompokkan
        ? `Ada <b>${g} kelompok</b>. Tiap kelompok: <b class="c0">${pa} biru</b> dan <b class="c1">${pb} ungu</b>.<br>Jadi <b>${a} : ${b} = ${pa} : ${pb}</b>`
        : `<b class="c0">${a} biru</b> dan <b class="c1">${b} ungu</b>. Perbandingannya <b>${a} : ${b}</b>`;
      tKelompok.textContent = dikelompokkan ? 'Urai lagi' : 'Kelompokkan';
    }
    bangunUlang();
  }

  // ---------- Langkah 2: menyederhanakan ----------
  function langkahSederhana(isi) {
    isi.append(
      el('div', { class: 'peraga-bagi', role: 'img', 'aria-label': '5 banding 10, keduanya dibagi 5, menjadi 1 banding 2' },
        el('div', { class: 'baris-bagi' }, el('span', null, '5'), el('span', null, ':'), el('span', null, '10')),
        el('div', { class: 'baris-bagi panah' }, el('span', null, '÷5'), el('span'), el('span', null, '÷5')),
        el('div', { class: 'baris-bagi hasil' }, el('span', null, '1'), el('span', null, ':'), el('span', null, '2'))),
      el('p', { class: 'catatan' }, 'FPB dari 5 dan 10 adalah 5. Bagi keduanya dengan angka yang sama.'));
    kuisKecil(isi, 'sederhanakanRasio');
  }

  // ---------- Langkah 3: senilai ----------
  function langkahSenilai(isi) {
    isi.append(
      el('div', { class: 'rumus besar' }, '2 : 4', el('span', { class: 'sama' }, '='), '3 : 6', el('span', { class: 'sama' }, '='), el('b', null, '1 : 2')),
      el('p', { class: 'catatan' }, 'Ketiganya senilai karena bentuk paling sederhananya sama: 1 : 2.'));
    kuisKecil(isi, 'senilaiAtauTidak');
  }

  // ---------- Langkah 4: kali silang ----------
  function langkahKaliSilang(isi) {
    let tahap = 0;
    const svgPersamaan = (silang) => {
      const garis = silang
        ? `<line x1="62" y1="42" x2="176" y2="104" stroke="${G.WARNA.biru}" stroke-width="3" stroke-linecap="round" class="garis-silang"/>
           <line x1="62" y1="104" x2="176" y2="42" stroke="${G.WARNA.ungu}" stroke-width="3" stroke-linecap="round" class="garis-silang"/>`
        : '';
      return `<svg class="gambar persamaan" viewBox="0 0 240 150" role="img" aria-label="2 per 3 sama dengan x per 12">
        ${garis}
        <g font-size="30" font-weight="800" text-anchor="middle" fill="#0f172a">
          <text x="50" y="50">2</text><text x="50" y="112">3</text>
          <line x1="28" y1="72" x2="72" y2="72" stroke="#0f172a" stroke-width="3"/>
          <text x="120" y="84">=</text>
          <text x="190" y="50">x</text><text x="190" y="112">12</text>
          <line x1="166" y1="72" x2="214" y2="72" stroke="#0f172a" stroke-width="3"/>
        </g></svg>`;
    };
    const gambar = el('div', { class: 'wadah-gambar kecil' });
    const daftar = el('ol', { class: 'daftar-langkah' });
    const LANGKAH = [
      { judul: 'Kalikan menyilang', isi: `<div class="rumus"><span class="c0">2 × 12</span> = <span class="c1">3 × x</span></div>` },
      { judul: 'Hitung yang sudah diketahui', isi: '<div class="rumus">24 = 3 × x</div>' },
      { judul: 'Bagi kedua ruas dengan 3', isi: '<div class="rumus">x = 24 ÷ 3 = <b>8</b></div>' },
    ];
    const t = tombol('Tunjukkan langkah 1', maju);
    isi.append(gambar, daftar, el('div', { class: 'deret-tombol' }, t));
    gambar.innerHTML = svgPersamaan(false);
    function maju() {
      if (tahap === 0) gambar.innerHTML = svgPersamaan(true);
      const l = LANGKAH[tahap++];
      daftar.append(el('li', { class: 'langkah-soal muncul' },
        el('span', { class: 'nomor-langkah' }, String(tahap)),
        el('div', null, el('b', { class: 'judul-langkah' }, l.judul), el('div', { class: 'isi', html: l.isi }))));
      if (tahap >= LANGKAH.length) {
        t.parentElement.remove();
        kuisKecil(isi, 'cariXPerbandingan', 'Sekarang kamu');
      } else {
        t.textContent = `Tunjukkan langkah ${tahap + 1}`;
      }
    }
  }

  window.Halaman.prasyarat = function (akar, ctx) {
    UI.modulLangkah(akar, {
      id: 'prasyarat', nomor: 1, judul: 'Perbandingan', ctx,
      langkah: [
        {
          judul: 'Apa itu perbandingan?',
          teks: 'Perbandingan membandingkan dua nilai. Ditulis <b>a : b</b>.',
          render: langkahBalok,
          kenapa: 'Kesebangunan selalu memakai perbandingan sisi. Kalau perbandingannya lancar, kesebangunan jadi jauh lebih mudah.',
        },
        { judul: 'Menyederhanakan', teks: 'Bagi kedua angka dengan <b>FPB</b>-nya.', render: langkahSederhana },
        { judul: 'Perbandingan senilai', teks: 'Dua perbandingan <b>senilai</b> jika bentuk paling sederhananya sama.', render: langkahSenilai },
        {
          judul: 'Perkalian silang',
          teks: 'Jika <span class="pec"><span>a</span><span>b</span></span> = <span class="pec"><span>c</span><span>d</span></span>, maka <b>a × d = b × c</b>.',
          render: langkahKaliSilang,
          kenapa: 'Kali silang dipakai untuk mencari sisi yang belum diketahui. Langkah ini akan muncul di hampir semua soal kesebangunan.',
        },
      ],
    });
  };
})();
