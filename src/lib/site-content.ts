/**
 * Seluruh teks tetap & tautan situs DSC.
 *
 * Semua kalimat di sini disalin apa adanya dari desain Figma tim desainer
 * (prototipe "UKM Developer Student Club"), supaya komponen tinggal merakit
 * tampilan dan tidak ada lagi teks yang ditulis ulang di dalam JSX.
 *
 * Kalau panitia mau mengganti narasi atau nomor kontak, cukup ubah file ini —
 * tidak perlu menyentuh komponen.
 */

/** Kontak resmi DSC. Ganti ke data asli panitia. */
export const KONTAK = {
  email: "dscuniversitasmulia@gmail.com",
  telepon: "+62 812-3456-789",
  /** Nomor tanpa tanda baca, dipakai untuk tautan wa.me. */
  whatsappNumber: "628123456789",
  jadwal: "Rabu, 15:30 - 17:30 WITA",
} as const;

/** Tautan kanal sosial. Kosongkan ("") kalau kanalnya belum ada. */
export const SOSIAL = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
} as const;

export const HERO = {
  judul: "UKM Developer Student Club",
  deskripsi:
    "Selamat datang di UKM Developer Student Club. Kami adalah wadah kolaborasi bagi mahasiswa untuk bereksplorasi, merancang arsitektur sistem yang handal, dan menulis kode yang memecahkan masalah dunia nyata. Mari ubah ide menjadi teknologi yang berdampak.",
  ctaLabel: "Ayo Bergabung!",
  /**
   * Path foto kegiatan untuk hero — relatif ke folder `public`.
   * Contoh: setelah menaruh berkas di `public/images/hero-club.jpg`, isi
   * dengan "/images/hero-club.jpg". Selama kosong, hero menampilkan bingkai
   * gradien + logo DSC, bukan gambar rusak.
   */
  foto: "",
} as const;

export const TENTANG = {
  eyebrow: "Tentang Kami",
  judul: "Developer Student Club",
  paragraf:
    "UKM Developer Student Club (DSC) adalah ekosistem inovasi di mana mahasiswa berkumpul untuk menerjemahkan ide menjadi teknologi nyata. Kami bukan sekadar tempat menghafal teori. Di sini, kita berkolaborasi merancang antarmuka UI/UX yang intuitif, membangun arsitektur backend yang tangguh, hingga mengoptimalkan performa database untuk aplikasi berskala besar. DSC adalah ruang aman bagi talenta digital untuk bereksperimen, melakukan debugging bersama, dan meluncurkan produk yang siap bersaing di industri.",
} as const;

/**
 * Angka statistik.
 *
 * "Anggota aktif" dan "Kegiatan per tahun" dihitung dari database (jumlah baris
 * tabel `members` dan `events`). Dua angka sisanya memang data administrasi
 * yang tidak ada di database, jadi ditulis manual di sini.
 *
 * `cadangan*` dipakai kalau database masih kosong / belum terhubung, supaya
 * section statistik tidak menampilkan "0+" di halaman yang sudah tayang.
 */
export const STATISTIK = {
  anggotaCadangan: 10,
  tahunBerkarya: 5,
  kegiatanCadangan: 48,
  prestasi: 9,
} as const;

export const VISI_MISI = {
  judul: "Visi & Misi",
  subjudul: "Arah yang kami tuju bersama",
  visiJudul: "Visi",
  visi: "Menciptakan ekosistem inovasi digital di kampus untuk melahirkan talenta teknologi yang kolaboratif, kompeten, dan siap memberikan dampak nyata bagi masyarakat.",
  misi: [
    {
      judul: "Belajar Tanpa Batas",
      deskripsi:
        "Menyelenggarakan kelas, workshop, dan mentoring agar setiap anggota, dari pemula hingga mahir, bisa berkembang.",
    },
    {
      judul: "Kolaborasi Aktif",
      deskripsi:
        "Membangun budaya kerja tim antardisiplin untuk merancang dan mengembangkan portofolio produk digital secara kolektif.",
    },
    {
      judul: "Inkubasi Inovasi",
      deskripsi:
        "Menjadi ruang eksperimen bagi ide-ide mahasiswa agar dapat direalisasikan menjadi produk yang berguna.",
    },
  ],
} as const;

export const ANGGOTA = {
  eyebrow: "Anggota",
  judul: "Meet the Core Team!",
  deskripsi:
    "Kenalin, ini dia orang-orang di balik layar (dan di balik kamera) yang selalu sibuk mastiin semua kegiatan UKM DSC berjalan seru, terdokumentasi dengan apik, dan tentunya bebas error.",
} as const;

export const GALERI = {
  judul: "Galeri",
  subjudul: "Kegiatan-Kegiatan",
  deskripsi:
    "Dokumentasi kegiatan UKM DSC — dari study session, workshop, sampai demo day.",
} as const;

export const LEADERBOARD = {
  eyebrow: "Peringkat",
  judul: "Leaderboard",
  subjudul: "Top Contributors Minggu Ini",
  deskripsi:
    "Poin dikumpulkan dari kehadiran kegiatan, kontribusi proyek, dan bantuan di kelas.",
} as const;

export const FEEDBACK = {
  judul: "Feedback",
  deskripsi: "Anggota maupun bukan, semua masukan berharga untuk kami.",
  placeholder: "Tulis kesan dan saran disini!",
  tombol: "Kirim Feedback",
} as const;

/**
 * Testimoni di sebelah form feedback.
 *
 * Belum ada tabelnya di database, jadi isinya tetap seperti di desain. Kalau
 * nanti mau diambil dari database, tinggal ganti sumber datanya di section.
 */
export const TESTIMONI = [
  {
    nama: "Musang",
    pesan:
      "DSC ngajarin aku dari nol banget. Sekarang aku udah bisa bikin aplikasi sendiri buat tugas akhir.",
  },
  {
    nama: "Monyet",
    pesan:
      "Belajar bareng di sini bikin materi susah jadi lebih gampang masuk. Sering ada study session yang seru buat eksplorasi teknologi baru.",
  },
  {
    nama: "Kusylink",
    pesan:
      "Lingkungannya asik banget buat belajar desain. Kalau lagi mentok bikin prototype atau butuh feedback, selalu ada teman diskusi yang solutif.",
  },
] as const;

export const CTA = {
  judul: "Udah Siap Ngoding Bareng Kita?",
  paragraf:
    "Daripada pusing debugging sendirian di kamar, mending gabung DSC. Kita belajar bareng, bikin projek seru, dan pastinya nambah koneksi!",
  label: "Hubungi kami",
} as const;

export const FOOTER = {
  brandUtama: "DSC",
  brandKecil: "DEVELOPER CLUBS",
  kolom: [
    {
      judul: "Quick Links",
      tautan: [
        { label: "Tentang Kami", id: "tentang-kami" },
        { label: "Visi & Misi", id: "visi-misi" },
        { label: "Anggota", id: "anggota" },
      ],
    },
    {
      judul: "Support",
      tautan: [
        { label: "Galeri", id: "galeri" },
        { label: "Leaderboard", id: "leaderboard" },
        { label: "Feedback", id: "feedback" },
      ],
    },
  ],
  hakCipta: "© 2026 dscmulia.id. All rights reserved.",
} as const;
