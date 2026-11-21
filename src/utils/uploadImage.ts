import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseUrl } from "@/lib/env";

/**
 * Utilitas Supabase Storage untuk seluruh bucket `images`.
 *
 * Konvensi penting (dulu sumber bug):
 *   - Yang DISIMPAN di kolom database adalah NAMA FILE (path di bucket),
 *     contoh: "3f2b...-a1.png" — bukan URL penuh.
 *   - Yang DIKIRIM ke frontend adalah URL publik siap pakai, dibentuk oleh
 *     `imageUrl()`. Jadi `deleteImage()` selalu menerima path yang benar.
 */

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "images";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Ekstensi ditentukan dari MIME type, BUKAN dari nama file kiriman user.
 * Nama file bisa saja "foto.jpeg.exe" atau tidak punya ekstensi sama sekali.
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(MIME_TO_EXTENSION);
export const MAX_IMAGE_SIZE_BYTES = MAX_SIZE;

/**
 * Mengunggah file gambar ke Supabase Storage.
 *
 * @returns Nama file baru (UUID + ekstensi) — SIMPAN nilai ini ke database.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!MIME_TO_EXTENSION[file.type]) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan jpeg, png, webp, gif, atau avif.",
    );
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  if (file.size === 0) {
    throw new Error("File gambar kosong.");
  }

  const extension = MIME_TO_EXTENSION[file.type];
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah gambar: ${error.message}`);
  }

  return fileName;
}

/**
 * Mengubah nilai kolom `photo_url` / `image_url` menjadi URL publik Supabase.
 *
 * Toleran terhadap data lama: kalau nilainya sudah berupa URL absolut
 * (http/https), nilainya dikembalikan apa adanya. Berguna saat proses migrasi
 * dari versi kode sebelumnya yang menyimpan URL penuh.
 */
export function imageUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const text = value.trim();
  if (!text) return null;

  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith("/")) return text; // file di public/ lokal

  return `${getSupabaseUrl().replace(/\/+$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${text.replace(/^\/+/, "")}`;
}

/** Kebalikan dari `imageUrl()`: ambil path mentah dari nilai apa pun. */
export function toStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;

  const text = value.trim();
  if (!text) return null;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = text.indexOf(marker);
  if (index !== -1) return text.slice(index + marker.length);

  if (/^https?:\/\//i.test(text)) return null; // URL luar, bukan milik kita
  if (text.startsWith("/")) return null; // file lokal di public/

  return text.replace(/^\/+/, "");
}

/** Menghapus file gambar dari Supabase Storage. Aman untuk path maupun URL. */
export async function deleteImage(fileNameOrUrl: string): Promise<void> {
  const path = toStoragePath(fileNameOrUrl);
  if (!path) return;

  const { error } = await getSupabaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Gagal menghapus gambar: ${error.message}`);
  }
}
