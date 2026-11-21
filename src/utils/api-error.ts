import { errorResponse } from "./response";
import { ValidationError } from "./validate";

/**
 * Pemetaan error → status HTTP.
 *
 * Pesan error di DAL semuanya ditulis sendiri (bahasa Indonesia) dan bersifat
 * tetap, jadi pencocokan teks di satu tempat ini deterministik. Prinsipnya:
 * kesalahan input user jangan pernah berbalas 500 — itu menyesatkan saat debug
 * dan bikin log penuh "server error" padahal cuma email salah format.
 */

const NOT_FOUND_PATTERN = /tidak ditemukan/i;
const CONFLICT_PATTERN = /sudah terdaftar|sudah dipakai|sudah ada/i;
const BAD_REQUEST_PATTERN =
  /wajib diisi|maksimal \d+|tidak valid|sudah ditutup|tidak bisa|tidak dapat|format|harus berupa|tidak ada field/i;

export function statusFromError(error: Error | null, fallback = 500): number {
  const message = error?.message ?? "";
  if (!message) return fallback;

  if (NOT_FOUND_PATTERN.test(message)) return 404;
  if (CONFLICT_PATTERN.test(message)) return 409;
  if (BAD_REQUEST_PATTERN.test(message)) return 400;

  return fallback;
}

/** Ubah error apa pun menjadi response API yang rapi. */
export function apiError(error: unknown, fallbackMessage = "Terjadi kesalahan pada server") {
  if (error instanceof ValidationError) {
    return errorResponse(error.statusCode, error.message);
  }

  if (error instanceof Error && error.message) {
    const status = statusFromError(error);
    const debugMode = process.env.NODE_ENV !== "production";

    // Di production jangan bocorkan pesan internal Postgres ke publik.
    if (status === 500 && !debugMode) {
      return errorResponse(500, fallbackMessage);
    }
    return errorResponse(status, error.message);
  }

  return errorResponse(500, fallbackMessage);
}
