/**
 * Token sesi admin — murni hitung-hitungan, tanpa sentuhan ke `next/headers`.
 *
 * Kenapa dipisah dari `admin-auth.ts`: berkas ini diimpor juga oleh
 * `src/proxy.ts`, sedangkan `admin-auth.ts` memakai `cookies()`/`headers()`
 * yang tidak boleh dipanggil dari proxy. Jadi bagian kripto berdiri sendiri.
 *
 * Cara kerjanya sengaja tanpa database:
 *   nilai cookie = "<waktu-kedaluwarsa>.<HMAC-SHA256(waktu-kedaluwarsa)>"
 *
 * Kunci HMAC diambil dari `ADMIN_SESSION_SECRET` kalau ada. Kalau tidak, kunci
 * diturunkan dari `ADMIN_PASSWORD` + `API_SECRET_KEY` supaya tidak wajib ada
 * environment variable baru — tapi mengganti salah satu dari keduanya otomatis
 * membatalkan semua sesi yang beredar (efek samping yang justru berguna).
 */

const encoder = new TextEncoder();

export const NAMA_COOKIE_ADMIN = "dsc_admin";
export const DURASI_SESI_MS = 8 * 60 * 60 * 1000; // 8 jam

/** Label versi ikut ditandatangani, jadi token lama bisa dimatikan sekali gus. */
const VERSI = "dsc-admin-v1";

function kunciTandaTangan(): string {
  const rahasia = process.env.ADMIN_SESSION_SECRET?.trim();
  if (rahasia) return `${VERSI}:rahasia:${rahasia}`;

  const sandi = process.env.ADMIN_PASSWORD?.trim();
  if (!sandi) {
    throw new Error(
      "ADMIN_PASSWORD belum diisi. Tambahkan ke file .env " +
        "(lihat .env.example) supaya halaman admin bisa dipakai.",
    );
  }

  const api = process.env.API_SECRET_KEY?.trim() ?? "";
  return `${VERSI}:turunan:${sandi}|${api}`;
}

function keHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(pesan: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(kunciTandaTangan()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(pesan));
  return keHex(signature);
}

/**
 * Perbandingan string dengan waktu konstan.
 *
 * `a === b` berhenti di karakter pertama yang beda, sehingga lama eksekusinya
 * bisa dipakai menebak nilai karakter demi karakter. Dipakai untuk membandingkan
 * kata sandi maupun tanda tangan token.
 */
export function samaAman(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Kata sandi admin benar? `false` kalau env-nya belum diisi (tutup, bukan buka). */
export async function periksaKataSandi(teks: string): Promise<boolean> {
  const benar = process.env.ADMIN_PASSWORD?.trim();
  if (!benar) return false;
  return samaAman(teks, benar);
}

export async function buatTokenSesi(
  sekarangMs = Date.now(),
): Promise<{ nilai: string; kedaluwarsaMs: number }> {
  const kedaluwarsaMs = sekarangMs + DURASI_SESI_MS;
  const tanda = await hmac(String(kedaluwarsaMs));
  return { nilai: `${kedaluwarsaMs}.${tanda}`, kedaluwarsaMs };
}

export async function tokenSesiValid(
  nilai: string | undefined | null,
  sekarangMs = Date.now(),
): Promise<boolean> {
  if (!nilai) return false;

  const pisah = nilai.indexOf(".");
  if (pisah <= 0) return false;

  const kedaluwarsa = nilai.slice(0, pisah);
  const tanda = nilai.slice(pisah + 1);

  const ms = Number(kedaluwarsa);
  if (!Number.isFinite(ms) || ms <= sekarangMs) return false;

  return samaAman(tanda, await hmac(kedaluwarsa));
}
