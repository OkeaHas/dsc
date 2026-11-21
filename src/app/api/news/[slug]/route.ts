import type { NextRequest } from "next/server";
import { deleteNewsBySlug, getNewsBySlug, updateNewsBySlug } from "@/server/news";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";
import { requireText } from "@/utils/validate";

/**
 * Di Next.js 16 `params` WAJIB berupa Promise dan harus di-`await`.
 * Versi lama memakai `params.slug` langsung — di Next 16 itu nilainya
 * `undefined`, sehingga detail berita tidak pernah ketemu.
 */
interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function readSlug(context: RouteContext): Promise<string> {
  const { slug } = await context.params;
  return requireText(decodeURIComponent(slug), "Slug", { max: 255 });
}

/** GET /api/news/[slug] — publik: detail berita. */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const slug = await readSlug(context);
    const { data, error } = await getNewsBySlug(slug);

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(200, "Berhasil mengambil detail berita", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil detail berita");
  }
}

/**
 * PUT /api/news/[slug] — admin: ubah berita.
 *
 * Field yang tidak dikirim tidak diubah (patch semantics), berbeda dari versi
 * lama yang mengoper seluruh body mentah ke `.update()` — body kosong pun
 * dianggap sah dan bisa menimpa kolom dengan nilai aneh.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const slug = await readSlug(context);
    const { fields, files } = await parseRequest(req);

    const hasCover = pickFile(files, "cover_image", "cover") !== null;

    // `cover_image_url: null` (eksplisit) = hapus cover.
    // Key tidak dikirim sama sekali      = cover tidak disentuh.
    const coverProvided = Object.prototype.hasOwnProperty.call(fields, "cover_image_url");

    const { data, error } = await updateNewsBySlug(slug, {
      title: fields.title as string | undefined,
      slug: (fields.new_slug ?? fields.slug) as string | undefined,
      content: fields.content as string | undefined,
      cover_image_url: coverProvided ? (fields.cover_image_url as string | null) : undefined,
      coverFile: hasCover ? pickFile(files, "cover_image", "cover") : null,
    });

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(200, "Berita berhasil diperbarui", data);
  } catch (error) {
    return apiError(error, "Gagal memperbarui berita");
  }
}

/** DELETE /api/news/[slug] — admin. */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const slug = await readSlug(context);
    const { data, error } = await deleteNewsBySlug(slug);

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(200, "Berita berhasil dihapus", data);
  } catch (error) {
    return apiError(error, "Gagal menghapus berita");
  }
}
