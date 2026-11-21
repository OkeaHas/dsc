import type { SocialLinks } from "@/lib/types";

/**
 * Kumpulan validator + parser untuk input dari luar (form-data & JSON body).
 *
 * Semua kegagalan validasi di-`throw` sebagai ValidationError supaya route
 * handler bisa membedakan 400 (salah input) dari 500 (salah server).
 */
export class ValidationError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }
}

/** UUID v1–v8 (gen_random_uuid() menghasilkan v4). */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value.trim());
}

/**
 * Validasi id dari URL segment. Tanpa ini, id ngawur (misal "abc") diteruskan
 * ke Postgres dan berbalas error 22P02 → upstream mengembalikan 500 padahal
 * seharusnya 400.
 */
export function requireUuid(value: unknown, label = "id"): string {
  if (!isUuid(value)) {
    throw new ValidationError(`Format ${label} tidak valid (harus UUID).`);
  }
  return (value as string).trim();
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

export function requireText(
  value: unknown,
  label: string,
  { max = 255, min = 1 }: { max?: number; min?: number } = {},
): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < min) {
    throw new ValidationError(`${label} wajib diisi.`);
  }
  if (text.length > max) {
    throw new ValidationError(`${label} maksimal ${max} karakter.`);
  }
  return text;
}

export function optionalText(value: unknown, max = 255): string | null {
  if (value === null || value === undefined) return null;
  const text = typeof value === "string" ? value.trim() : String(value).trim();
  if (!text) return null;
  if (text.length > max) {
    throw new ValidationError(`Teks maksimal ${max} karakter.`);
  }
  return text;
}

/**
 * `Number("")` = 0 dan `Number("abc")` = NaN. Nilai NaN yang dikirim ke kolom
 * INTEGER bikin insert gagal, jadi selalu disaring di sini.
 */
export function parsePoints(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

export function parseBoolean(value: unknown, fallback = true): boolean {
  if (value === null || value === undefined || value === "") return fallback;
  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(text)) return true;
  if (["false", "0", "no", "off"].includes(text)) return false;
  return fallback;
}

/**
 * Kolom `social_links` bertipe JSONB. Form-data mengirimnya sebagai string,
 * sehingga string kosong akan ditolak Postgres ("invalid input syntax for
 * type json"). Fungsi ini mem-parse sekaligus membersihkan isinya.
 */
export function parseSocialLinks(value: unknown): SocialLinks | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return sanitizeSocialLinks(value as Record<string, unknown>);
  }

  const text = String(value).trim();
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ValidationError(
      "social_links harus berupa JSON object, contoh: {\"instagram\":\"@dsc\",\"linkedin\":\"...\"}",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ValidationError("social_links harus berupa JSON object.");
  }

  return sanitizeSocialLinks(parsed as Record<string, unknown>);
}

function sanitizeSocialLinks(raw: Record<string, unknown>): SocialLinks | null {
  const clean: SocialLinks = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (!text) continue;
    clean[key.slice(0, 40)] = text.slice(0, 300);
  }
  return Object.keys(clean).length > 0 ? clean : null;
}

/** Validasi tanggal ISO 8601 yang bisa dibaca Date.parse. */
export function requireIsoDate(value: unknown, label: string): string {
  const text = requireText(value, label, { max: 40 });
  if (Number.isNaN(Date.parse(text))) {
    throw new ValidationError(
      `${label} tidak valid. Gunakan format ISO 8601 (contoh: 2026-10-05T09:00:00+08:00).`,
    );
  }
  return new Date(text).toISOString();
}

/** Slug ramah-URL dari judul. Dipakai kalau admin tidak mengirim slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200)
    .replace(/^-+|-+$/g, "");
}

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
