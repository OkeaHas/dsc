# Hasil Audit & Perbaikan — Proyek DSC

Tanggal audit: 21 November 2026
Ruang lingkup: seluruh isi `src/`, konfigurasi proyek, dan skema database.
Verifikasi yang dijalankan: `npx tsc --noEmit` (0 error) dan `npx eslint .` (0 error, 0 warning) atas 53 file.

> Catatan: `next build` dan `next dev` **tidak** saya jalankan — sesuai kesepakatan, proses menjalankan & debug ada di kamu. Yang saya lakukan hanya pemeriksaan statis.

---

## Ringkasan

Kode yang tersisa di Git ternyata baru sebagian dari backend. Empat file kosong (0 byte), satu file rusak total, dan seluruh antarmuka frontend masih template bawaan `create-next-app`. Yang diperbaiki di sesi ini:

- **1 file rusak** yang membuat build gagal total
- **4 file kosong** diisi (absen & papan peringkat)
- **15 bug** pada backend yang sudah ada
- **Seluruh frontend** dibangun ulang, responsif dari HP sampai desktop
- **Skema database** diperbaiki: index, constraint, RLS, storage bucket

---

## A. BUG BLOKER — proyek tidak bisa di-build

### A1. File `src/app/api/news/route.ts` rusak (syntax error)
Dua isi file berbeda tersambung di tengah baris — baris 21 memotong panggilan `NextResponse.json(...)` lalu baris 22 mulai lagi dengan `import { NextRequest } from "next/server"`. Ada `import` di tengah badan fungsi dan satu `try` tanpa `catch`. Ini membuat **seluruh build gagal**, bukan cuma endpoint berita.

**Perbaikan:** file ditulis ulang; `GET` dan `POST` kembali satu berkas yang sah, memakai pembaca body `parseRequest` yang mendukung JSON **dan** form-data (sebelumnya endpoint berita hanya menerima JSON, padahal endpoint anggota/events memakai form-data).

### A2. Empat file kosong (0 byte)
- `src/server/attendance.ts`
- `src/app/api/attendance/route.ts`
- `src/server/leaderboard.ts`
- `src/app/api/leaderboard/route.ts`

Padahal `middleware.ts` sudah mengatur akses `/api/attendance`, dan `README.md` menjanjikan endpoint leaderboard. Artinya fitur absen dan papan peringkat hilang seluruhnya.

**Perbaikan:** keempatnya diisi.
- `POST /api/attendance` (publik) — kegiatan wajib ada dan `is_active` masih `true`; satu email hanya boleh absen sekali per kegiatan.
- `GET /api/attendance?event_id=…` (admin) — rekap per kegiatan atau seluruhnya.
- `GET /api/leaderboard?limit=…` (publik) — diambil dari kolom `points` di tabel `members`.

### A3. `src/lib/supabase.ts` tidak punya penjagaan env
`createClient(supabaseUrl!, supabaseAnonKey!)` dijalankan di module scope. Tanpa `.env`, import-nya melempar `supabaseUrl is required` tanpa petunjuk apa pun, dan `supabaseAdmin` dibuat memakai service key yang bisa `undefined` — artinya client "admin" yang sebenarnya bukan admin, gagal secara senyap.

**Perbaikan:** client dibuat *lazily* lewat `getSupabase()` / `getSupabaseAdmin()`, dengan `src/lib/env.ts` yang memvalidasi setiap variabel dan melempar pesan bahasa Indonesia yang menyuruh copy `.env.example`.

### A4. `params` sinkron di `src/app/api/news/[slug]/route.ts`
Kode ini menulis `params.slug` langsung. Di Next.js 16 **`params` adalah Promise dan wajib di-`await`**; akses sinkron sudah dihapus total. Akibatnya `slug` selalu `undefined` dan halaman detail berita tidak akan pernah menemukan datanya.

**Perbaikan:** semua route handler dan page yang memakai dynamic segment (`[id]`, `[slug]`) sekarang `await params`.

---

## B. BUG KRITIS — jalan tapi hasilnya salah

### B1. Kontrak data antar-lapisan tidak cocok (berita)
`src/server/news.ts` melempar/mengembalikan nilai mentah:

```ts
export async function getAllNews() {
  const { data, error } = await supabase.from("news").select("*");
  if (error) throw new Error(error.message);
  return data;                // ← array
}
```

sementara route-nya mendestrukturisasi seperti objek:

```ts
const { data, error } = await getAllNews();   // data & error SELALU undefined
if (error) return NextResponse.json({ error: error.message }, { status: 500 });
return NextResponse.json(data);               // membalas `undefined`
```

Akibatnya `GET /api/news` membalas body kosong, dan `POST /api/news` melaporkan sukses (`201`) walau insert-nya gagal — karena `error` selalu `undefined`.
Masalah yang sama terjadi pada `PUT`/`DELETE` berita dan pada `POST`/`PUT` anggota.

**Perbaikan:** semua fungsi DAL sekarang mengembalikan bentuk yang sama, `DalResult<T>` (`src/server/types.ts`), dengan helper `dalOk`/`dalFail` dan pemetaan khusus untuk kode `PGRST116` (data tidak ada).

### B2. Operasi tulis berita memakai anon key
`createNews`, `updateNewsBySlug`, dan `deleteNewsBySlug` memakai client `supabase` (anon). Begitu Row Level Security dinyalakan — satu-satunya cara aman memakai Supabase dari browser — **semua penulisan berita langsung gagal**, dan bisa dipastikan gagal karena anon key beredar publik.

**Perbaikan:** baca memakai anon (dibatasi RLS), tulis memakai service role.

### B3. `social_links` (JSONB) diisi string mentah
```ts
const social_links = formData.get("social_links") as string;
await supabaseAdmin.from("members").insert({ social_links });
```
Kolomnya `JSONB`. Kalau pengirim mengosongkan field-nya (paling sering terjadi), nilainya `""` dan Postgres menolak dengan *invalid input syntax for type json* → 500 yang tidak menjelaskan apa-apa.

**Perbaikan:** `parseSocialLinks()` di `src/utils/validate.ts` — mem-parse JSON, membuang key kosong, dan melempar `ValidationError` (400) dengan contoh format yang benar kalau isinya tidak bisa dibaca.

### B4. `points` bisa jadi `NaN`
`Number(null)` → `0`, `Number("")` → `0`, tapi `Number("abc")` → `NaN`. `NaN` yang dikirim ke kolom `INTEGER` membuat insert gagal.

**Perbaikan:** `parsePoints()` mengembalikan bilangan bulat ≥ 0, jatuh ke `0` kalau inputnya tidak masuk akal.

### B5. Data tidak ditemukan dianggap error server (500)
`.single()` di Supabase mengembalikan error `PGRST116` saat tidak ada baris. `GetMemberById` dan `DeleteMemberById` memperlakukannya sebagai 500, padahal seharusnya 404. Ini juga yang bikin log penuh "server error" palsu.

**Perbaikan:** `isNotFoundError()` di `src/server/types.ts`, diteruskan ke status HTTP oleh `statusFromError()` di `src/utils/api-error.ts`.

### B6. Foto jadi file yatim / tidak pernah dibersihkan
- `PostMember`: kalau `insert` gagal setelah foto terunggah, filenya tertinggal di storage selamanya.
- `DeleteMemberById`: baris DB dihapus, fotonya tidak — storage terus menumpuk.
- `PutMemberByid` sudah benar menangani foto lama pada satu jalur, tapi tidak pada jalur lain.

**Perbaikan:** aturan konsisten — *DB dulu, file kemudian*. Kalau DB gagal, file baru yang sudah terunggah dihapus; kalau DB berhasil, file lama baru dihapus. Berlaku untuk anggota, berita, dan kegiatan.

### B7. Ekstensi file ditentukan oleh nama file kiriman user
```ts
const extension = file.name.split(".").pop() || "png";
```
`foto.jpeg.exe` tersimpan sebagai `.exe`; file tanpa titik menyimpan seluruh namanya sebagai ekstensi. Validasi MIME-nya benar, tapi ekstensinya tidak pernah dicocokkan.

**Perbaikan:** ekstensi diambil dari MIME type lewat tabel `MIME_TO_EXTENSION`, dan `contentType` + `cacheControl` ikut dikirim saat upload.

### B8. `photo_url` menyimpan nama file, tapi tidak pernah diubah jadi URL
`uploadImage()` mengembalikan nama file (`uuid.png`), nilai itu langsung masuk kolom `photo_url`, lalu dikirim apa adanya ke frontend. Tidak ada satu pun tempat yang membentuk URL publiknya — jadi **foto anggota tidak akan pernah tampil**, bahkan setelah berhasil diunggah.

**Perbaikan:** kolom database tetap berisi nama file (supaya `deleteImage()` selalu menerima path yang benar), dan `imageUrl()` di `src/utils/uploadImage.ts` membentuk URL publik saat data dibaca. `toStoragePath()` melakukan kebalikannya, jadi delete tetap aman walau ada data lama berisi URL penuh.

### B9. Pesan respons placeholder `"donebang"`
`GetMember` membalas `"donebang"`. Sudah diganti pesan yang bisa dipakai frontend.

### B10. Token admin bisa ditembus saat `API_SECRET_KEY` kosong
```ts
if (authHeader !== `Bearer ${secretKey}`) { ... 401 ... }
```
Kalau `secretKey` bernilai `undefined`, pembandingnya menjadi `"Bearer undefined"`. Siapa pun yang mengirim header itu menembus **semua** endpoint admin — termasuk membaca kotak masuk feedback dan menghapus data.

**Perbaikan (dua lapis):**
1. Kalau `API_SECRET_KEY` belum diisi → server membalas `503` dan **tidak meloloskan apa pun**.
2. Perbandingan token memakai fungsi waktu-konstan (`safeEqual`), supaya token tidak bisa ditebak karakter demi karakter lewat selisih waktu eksekusi.

### B11. Rate limit di endpoint yang salah
`src/app/api/events/route.ts` membatasi **10 request/menit/IP** dan menerapkannya pada `GET` juga. Satu halaman yang memuat daftar kegiatan + beberapa gambar bisa menembus batas itu dan menampilkan `429` ke pengunjung biasa. `Map`-nya juga tidak pernah dibersihkan → tumbuh terus (kebocoran memori).

**Perbaikan:** pembatasan dipindah ke `src/proxy.ts`, hanya menyasar endpoint **tulis publik** (absen & feedback) — itu yang benar-benar bisa disalahgunakan. Map-nya sekarang disapu berkala, dan respons `429` menyertakan header `Retry-After`.

---

## C. MASALAH SEDANG

| # | Masalah | Perbaikan |
|---|---|---|
| C1 | Baca publik memakai service role (least privilege bocor) di `getAllEvents`/`getEventById` | Baca publik pindah ke client anon; service role hanya untuk tulis |
| C2 | `PUT /api/news/[slug]` mengoper `body` mentah ke `.update()` — body kosong lolos, slug bisa tertimpa | Field diperiksa satu per satu; body kosong → 400; `UpdateNewsInput` semua opsional |
| C3 | `PUT`/`DELETE` kegiatan tidak ada sama sekali | Ditambahkan `src/app/api/events/[id]/route.ts` (GET/PUT/DELETE) |
| C4 | `DELETE` feedback tidak ada | Ditambahkan `DELETE /api/feedback?id=…` |
| C5 | Feedback: pesan tanpa batas panjang, email tidak divalidasi | `requireText` (maks 5.000) + `isEmail` |
| C6 | Id non-UUID diteruskan ke Postgres → error 22P02 → 500 | `requireUuid()` mengembalikan 400 sebelum menyentuh database |
| C7 | `catch (error: any)` dan `data?: any` melanggar `eslint-config-next/typescript` | Diganti `unknown` + helper `apiError()` |
| C8 | `body { font-family: Arial }` menimpa font Geist yang sudah dimuat | Memakai `var(--font-geist-sans)` dengan fallback sistem |
| C9 | Metadata masih "Create Next App"; tidak ada `viewport` | Metadata DSC + `viewportFit: "cover"` (tanpa ini `env(safe-area-inset-bottom)` selalu `0` di iPhone) |
| C10 | `next.config.ts` tanpa `images.remotePatterns` → `next/image` menolak host Supabase | `remotePatterns` ditambahkan, dibaca dari `NEXT_PUBLIC_SUPABASE_URL` |
| C11 | `.gitignore` pola `.env*` ikut mengabaikan `.env.example` | Ditambah `!.env.example` |
| C12 | File DAL kosong/gagal dimuat → halaman blank tanpa penjelasan | Komponen `DataNotice` menampilkan petunjuk `.env` & `schema.sql` |
| C13 | `README.md` menyebut Next.js 14+ dan `src/middleware.ts` | Ditulis ulang sesuai kondisi sebenarnya |

---

## D. NEXT.JS 16 — PERUBAHAN API YANG SUDAH DIADAPTASI

Proyek ini memakai **Next.js 16.3.6** dan **React 19.2.8**, yang punya breaking change besar dibanding Next.js 14/15 yang umum dipakai:

1. **`middleware.ts` sudah deprecated → `proxy.ts`.**
   File `src/middleware.ts` dipindah jadi `src/proxy.ts` dengan nama fungsi `proxy`. Runtime-nya Node.js dan tidak bisa dikonfigurasi. Yang lama masih jalan, tapi memicu peringatan deprecation.
2. **`params` & `searchParams` hanya bisa diakses sebagai Promise** (dibahas di A4).
3. **`next lint` dihapus** — script `lint` sudah memanggil ESLint langsung (`eslint`), dan itu sudah benar di repo ini.
4. **Turbopack jadi default** untuk `dev` dan `build`; konfigurasi `turbopack` pindah ke level atas.
5. **`images.qualities` default hanya `[75]`** — sudah diset eksplisit.
6. **React Compiler aktif** (`reactCompiler: true`), jadi aturan kemurnian render ditegakkan ESLint. Dua pelanggarannya sudah diperbaiki:
   - `Date.now()` dipanggil di badan komponen → sekarang lewat helper `sekarangMs()`
   - `setState` di dalam `useEffect` (menutup menu saat rute berubah) → sekarang ditutup di handler klik `Link`

---

## E. SKEMA DATABASE (`src/lib/schema.sql`)

Ditulis ulang, idempotent (aman dijalankan berulang). Yang diperbaiki:

**Index** — sebelumnya hanya ada primary key dan unique `news.slug`:
- `members (points desc, name asc)` — jalur utama leaderboard
- `news (created_at desc)` — daftar berita terbaru
- `events (event_date desc)` dan `events (event_date asc) where is_active` — agenda terdekat
- `attendance (event_id)` dan `feedback (created_at desc)`

**Constraint:**
- `members.points >= 0`
- **`unique (event_id, lower(participant_email))` pada `attendance`** — tanpa ini orang bisa menekan tombol daftar dua kali dan muncul sebagai dua baris absen

**Row Level Security** — sebelumnya **tidak ada sama sekali**:
- anon boleh **baca** `members`, `news`, `events`
- anon boleh **insert** `attendance` (hanya untuk kegiatan yang `is_active`) dan `feedback`
- anon **tidak boleh** membaca kotak masuk feedback maupun daftar hadir; service role menembus semuanya

**Lain-lain:**
- kolom `updated_at` + trigger `set_updated_at()` (sebelumnya kolom itu tidak ada sama sekali)
- definisi bucket storage `images` (publik, batas 2 MB, MIME type diizinkan) + policy baca

---

## F. FRONTEND — DIBANGUN ULANG (hilang saat laptop rusak)

Sebelumnya hanya ada `page.tsx` dan `layout.tsx` bawaan `create-next-app` (logo Next.js + "To get started, edit page.tsx"). Semua halaman di bawah ini baru:

| Rute | Isi |
|---|---|
| `/` | Hero, agenda terdekat, berita terbaru, 5 besar peringkat, statistik |
| `/events` | Agenda mendatang (kartu bergambar) + agenda lampau (daftar ringkas) |
| `/events/[id]` | Detail + **form absen** (hanya muncul kalau pendaftaran dibuka) + `generateMetadata` |
| `/news` | Daftar berita |
| `/news/[slug]` | Detail artikel + berita terkait + `generateMetadata` / OpenGraph |
| `/members` | Daftar anggota + pencarian nama/jabatan (di sisi klien) |
| `/leaderboard` | Papan peringkat penuh + statistik total & rata-rata poin |
| `/feedback` | Form kritik & saran (boleh anonim) + penghitung karakter |
| `not-found` | Halaman 404 |
| `error` | Error boundary (detail hanya tampil di mode development) |
| `loading` | Skeleton yang menyerupai tata letak asli, supaya tidak "melompat" |

**Tambahan:** header dengan sheet menu di HP, **tab bar bawah** khusus HP, footer responsif, set ikon SVG sendiri (tanpa pakai paket ikon → tidak ada dependensi baru).

---

## G. PENYESUAIAN HP & TABLET

Pendekatan *mobile-first*: gaya default untuk HP, lalu dilebarkan bertahap.

**Breakpoint yang dipakai**

| Lebar | Sasaran | Yang berubah |
|---|---|---|
| < 640px | HP | 1 kolom, tab bar bawah, menu jadi sheet, teks `text-sm` |
| ≥ 640px (`sm`) | HP besar / tablet potret | 2 kolom, tombol sejajar horizontal, form 2 kolom |
| ≥ 768px (`md`) | Tablet lanskap | Jarak antarelemen lebih lega |
| ≥ 1024px (`lg`) | Desktop | Menu pindah ke header, tab bar bawah hilang, 3–4 kolom |

**Hal-hal khas HP/tablet yang ditangani:**

1. **Area aman (notch & gesture bar).** Tab bar bawah memasang inset bawah lewat gaya inline (`paddingBottom: env(safe-area-inset-bottom)` di `bottom-nav.tsx`), dan `viewportFit: "cover"` dipasang di `layout.tsx`. Tanpa keduanya, inset-nya selalu `0` dan tab bar tertutup gesture bar.
2. **Konten tidak tertutup tab bar.** `main` diberi `pb-[calc(4rem+env(safe-area-inset-bottom))]`, dihilangkan di `lg` saat tab bar tidak ada.
3. **Target sentuh ≥ 44px.** Semua tombol, tab, dan menu minimal `min-h-11`/`min-h-12` — bukan `py-1.5` yang enak di-klik pakai mouse tapi menyiksa di layar sentuh.
4. **Menu menutup sendiri** saat salah satu tautan diklik, plus kunci scroll latar dan dukungan tombol `Escape`.
5. **Tabel jadi daftar di HP.** Agenda lampau dan papan peringkat tidak memakai `<table>` yang butuh scroll horizontal, melainkan baris fleksibel yang menumpuk di layar sempit.
6. **`overflow-x: hidden` + `overflow-wrap: anywhere`** supaya satu judul atau URL panjang tidak menggeser seluruh halaman ke samping.
7. **Keyboard HP:** `inputMode="email"` untuk field email, dan `text-base` pada input (di bawah 16px, iOS akan memperbesar halaman otomatis saat fokus).
8. **Gambar:** `next/image` dengan atribut `sizes` sesuai lebar kolom, jadi HP tidak mengunduh gambar seukuran desktop.
9. **`prefers-reduced-motion`** dihormati — animasi dimatikan bagi yang memintanya.
10. **Kontras & mode gelap.** Warna ditulis sebagai token CSS (`--surface`, `--brand`, …), sehingga mode gelap cuma menukar nilainya dan seluruh halaman ikut berubah, termasuk meta `themeColor` browser.

---

## H. YANG BELUM SAYA LAKUKAN (sengaja)

- **`next build` dan `next dev` tidak dijalankan** — proses menjalankan & debug kamu.
- **`.env` belum dibuat.** Aku tidak punya kredensial Supabase-nya. Copy `.env.example` → `.env`.
- **`src/lib/schema.sql` belum dijalankan.** Jalankan lewat SQL Editor Supabase; sudah idempotent dan aman diulang.
- Belum ada halaman admin. Endpoint tulis (POST/PUT/DELETE) sudah siap dan terlindungi Bearer token, tapi belum ada antarmukanya. Bilang saja kalau mau dibangun.

---

## I. RESTYLE FRONTEND MENURUT DESAIN FIGMA

Desain dari desainer (prototipe Figma, 7 frame, halaman utama 1440×9176) sudah dipindahkan ke kode. Yang berubah:

**Model halaman.** Beranda bukan lagi kumpulan kartu ringkas, melainkan **satu halaman panjang** dengan section ber-anchor — persis seperti desain:

`#beranda` → `#tentang-kami` → `#visi-misi` → `#anggota` → `#galeri` → `#leaderboard` → `#feedback` → banner CTA → footer.

Konsekuensinya `nav-items.ts` menyimpan `id` section (bukan `href`), dengan helper `sectionHref(id, pathname)` yang mengubahnya jadi `#anggota` di beranda atau `/#anggota` dari halaman lain.

**Berkas baru**

| Berkas | Isi |
|---|---|
| `src/lib/site-content.ts` | Semua teks tetap desain: hero, tentang, visi/misi, kontak, sosial, testimoni, footer. Panitia ubah narasi di sini saja, tanpa menyentuh JSX. |
| `src/components/sections/*.tsx` | Delapan section beranda: `hero`, `tentang`, `visi-misi`, `anggota`, `galeri`, `leaderboard`, `feedback`, `cta`. |
| `src/components/sections/decor.tsx` | Potongan bersama: `Eyebrow`, `JudulSection`, `Wadah`, `OmbakAtas`, `OmbakBawah` (tepi bergelombang dari SVG, bukan gambar). |

**Palet & tipografi** — dibaca dari prototipe, jadi token di `globals.css`:

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--brand` | `#A80C0C` | judul, logo, garis menu aktif |
| `--accent` | `#FF990B` | panel Tentang Kami, banner CTA, catatan testimoni |
| `--flame` | `#F25525` | pasangan gradien batang leaderboard |
| `--peach` | `#FDE3D3` | gradien lembut belakang hero |

Judul memakai **Poppins** (`--font-display`) lewat `next/font`, badan teks tetap Geist.

**Data nyata, bukan contoh.** Section Anggota, Galeri, dan Leaderboard mengambil data dari Supabase di `page.tsx` (server component, `force-dynamic`). Kalau koneksi/kunci belum siap, ketiga section tetap tampil dengan pesan kosong yang informatif dan muncul banner alasan di atasnya — halaman tidak ikut mati.

**Penyesuaian HP/tablet di section baru**

1. Anggota: 2 kolom di HP → 3 di tablet → 4 di desktop; kartu ala polaroid dengan foto `next/image`, otomatis jadi inisial kalau anggota belum punya foto.
2. Galeri: *masonry* kolom CSS (`columns-2/3/4`) dengan rasio berselang-seling, jadi foto potret dan lanskap sama-sama muat tanpa dipotong paksa.
3. Leaderboard: grafik batang tetap muat di HP (tinggi dihitung proporsional, batang terendah diberi lantai 28% supaya tidak hilang), daftar peringkat di bawahnya.
4. Feedback: baris emoji menyisipkan karakter ke pesan (bukan hiasan), plus penghitung karakter. Mockup ponsel hanya tampil di desktop — di HP testimoni ditumpuk di bawah form.
5. Tab bar bawah tetap `lg:hidden` dan memakai `env(safe-area-inset-bottom)`.

**Yang belum diverifikasi:** `next build`/`next dev` tidak dijalankan (bagian kamu), dan teks section "Tentang Kami" serta tata letak detail section Leaderboard disalin dari pembacaan gambar prototipe — kalau ada kalimat yang kurang persis, cukup betulkan di `src/lib/site-content.ts`.

---

## J. JEBAKAN: TAILWIND MEMINDAI KOMENTAR

Build sempat gagal dengan:

```
Parsing CSS source code failed
./src/app/globals.css:1038:37  padding-bottom: calc(4rem + env(...));
Unexpected token Delim('.')
```

Penyebabnya bukan `globals.css` — melainkan **komentar JSDoc di `src/components/bottom-nav.tsx`** yang menuliskan contoh kelas padding bawah dengan nilai `env()` masih berupa titik-titik (`...`). Tailwind v4 memindai semua berkas sumber sebagai teks mentah untuk mencari kandidat kelas, **termasuk isi komentar**. Kandidat rusak itu lalu benar-benar diubah menjadi aturan CSS, dan `env(...)` bukan CSS yang valid.

Aturan yang berlaku sekarang:

1. Jangan menulis contoh kelas Tailwind dengan nilai tidak lengkap di komentar, dokumentasi, atau string mana pun di dalam proyek. Tulis nilai lengkap, atau jangan tulis polanya.
2. Kelas arbitrary padding bawah dengan `calc()` + `env(safe-area-inset-bottom)` yang **ditulis lengkap** aman — sudah kuuji dengan mengompilasi `globals.css` memakai PostCSS + Tailwind v4 langsung: hasil 54.573 byte, nol kandidat rusak, dan tiga aturan safe-area keluar valid.
3. Kalau build gagal dengan error CSS padahal `globals.css` kelihatan bersih, cari dulu teks yang mirip kelas di komentar: `rg -n 'env\(\.\.\.\)|\[[^]]*\.\.\.' src`.

---

## K. PANEL ADMIN

Panel admin dibangun di `/admin`, seluruhnya di dalam satu aplikasi Next.js — tidak ada proyek kedua, tidak ada dashboard terpisah.

**Alur otentikasi (tanpa database user).**

1. Kata sandi tunggal di `ADMIN_PASSWORD`.
2. Cocok → cookie `dsc_admin` berisi `<kedaluwarsa>.<HMAC-SHA256(kedaluwarsa)>`, `httpOnly`, `sameSite=lax`, `secure` di produksi, berlaku 8 jam.
3. Kunci HMAC dari `ADMIN_SESSION_SECRET`; kalau kosong diturunkan dari `ADMIN_PASSWORD` + `API_SECRET_KEY`. Efek samping yang berguna: mengganti kata sandi otomatis membatalkan semua sesi lama.
4. Pemeriksaan pakai perbandingan waktu konstan (`samaAman`), sama seperti Bearer token di proxy.
5. Delapan percobaan masuk per 5 menit per IP ditahan (`createRateLimiter`).

**Dua lapis pagar.**

| Lapis | Berkas | Cakupan |
|---|---|---|
| Proxy | `src/proxy.ts` | Hanya permintaan GET ke `/admin/*`. Server action (POST) sengaja dilewatkan supaya form tidak gagal aneh — action-nya memeriksa sendiri. |
| Aplikasi | `wajibAdmin()` di `src/lib/admin-auth.ts` | Layout `(panel)` **dan** setiap server action. Ini yang menentukan. |

Halaman masuk ditaruh di luar route group `src/app/admin/(panel)/` — kalau ikut dipagari, halaman masuk sendiri akan menuntut sesi dan terjadi putaran redirect tanpa ujung.

**Berkas baru**

| Berkas | Isi |
|---|---|
| `src/lib/admin-session.ts` | Kripto token sesi (Web Crypto, tanpa `next/headers`) — diimpor juga oleh proxy |
| `src/lib/admin-auth.ts` | Pembungkus `cookies()`/`headers()`: `sesiAktif()`, `buatSesi()`, `hapusSesi()`, `wajibAdmin()`, pembatas percobaan masuk |
| `src/lib/rate-limit.ts` | Limiter bersama (dulu nempel di dalam `proxy.ts`) |
| `src/app/admin/actions.ts` | Semua server action: masuk, keluar, simpan/hapus anggota, berita, kegiatan, feedback |
| `src/components/admin/*` | Kontrol form bersama + 3 form entitas + tombol hapus + navigasi |
| `src/utils/format.ts` | Ditambah `zonaWaktuWita()` dan `keInputDatetime()` |

**Keputusan yang perlu dicatat**

1. **Zona waktu dipaksa.** Input `datetime-local` menghasilkan teks tanpa zona; kalau dibiarkan, jadwal kegiatan mengikuti zona server (UTC saat deploy) dan meleset 8 jam. `zonaWaktuWita()` menempelkan `+08:00` sebelum diparse.
2. **Checkbox `is_active` bawaannya mati.** Checkbox yang tidak dicentang tidak terkirim sama sekali, sementara `parseActive()` bawaan menganggap ketiadaan nilai sebagai "aktif" — jadi form mengirim eksplisit `"true"`/`"false"`.
3. **Tautan sosial dipecah per input.** Panitia mengisi empat kolom (Instagram, LinkedIn, GitHub, situs); `denganTautanSosial()` menyatukannya jadi JSON yang dimengerti parser lama, sehingga kolom JSONB tetap satu bentuk.
4. **CSV pakai titik koma + BOM.** Excel ber-locale Indonesia memecah kolom dengan `;`; BOM membuat huruf beraksen tidak rusak.
5. **`robots: { index: false }`** di layout panel dan halaman masuk — panel tidak untuk mesin pencari.
6. **Penulisan langsung ke data access layer.** Action tidak memanggil HTTP API sendiri, jadi tidak ada `API_SECRET_KEY` yang perlu dikirim dari server ke dirinya sendiri.
7. **Batas badan server action 4 MB** di `next.config.ts` (bawaan Next 1 MB), sementara validasi gambar tetap 2 MB.

**Yang belum diverifikasi:** `next build`/`next dev` dijalankan olehmu (bagian kamu). Dari sisi saya: `npx tsc --noEmit` dan `npx eslint .` bersih (0 error, 0 warning) setelah seluruh berkas panel ditambahkan.
