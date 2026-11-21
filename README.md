# DSC Profile — Website Profil Developer Student Club

Repositori ini berisi website profil Developer Student Club: frontend dan backend dalam satu proyek **Next.js (App Router)**, dengan **Supabase (PostgreSQL)** sebagai database dan penyimpanan gambar.

## 🛠️ Teknologi

| Bagian | Teknologi |
|---|---|
| Framework | Next.js **16.3.6** (App Router, Turbopack) |
| Bahasa | TypeScript 5 |
| UI | React 19.2 + Tailwind CSS v4 |
| Database & Storage | Supabase (PostgreSQL + Storage) |
| Keamanan API | Bearer token di `src/proxy.ts` + Row Level Security |

> ⚠️ **Proyek ini memakai Next.js 16, bukan 14.** Ada beberapa perbedaan penting: `middleware.ts` sudah berganti nama menjadi `proxy.ts`, `params` pada route handler dan page **wajib** di-`await`, dan `next lint` sudah dihapus. Lihat [AUDIT.md](./AUDIT.md) bagian D.

---

## ⚙️ Persyaratan

- **Node.js 20.9 atau lebih baru** (wajib untuk Next.js 16)
- Git
- Akun Supabase

---

## 🚀 Menjalankan di Komputer Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Siapkan database

Buka **Supabase Dashboard → SQL Editor → New query**, paste seluruh isi `src/lib/schema.sql`, lalu **Run**.

Skrip itu membuat semua tabel, index, constraint, policy RLS, trigger `updated_at`, dan bucket storage `images`. Aman dijalankan berulang kali.

### 3. Konfigurasi environment

```bash
cp .env.example .env
```

Isi nilainya dari **Supabase Dashboard → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-anon-key-disini
SUPABASE_SERVICE_ROLE_KEY=isi-service-role-key-disini
API_SECRET_KEY=ganti-dengan-string-acak-panjang
```

Buat `API_SECRET_KEY` yang benar-benar acak:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> File `.env` sudah masuk `.gitignore` dan **tidak boleh** ikut ter-commit. `.env.example` justru sengaja di-commit sebagai template.

### 4. Jalankan

```bash
npm run dev
```

Buka `http://localhost:3000`. Untuk mencoba dari HP di jaringan yang sama, jalankan `npm run dev -- -H 0.0.0.0` lalu buka `http://<IP-komputer>:3000`.

---

## 📂 Struktur Direktori

```
src/
├── app/                     Halaman (App Router)
│   ├── page.tsx             Beranda
│   ├── events/              Daftar & detail kegiatan (+ form absen)
│   ├── news/                Daftar & detail berita
│   ├── members/             Daftar anggota
│   ├── leaderboard/         Papan peringkat
│   ├── feedback/            Kotak kritik & saran
│   ├── admin/               Panel admin
│   │   ├── masuk/           Halaman masuk (di luar grup (panel) — sengaja tak dipagari)
│   │   └── (panel)/         Ringkasan, anggota, berita, kegiatan, absen, feedback
│   ├── error.tsx            Error boundary
│   ├── loading.tsx          Skeleton saat memuat
│   ├── not-found.tsx        Halaman 404
│   └── api/                 Endpoint REST (lihat tabel di bawah)
├── components/              Komponen tampilan
│   ├── sections/            Section beranda (hero, tentang, visi-misi, anggota,
│   │                        galeri, leaderboard, feedback, banner CTA)
│   │   └── decor.tsx        Potongan bersama: Eyebrow, JudulSection, Wadah, ombak
│   ├── cards.tsx            Kartu kegiatan/berita/anggota + baris peringkat
│   ├── ui.tsx               Primitif: Card, Badge, Avatar, EmptyState, dll.
│   ├── nav-items.ts         Daftar section untuk navbar & tab bar HP
│   ├── site-header.tsx      Header + sheet menu HP
│   ├── bottom-nav.tsx       Tab bar bawah (khusus HP)
│   ├── icons.tsx            Ikon SVG sebaris
│   ├── forms/               Form absen & feedback
│   └── admin/               Kontrol & form panel admin
├── lib/
│   ├── env.ts               Validasi environment variable
│   ├── supabase.ts          Client publik (anon key)
│   ├── supabase-admin.ts    Client admin (service role) — KHUSUS server
│   ├── types.ts             Tipe data bersama
│   ├── api-client.ts        Pemanggil API dari browser
│   ├── site-content.ts      Semua teks & kontak tetap (gampang diganti panitia)
│   ├── admin-session.ts     Token sesi admin (HMAC, tanpa API Next)
│   ├── admin-auth.ts        Pagar admin: sesi, wajibAdmin, batas percobaan masuk
│   ├── rate-limit.ts        Pembatas permintaan (dipakai proxy & halaman masuk)
│   └── schema.sql           Skema database
├── server/                  Data Access Layer (query ke Supabase)
├── utils/                   Helper: response, format, validasi, upload
└── proxy.ts                 "Satpam" API (dulu: middleware.ts)
```

---

## 🎨 Desain & Tampilan

Tampilan mengikuti desain Figma dari desainer tim: beranda adalah **satu halaman panjang** berisi semua section, dan menu navbar menggulir ke section (anchor) — bukan berpindah halaman.

| Bagian | Keterangan |
|---|---|
| Palet | merah `#A80C0C`, oranye `#FF990B`, flame `#F25525`, peach `#FDE3D3` — semuanya token CSS di `src/app/globals.css` |
| Judul | Poppins (`--font-display`) lewat `next/font`; badan teks Geist |
| Section | `#beranda` → `#tentang-kami` → `#visi-misi` → `#anggota` → `#galeri` → `#leaderboard` → `#feedback` → banner CTA |
| Teks & kontak | Semua narasi tetap ada di `src/lib/site-content.ts` — ubah di situ, komponen tidak perlu disentuh |
| Foto hero | Isi `HERO.foto` dengan path relatif folder `public` (mis. `/images/hero-club.jpg`). Selama kosong, hero memakai bingkai gradien + lambang DSC, bukan gambar rusak |
| Anggota / Galeri / Leaderboard | Datanya asli dari Supabase; kalau kosong atau koneksi gagal, section menampilkan pesan kosong yang informatif, bukan halaman error |

Pembahasan teknis lengkapnya (berkas baru, token warna, penyesuaian HP/tablet) ada di [AUDIT.md](./AUDIT.md) bagian I.

---

## 🧑💼 Panel Admin

Semua isi situs dikelola dari `/admin` — panitia tidak perlu membuka dashboard Supabase lagi.

| Halaman | Untuk apa |
|---|---|
| `/admin` | Ringkasan: jumlah data, kegiatan terdekat, masukan terbaru |
| `/admin/anggota` | Tambah/ubah/hapus anggota beserta poin — poin menentukan urutan papan peringkat |
| `/admin/berita` | Tulis/ubah/hapus berita; alamat (slug) dibuat otomatis dari judul |
| `/admin/kegiatan` | Agenda: tanggal (WITA), lokasi, gambar galeri, buka/tutup pendaftaran absen |
| `/admin/absen` | Rekap absen per kegiatan, siap diunduh sebagai CSV untuk Excel |
| `/admin/feedback` | Baca masukan pengunjung, hapus yang sudah ditindaklanjuti |

**Masuk.** Satu kata sandi saja: `ADMIN_PASSWORD` di `.env`. Sesi disimpan sebagai cookie `httpOnly` bertanda tangan HMAC selama 8 jam. Delapan percobaan masuk gagal per lima menit per alamat IP akan ditahan.

**Dijaga dua lapis.** `src/proxy.ts` meredirect permintaan GET ke `/admin/*` yang belum punya sesi, dan `wajibAdmin()` di dalam layout serta setiap server action memastikan tidak ada satu pun penulisan yang jalan tanpa sesi. Lapisan kedua itu yang menentukan — proxy hanya lapisan kenyamanan.

**Kenapa tidak Supabase Auth.** Untuk kebutuhan panitia UKM, tabel pengguna dan alur undangan email menambah titik gagal tanpa menambah manfaat. Kalau nanti butuh jejak audit per orang (siapa mengubah apa), langkah naiknya jelas: Supabase Auth + tabel `profiles`, dan `wajibAdmin()` jadi satu-satunya tempat yang perlu diubah.

**Unggah gambar.** Form admin mengirim gambar lewat server action; batas badan permintaan dinaikkan ke 4 MB di `next.config.ts`, sementara validasi sebenarnya tetap 2 MB di `src/utils/uploadImage.ts`. Jenis file ditentukan dari MIME type, bukan nama kiriman.

---

## 🔌 Endpoint API

Semua respons memakai bentuk yang sama:

```json
{ "status": true, "message": "…", "data": {} }
```

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/members` | Publik | Semua anggota |
| GET | `/api/members/[id]` | Publik | Detail anggota |
| POST | `/api/members` | **Admin** | Tambah anggota (JSON / form-data + foto) |
| PUT | `/api/members/[id]` | **Admin** | Ubah anggota |
| DELETE | `/api/members/[id]` | **Admin** | Hapus anggota |
| GET | `/api/news` | Publik | Daftar berita (`?limit=`) |
| GET | `/api/news/[slug]` | Publik | Detail berita |
| POST | `/api/news` | **Admin** | Buat berita (`slug` opsional — dibuat otomatis dari judul) |
| PUT | `/api/news/[slug]` | **Admin** | Ubah berita (field yang tidak dikirim tidak diubah) |
| DELETE | `/api/news/[slug]` | **Admin** | Hapus berita |
| GET | `/api/events` | Publik | Semua kegiatan (`?limit=`) |
| GET | `/api/events/[id]` | Publik | Detail kegiatan |
| POST | `/api/events` | **Admin** | Buat kegiatan |
| PUT | `/api/events/[id]` | **Admin** | Ubah kegiatan |
| DELETE | `/api/events/[id]` | **Admin** | Hapus kegiatan |
| GET | `/api/attendance` | **Admin** | Rekap absen (`?event_id=` opsional) |
| POST | `/api/attendance` | Publik | Daftar absen kegiatan |
| GET | `/api/leaderboard` | Publik | Papan peringkat (`?limit=`, maks 100) |
| GET | `/api/feedback` | **Admin** | Kotak masuk kritik & saran |
| POST | `/api/feedback` | Publik | Kirim kritik & saran |
| DELETE | `/api/feedback?id=` | **Admin** | Hapus satu feedback |

### Autentikasi endpoint admin

Endpoint bertanda **Admin** wajib menyertakan header:

```
Authorization: Bearer <API_SECRET_KEY>
```

Tanpa header itu, `src/proxy.ts` membalas `401`. Kalau `API_SECRET_KEY` belum diisi di `.env`, semua endpoint admin membalas `503` — server **tidak** meloloskan permintaan apa pun.

---

## 📤 Contoh Request

### Tambah anggota (dengan foto)

```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -F "name=Rengga X" \
  -F "role=Ketua" \
  -F "points=120" \
  -F 'social_links={"instagram":"@renggax","github":"renggax"}' \
  -F "photo_url=@./foto.jpg"
```

### Buat berita

```bash
curl -X POST http://localhost:3000/api/news \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Next.js Pertama",
    "content": "Paragraf pertama.\n\nParagraf kedua.",
    "cover_image_url": "https://contoh.com/cover.jpg"
  }'
```

### Kirim feedback (publik, boleh anonim)

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{ "message": "Tambah kegiatan kelas IoT dong!" }'
```

### Daftar absen kegiatan (publik)

```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "uuid-kegiatan",
    "participant_name": "Nama Peserta",
    "participant_email": "nama@kampus.ac.id",
    "institution": "Universitas Balikpapan"
  }'
```

---

## 🔒 Catatan Keamanan

- **Row Level Security aktif** di semua tabel. Anon key (yang beredar di browser) hanya bisa membaca konten publik dan mengirim absen/feedback. Kotak masuk feedback dan daftar hadir tidak bisa dibaca publik.
- **`SUPABASE_SERVICE_ROLE_KEY` hanya ada di sisi server.** `src/lib/supabase-admin.ts` menolak dijalankan di browser, dan nama variabelnya tanpa awalan `NEXT_PUBLIC_` sehingga Next.js tidak pernah menggantinya di sisi klien.
- **Perbandingan token memakai waktu konstan**, supaya tidak bisa ditebak lewat selisih waktu eksekusi.
- **Rate limit** pada endpoint tulis publik: 10 permintaan per menit per IP. Ini penyaring dasar, bukan pengganti rate limit terdistribusi kalau nanti trafiknya besar.
- **Nama file upload selalu di-UUID-kan** dan ekstensinya ditentukan dari MIME type, bukan dari nama file kiriman.

---

## 📋 Skrip

```bash
npm run dev      # Server pengembangan (Turbopack)
npm run build    # Build produksi
npm run start    # Jalankan hasil build
npm run lint     # ESLint
npx tsc --noEmit # Pemeriksaan tipe
```

---

## 📝 Riwayat Perbaikan

Bug yang ditemukan dan diperbaiki, beserta penjelasan teknisnya, ada di **[AUDIT.md](./AUDIT.md)**.
