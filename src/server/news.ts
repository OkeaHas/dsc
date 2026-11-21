import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { News } from "@/lib/types";
import { deleteImage, imageUrl, uploadImage } from "@/utils/uploadImage";
import {
  requireText,
  slugify,
  ValidationError,
  isHttpUrl,
} from "@/utils/validate";
import { dalFail, dalOk, isNotFoundError, type DalResult } from "./types";

/**
 * Data Access Layer tabel `news`.
 *
 * Perbedaan penting dari versi lama:
 *  - Baca pakai client anon, tulis pakai service role. Sebelumnya semua operasi
 *    (termasuk INSERT/UPDATE/DELETE) memakai anon key, sehingga begitu RLS
 *    dinyalakan, semua penulisan berita langsung gagal.
 *  - Semua fungsi mengembalikan `DalResult<T>` yang SAMA, sehingga route handler
 *    bisa konsisten memakai `const { data, error } = await ...`. Versi lama
 *    melempar error di sini tapi di-destructure seperti objek di route-nya.
 */

const NEWS_COLUMNS = "id, title, slug, content, cover_image_url, created_at";

export function mapNews(row: News): News {
  return { ...row, cover_image_url: imageUrl(row.cover_image_url) };
}

export async function getAllNews(limit = 50): Promise<DalResult<News[]>> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select(NEWS_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error) return dalFail(error, "Gagal mengambil daftar berita");
    return dalOk(((data ?? []) as News[]).map(mapNews));
  } catch (err) {
    return dalFail(err, "Gagal mengambil daftar berita");
  }
}

export async function getNewsBySlug(slug: string): Promise<DalResult<News>> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select(NEWS_COLUMNS)
      .eq("slug", slug)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Berita tidak ditemukan."), "Berita tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal mengambil detail berita");

    return dalOk(mapNews(data as News));
  } catch (err) {
    return dalFail(err, "Gagal mengambil detail berita");
  }
}

export interface CreateNewsInput {
  title: string;
  slug?: string;
  content: string;
  cover_image_url?: string | null;
  coverFile?: File | null;
}

/**
 * Payload untuk UPDATE — semua field opsional (patch semantics).
 * Field yang tidak dikirim tidak diubah.
 */
export interface UpdateNewsInput {
  title?: string;
  slug?: string;
  content?: string;
  cover_image_url?: string | null;
  coverFile?: File | null;
}

/**
 * Membuat slug yang pasti unik. Kalau "hackathon-dsc" sudah dipakai,
 * hasilnya jadi "hackathon-dsc-2", "-3", dan seterusnya.
 */
async function ensureUniqueSlug(base: string, ignoreSlug?: string): Promise<string> {
  const root = slugify(base) || `berita-${Date.now()}`;

  const { data, error } = await supabaseAdmin
    .from("news")
    .select("slug")
    .like("slug", `${root}%`);

  if (error) throw new Error(error.message);

  const taken = new Set(
    (data ?? [])
      .map((row) => row.slug as string)
      .filter((slug) => slug !== ignoreSlug),
  );

  if (!taken.has(root)) return root;

  let counter = 2;
  while (taken.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}

export async function createNews(input: CreateNewsInput): Promise<DalResult<News>> {
  let uploadedPath: string | null = null;

  try {
    const title = requireText(input.title, "Judul", { max: 255 });
    const content = requireText(input.content, "Konten", { max: 100_000 });

    if (input.coverFile) {
      uploadedPath = await uploadImage(input.coverFile);
    }

    const coverUrl = uploadedPath
      ? uploadedPath
      : isHttpUrl(input.cover_image_url)
        ? input.cover_image_url.trim()
        : null;

    const slug = input.slug?.trim()
      ? await ensureUniqueSlug(input.slug)
      : await ensureUniqueSlug(title);

    const { data, error } = await supabaseAdmin
      .from("news")
      .insert({
        title,
        slug,
        content,
        cover_image_url: coverUrl,
      })
      .select(NEWS_COLUMNS)
      .single();

    if (error) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      // 23505 = unique_violation (slug sudah dipakai)
      if (error.code === "23505") {
        return dalFail(
          new Error("Slug berita sudah dipakai, gunakan slug lain."),
          "Slug berita sudah dipakai.",
        );
      }
      return dalFail(error, "Gagal membuat berita");
    }

    return dalOk(mapNews(data as News));
  } catch (err) {
    if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
    return dalFail(err, "Gagal membuat berita");
  }
}

export async function updateNewsBySlug(
  slug: string,
  input: UpdateNewsInput,
): Promise<DalResult<News>> {
  let uploadedPath: string | null = null;

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("news")
      .select("id, slug, cover_image_url")
      .eq("slug", slug)
      .single();

    if (isNotFoundError(findError)) {
      return dalFail(new Error("Berita tidak ditemukan."), "Berita tidak ditemukan.");
    }
    if (findError) return dalFail(findError, "Gagal membaca berita");

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      updateData.title = requireText(input.title, "Judul", { max: 255 });
    }
    if (input.content !== undefined) {
      updateData.content = requireText(input.content, "Konten", { max: 100_000 });
    }
    if (input.slug !== undefined && input.slug.trim()) {
      updateData.slug = await ensureUniqueSlug(input.slug.trim(), slug);
    }

    if (input.coverFile) {
      uploadedPath = await uploadImage(input.coverFile);
      updateData.cover_image_url = uploadedPath;
    } else if (isHttpUrl(input.cover_image_url)) {
      updateData.cover_image_url = input.cover_image_url.trim();
    } else if (input.cover_image_url === null) {
      updateData.cover_image_url = null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("Tidak ada field yang dikirim untuk diubah.");
    }

    const { data, error } = await supabaseAdmin
      .from("news")
      .update(updateData)
      .eq("slug", slug)
      .select(NEWS_COLUMNS)
      .single();

    if (error) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      if (error.code === "23505") {
        return dalFail(
          new Error("Slug berita sudah dipakai, gunakan slug lain."),
          "Slug berita sudah dipakai.",
        );
      }
      return dalFail(error, "Gagal memperbarui berita");
    }

    const oldCover = (existing?.cover_image_url as string | null) ?? null;
    if (oldCover && uploadedPath) {
      await deleteImage(oldCover).catch(() => {});
    }

    return dalOk(mapNews(data as News));
  } catch (err) {
    if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
    return dalFail(err, "Gagal memperbarui berita");
  }
}

export async function deleteNewsBySlug(slug: string): Promise<DalResult<News>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("news")
      .delete()
      .eq("slug", slug)
      .select(NEWS_COLUMNS)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Berita tidak ditemukan."), "Berita tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal menghapus berita");

    const news = mapNews(data as News);
    if (news.cover_image_url) {
      await deleteImage(news.cover_image_url).catch(() => {});
    }

    return dalOk(news);
  } catch (err) {
    return dalFail(err, "Gagal menghapus berita");
  }
}
