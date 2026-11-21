import type { NextRequest } from "next/server";
import { createNews, getAllNews } from "@/server/news";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, pickLimit, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";

/** GET /api/news — publik: daftar berita terbaru. */
export async function GET(req: NextRequest) {
  try {
    const limit = pickLimit(req.nextUrl.searchParams.get("limit"), { fallback: 50, max: 100 });
    const { data, error } = await getAllNews(limit);

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(200, "Berhasil mengambil daftar berita", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil daftar berita");
  }
}

/**
 * POST /api/news — admin.
 * JSON: { title, slug?, content, cover_image_url? }
 * form-data: sama, tapi `cover_image` boleh berupa file.
 *
 * `slug` opsional — kalau tidak dikirim, dibuat otomatis dari judul.
 */
export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseRequest(req);

    const { data, error } = await createNews({
      title: fields.title as string,
      slug: fields.slug as string | undefined,
      content: fields.content as string,
      cover_image_url: (fields.cover_image_url as string | null) ?? null,
      coverFile: pickFile(files, "cover_image", "cover"),
    });

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(201, "Berita berhasil dibuat", data);
  } catch (error) {
    return apiError(error, "Gagal menambahkan berita");
  }
}
