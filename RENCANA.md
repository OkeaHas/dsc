# Rencana Lanjutan — Website DSC

> Catatan tutup sesi: **Sabtu, 21 November 2026, 23:18 WITA**.
> Sudah ter-commit & ter-push: `82e9980 Build DSC site, admin panel, and secure APIs` (100 berkas, `main` = `origin/main`).
> Berkas ini catatan kerja, bukan dokumentasi permanen — hapus saja kalau semua poin di bawah sudah selesai.

---

## 1. Sudah beres (terverifikasi, jangan dikerjakan ulang)

| Bagian | Status |
|---|---|
| Backend (DAL, 9 endpoint API, RLS, `proxy.ts`) | Selesai |
| Beranda sesuai desain Figma (8 section, satu halaman ber-anchor) | Selesai |
| Panel admin (`/admin`): masuk, anggota, berita, kegiatan, absen + CSV, feedback | Selesai, **kamu sudah uji sendiri dan berfungsi** |
| Section **Kabar Terbaru** di beranda + menu "Berita" di navbar/footer/tab bar | Selesai (menutup temuan "berita terbit tapi tak terlihat publik") |
| `robots.txt` + `sitemap.xml` | Selesai |
| Jalur tulis database | Terbukti: sudah 6 anggota masuk lewat panel |
| Cek statis terakhir | `tsc=0`, `eslint=0` |
| Uji lepas-server | 18 uji sesi admin, 10 uji proxy, 23 uji berkas `"use server"` — semua lulus |

---

## 2. Besok — urut prioritas

### ✅ ~~1. Restyle 7 halaman publik sisanya~~ — DITUTUP

Keputusan Rengga (21 Nov, malam): beranda sudah diperiksa sendiri dari atas ke bawah, dinilai sudah sesuai prototipe dan kemiripannya cukup. **Pemetaan frame 1–6 tidak diperlukan lagi**, pekerjaan desain dianggap selesai.

Catatan fakta, bukan permintaan: tujuh halaman lain (`/events`, `/events/[id]`, `/news`, `/news/[slug]`, `/members`, `/leaderboard`, `/feedback`) masih memakai komponen UI versi pertama — semuanya berfungsi penuh dan tetap memakai token warna yang sama, hanya bentuknya belum mengikuti bahasa desain beranda. Kalau nanti terasa janggal saat dilihat berdampingan dengan beranda, tinggal bilang: memindahkannya bisa dikerjakan tanpa perlu desain baru.

### 🥇 1. Isi konten asli

- **Anggota: 6 baris** — cek foto, jabatan, dan poinnya sudah benar (poin = urutan papan peringkat).
- **Kegiatan: 0 baris** dan **berita: 0 baris**. Selama kosong, dinding galeri dan papan peringkat di beranda terlihat sepi. Cukup 2–3 kegiatan + 1 berita supaya tampilan desainnya "hidup" saat diperlihatkan ke pembina/desainer.
- **Foto hero belum diisi.** Selama `HERO.foto` di `src/lib/site-content.ts` kosong, hero memakai bingkai gradien + lambang DSC. Isi satu baris begitu foto bersama sudah ada.

### 🥈 2. Uji di HP & tablet sungguhan

Semua sudah dirancang mobile-first, tapi belum pernah dilihat di layar nyata. Yang perlu dicurigai khusus:

1. Tab bar bawah vs gesture bar iPhone (`env(safe-area-inset-bottom)`) — pastikan konten terakhir tidak tertutup.
2. Menu sheet HP: buka, klik satu tautan → harus tertutup sendiri dan menggulir ke section.
3. Tabel absen di `/admin/absen` — memang bisa digeser mendatar; pastikan nyaman.
4. Form admin di layar kecil: unggah foto, pemilih tanggal, checkbox pendaftaran.

### 🥉 3. Menuju produksi

1. **`npm run build`** (kamu yang jalankan) — pastikan lolos bersih, bukan cuma `dev`.
2. Deploy (Vercel). Isi environment variable di dashboard Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `API_SECRET_KEY`, `ADMIN_PASSWORD`. **Jangan** unggah `.env` lokal.
3. **Perpanjang `ADMIN_PASSWORD`** — sekarang 8 karakter. `openssl rand -hex 16` lalu ganti; semua sesi lama otomatis mati.
4. Pastikan bucket Supabase `images` bisa dibaca publik (`/storage/v1/object/public/...`), kalau tidak semua foto akan tampil kosong di produksi.
5. Cek `images.remotePatterns` di `next.config.ts` sudah mencakup host Supabase produksi (sudah otomatis dari `NEXT_PUBLIC_SUPABASE_URL`).

### ✅ ~~4. SEO kecil-kecilan~~ — DIBERESKAN BARENGAN KABAR TERBARU

Sudah jadi: `src/app/robots.ts` (larang `/admin` & `/api`) dan `src/app/sitemap.ts` (halaman tetap saja, tanpa query database supaya build tidak bisa gagal karena env belum terpasang). Alamat situs dibaca dari `NEXT_PUBLIC_SITE_URL` dengan cadangan `https://dscmulia.id`.

Catatan penting soal Figma: **frame 1–5 di file itu bukan website DSC** — isinya aplikasi monitoring kebocoran gas LPG. Yang DSC cuma frame 6 & 7 (dua iterasi beranda). Jadi tidak ada halaman DSC lain yang tertinggal di file itu.

### 5. Opsional / nanti saja

- Pasang paket `server-only` (sekarang diganti penjaga manual `guardServerOnly()` — sudah aman, cuma kurang "resmi").
- `unrs-resolver@1.12.2` postinstall diblokir policy; ESLint tetap jalan normal, tidak ada dampak.
- Kalau nanti butuh jejak audit per orang (siapa mengubah apa): Supabase Auth + tabel `profiles`. Hanya `wajibAdmin()` yang perlu diubah.
- Rate limit sekarang hidup per-instance di memori — cukup untuk spam tombol, kurang kalau nanti banyak instance (naik ke Upstash/Vercel KV).

---

## 3. Jebakan yang sudah pernah menggigit (jangan diulang)

Dicatat supaya besok tidak bolak-balik menjelaskan hal yang sama:

1. **Berkas `"use server"` hanya boleh mengekspor fungsi async.** Satu konstanta → seluruh modul ditolak, halaman mati. Interface/type aman.
2. **Proxy tidak boleh meredirect halaman masuk ke dirinya sendiri** → `ERR_TOO_MANY_REDIRECTS`. Halaman masuk harus dikecualikan, dan berada di luar layout yang dipagari.
3. **Komentar ikut dipindai Tailwind.** Contoh kelas arbitrary dengan nilai tidak lengkap di komentar menjadi CSS nyata → build gagal parse.
4. **`datetime-local` tidak membawa zona waktu** → jadwal meleset 8 jam kalau tidak dipaksa WITA.
5. **Checkbox tak tercentang tidak terkirim** → bawaan parser bisa terbalik.
6. **`redirect()` di dalam `try` tertelan `catch`** → simpan berhasil tapi tampil gagal.

---

## 4. Cara memulai besok (biar cepat panas)

```bash
cd /d/Project/GitHub/dsc
git log --oneline -1     # pastikan di 82e9980
npm run dev
```

Lalu bilang saja mau mulai dari mana — misal "isi 3 kegiatan" atau "gas produksi". Sisa konteksnya sudah ada di `README.md` (cara pakai) dan `AUDIT.md` (alasan tiap keputusan).
