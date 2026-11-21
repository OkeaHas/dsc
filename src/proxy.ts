import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE_ADMIN, tokenSesiValid } from "@/lib/admin-session";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

/**
 * PROXY — "satpam" API DSC.
 *
 * Di Next.js 16 file `middleware.ts` sudah deprecated dan diganti `proxy.ts`
 * dengan nama fungsi `proxy`. Runtime-nya Node.js (tidak bisa diganti), jadi
 * `process.env` tetap terbaca normal.
 *
 * Aturan akses:
 *   GET  /api/members, /api/news, /api/events, /api/leaderboard  → publik
 *   GET  /api/feedback, /api/attendance                          → admin (token)
 *   POST /api/feedback, /api/attendance                          → publik
 *   POST/PUT/PATCH/DELETE selain dua di atas                     → admin (token)
 *   /admin/*                                                     → butuh sesi admin
 *
 * Catatan soal /admin: proxy hanya menjaga permintaan GET. Server action
 * (POST ke halaman admin) sengaja dibiarkan lewat, karena di dalam action-nya
 * sendiri sudah ada `wajibAdmin()`; meredirect permintaan POST justru membuat
 * pengiriman form gagal dengan pesan yang membingungkan.
 */

// ─── Rate limit untuk endpoint tulis publik ────────────────────────────────
//
// Sebelumnya rate limit dipasang di GET /api/events sehingga halaman yang
// memuat daftar kegiatan bisa kena 429 sendiri. Sekarang hanya endpoint tulis
// publik (absen & feedback) yang dibatasi — itu yang bisa disalahgunakan.
//
// Logikanya sendiri ada di `src/lib/rate-limit.ts` supaya halaman masuk admin
// memakai pembatas yang sama, bukan salinannya.

const pembatasTulis = createRateLimiter({ max: 10, windowMs: 60_000 });

/** Halaman masuk panel admin — satu-satunya halaman /admin tanpa sesi. */
const JALUR_MASUK = "/admin/masuk";

/**
 * Perbandingan string dengan waktu konstan.
 *
 * `a !== b` berhenti di karakter pertama yang beda, sehingga panjang waktu
 * eksekusinya bisa dipakai untuk menebak token karakter demi karakter.
 * Dipakai untuk membandingkan Bearer token endpoint tulis; versi untuk kata
 * sandi admin ada di `src/lib/admin-session.ts`.
 */

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function jsonError(status: number, message: string, headers?: Record<string, string>) {
  return NextResponse.json({ status: false, message, data: null }, { status, headers });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const isReadMethod = method === "GET" || method === "HEAD";

  // ── Halaman admin: cukup sesi yang sah ───────────────────────────────────
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "admin") {
    if (!isReadMethod) return NextResponse.next();

    const diHalamanMasuk = pathname === JALUR_MASUK;
    const token = request.cookies.get(NAMA_COOKIE_ADMIN)?.value;
    const sesiSah = await tokenSesiValid(token);

    // Sudah masuk tapi masih membuka halaman masuk → antar ke ringkasan.
    if (sesiSah) {
      return diHalamanMasuk
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.next();
    }

    // Belum masuk DAN sedang di halaman masuk → biarkan lewat.
    //
    // Ini bukan kehati-hatian berlebih: tanpa baris ini halaman masuk
    // meredirect dirinya ke dirinya sendiri, dan peramban berhenti dengan
    // ERR_TOO_MANY_REDIRECTS. Halaman masuk tidak boleh ikut dipagari.
    if (diHalamanMasuk) return NextResponse.next();

    const masuk = new URL(JALUR_MASUK, request.url);
    masuk.searchParams.set("dari", pathname);
    return NextResponse.redirect(masuk);
  }

  // Path dicocokkan tepat, bukan `startsWith`. Versi lama memakai
  // startsWith('/api/feedback') sehingga '/api/feedback-rahasia' ikut lolos.
  const resource = segments[1] ?? "";
  const isFeedback = resource === "feedback";
  const isAttendance = resource === "attendance";
  const isPublicWriteEndpoint = isFeedback || isAttendance;

  // Preflight CORS tidak perlu token.
  if (method === "OPTIONS") return NextResponse.next();

  const isPublicAccess = isReadMethod
    ? !isPublicWriteEndpoint
    : method === "POST" && isPublicWriteEndpoint;

  // ── Endpoint publik: cukup dibatasi rate limit ───────────────────────────
  if (isPublicAccess) {
    if (method === "POST") {
      const retryAfter = pembatasTulis.hit(`write:${clientIp(request.headers)}`);
      if (retryAfter !== null) {
        return jsonError(429, "Terlalu banyak permintaan. Coba lagi sebentar lagi.", {
          "Retry-After": String(retryAfter),
        });
      }
    }
    return NextResponse.next();
  }

  // ── Endpoint admin: wajib Bearer token ───────────────────────────────────
  const secretKey = process.env.API_SECRET_KEY?.trim();

  // Kalau kunci belum di-set, JANGAN luluskan apa pun. Tanpa penjagaan ini,
  // header "Bearer undefined" bisa dipakai menembus semua endpoint admin.
  if (!secretKey) {
    return jsonError(
      503,
      "Server belum dikonfigurasi: API_SECRET_KEY belum diisi di file .env.",
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !safeEqual(token, secretKey)) {
    return jsonError(401, "Unauthorized: token admin tidak valid atau tidak ada.");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
