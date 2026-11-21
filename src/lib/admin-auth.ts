import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { buatTokenSesi, NAMA_COOKIE_ADMIN, tokenSesiValid } from "./admin-session";
import { clientIp, createRateLimiter } from "./rate-limit";

/**
 * Otentikasi halaman admin — pembungkus `cookies()`/`headers()` di atas
 * `admin-session.ts` (bagian kriptonya ada di sana).
 *
 * Modelnya sengaja sederhana: satu kata sandi di `.env`, sesi disimpan sebagai
 * cookie httpOnly bertanda tangan HMAC. Tidak ada tabel user, tidak ada
 * Supabase Auth — untuk kebutuhan panitia UKM ini cukup, dan tidak menambah
 * satu pun titik gagal saat pionir-pionirnya masih belajar.
 *
 * Kalau nanti butuh akun per-orang (jejak audit: siapa mengubah apa), langkah
 * naiknya adalah Supabase Auth + tabel `profiles`; antarmuka di `src/app/admin`
 * tidak perlu berubah banyak karena semuanya lewat `wajibAdmin()`.
 *
 * ⚠️  Hanya untuk kode server.
 */

function guardServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("admin-auth hanya boleh dipakai di server.");
  }
}

/** 8 percobaan per 5 menit per alamat IP. */
const pembatasMasuk = createRateLimiter({ max: 8, windowMs: 5 * 60_000 });

/**
 * Mengembalikan sisa detik tunggu kalau percobaan masuk terlalu sering,
 * atau `null` kalau masih boleh mencoba.
 */
export async function batasiPercobaanMasuk(): Promise<number | null> {
  guardServerOnly();
  return pembatasMasuk.hit(`masuk:${clientIp(await headers())}`);
}

/** Sesi yang tersimpan di cookie masih sah? */
export async function sesiAktif(): Promise<boolean> {
  guardServerOnly();
  const jar = await cookies();
  return tokenSesiValid(jar.get(NAMA_COOKIE_ADMIN)?.value);
}

/** Terbitkan cookie sesi baru. Panggil setelah kata sandi terbukti benar. */
export async function buatSesi(): Promise<void> {
  guardServerOnly();

  const { nilai, kedaluwarsaMs } = await buatTokenSesi();
  const jar = await cookies();

  jar.set({
    name: NAMA_COOKIE_ADMIN,
    value: nilai,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(kedaluwarsaMs),
  });
}

/** Hapus cookie sesi (keluar). */
export async function hapusSesi(): Promise<void> {
  guardServerOnly();
  const jar = await cookies();
  jar.delete(NAMA_COOKIE_ADMIN);
}

/**
 * Pagar untuk halaman & server action admin.
 *
 * Sengaja tidak mengembalikan nilai: pemanggilnya harus menganggap fungsi ini
 * sebagai "kalau kamu sampai baris berikutnya, kamu pasti admin". Kalau tidak,
 * diarahkan ke halaman masuk.
 */
export async function wajibAdmin(): Promise<void> {
  guardServerOnly();
  if (!(await sesiAktif())) redirect("/admin/masuk");
}
