/**
 * Pembaca body request yang toleran.
 *
 * Satu endpoint harus bisa menerima dua bentuk kiriman:
 *   - JSON           → dipakai oleh form di frontend (via fetch)
 *   - multipart/form-data → dipakai kalau ada file gambar (foto, cover, banner)
 *
 * Dulu tiap route memilih sendiri (`req.json()` ATAU `req.formData()`), jadi
 * endpoint yang sama tidak bisa dipakai dua cara. Helper ini menyatukannya.
 */

export interface ParsedRequest {
  /** Field non-file. Nilainya string (dari form-data) atau tipe asli (dari JSON). */
  fields: Record<string, unknown>;
  /** File yang ikut terkirim, di-key sesuai nama field-nya. */
  files: Record<string, File>;
}

const EMPTY: ParsedRequest = { fields: {}, files: {} };

export async function parseRequest(req: Request): Promise<ParsedRequest> {
  const contentType = (req.headers.get("content-type") ?? "").toLowerCase();

  if (contentType.includes("application/json")) {
    const text = await req.text();
    if (!text.trim()) return EMPTY;

    try {
      const parsed = JSON.parse(text) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
      return { fields: parsed as Record<string, unknown>, files: {} };
    } catch {
      throw new Error("Body JSON tidak valid.");
    }
  }

  // multipart/form-data dan application/x-www-form-urlencoded.
  try {
    const formData = await req.formData();
    const fields: Record<string, unknown> = {};
    const files: Record<string, File> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) files[key] = value;
      } else {
        fields[key] = value;
      }
    }

    return { fields, files };
  } catch {
    throw new Error("Format body request tidak dikenali (gunakan JSON atau form-data).");
  }
}

/** Ambil file pertama yang ada dari beberapa kemungkinan nama field. */
export function pickFile(
  files: Record<string, File>,
  ...keys: string[]
): File | null {
  for (const key of keys) {
    const file = files[key];
    if (file) return file;
  }
  return null;
}

/** Field boolean dari form-data sering dikirim sebagai string "true"/"1". */
export function pickFlag(fields: Record<string, unknown>, key: string): boolean {
  const value = fields[key];
  if (value === true) return true;
  if (value === null || value === undefined) return false;
  return ["true", "1", "yes", "on"].includes(String(value).trim().toLowerCase());
}

/** Angka bulat yang aman dari query string, dengan batas atas & bawah. */
export function pickLimit(
  value: string | null,
  { fallback = 10, min = 1, max = 100 }: { fallback?: number; min?: number; max?: number } = {},
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}
