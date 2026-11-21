/**
 * Rate limiter sederhana di memori — dipakai bersama oleh proxy (API) dan
 * halaman masuk admin.
 *
 * Sifatnya per-instance: cukup untuk menahan spam tombol dan tebakan kata
 * sandi dari satu alamat, BUKAN pengganti rate limit terdistribusi
 * (Upstash/Vercel KV) kalau nanti berjalan di banyak instance sekaligus.
 *
 * Dulu logika ini nempel di dalam `proxy.ts`. Sekarang dipisah karena halaman
 * masuk admin butuh pembatas yang sama, dan dua salinan kode pembatas adalah
 * dua tempat untuk berbeda diam-diam.
 */

export interface RateLimiter {
  /** Kembalikan sisa detik tunggu kalau kena batas, atau `null` kalau lolos. */
  hit(key: string): number | null;
}

export interface RateLimiterOptions {
  /** Jumlah maksimum permintaan dalam satu jendela waktu. */
  max: number;
  /** Panjang jendela waktu dalam milidetik. */
  windowMs: number;
  /** Jarak antar pembersihan entri basi (opsional, default 5 menit). */
  sweepMs?: number;
}

export function createRateLimiter({
  max,
  windowMs,
  sweepMs = 5 * 60_000,
}: RateLimiterOptions): RateLimiter {
  const log = new Map<string, number[]>();
  let lastSweep = 0;

  /** Buang entri basi supaya Map tidak tumbuh tanpa batas (kebocoran memori). */
  function sweep(now: number): void {
    if (now - lastSweep < sweepMs) return;
    lastSweep = now;

    for (const [key, timestamps] of log) {
      const fresh = timestamps.filter((ts) => now - ts < windowMs);
      if (fresh.length === 0) log.delete(key);
      else log.set(key, fresh);
    }
  }

  return {
    hit(key: string): number | null {
      const now = Date.now();
      sweep(now);

      const timestamps = (log.get(key) ?? []).filter((ts) => now - ts < windowMs);

      if (timestamps.length >= max) {
        log.set(key, timestamps);
        const retryAfterMs = windowMs - (now - timestamps[0]);
        return Math.max(1, Math.ceil(retryAfterMs / 1000));
      }

      timestamps.push(now);
      log.set(key, timestamps);
      return null;
    },
  };
}

/**
 * Ambil alamat klien dari header. Di belakang proxy/Vercel, alamat asli ada di
 * `x-forwarded-for` (yang paling kiri). Kalau tidak ada sama sekali, semua
 * permintaan dianggap satu sumber — lebih baik terlalu ketat daripada lolos.
 */
export function clientIp(header: Headers): string {
  const forwarded = header.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return header.get("x-real-ip") ?? "unknown";
}
