import type { NextRequest } from "next/server";
import {
  createEvent,
  getAllEvents,
  parseEventInput,
  resolveEventImage,
} from "@/server/events";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, pickLimit, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";

/**
 * GET /api/events — publik.
 *
 * Rate limit TIDAK lagi dipasang di sini. Versi lama membatasi 10 request per
 * menit per IP untuk GET, sehingga halaman yang memuat daftar kegiatan plus
 * beberapa gambar bisa kena 429 sendiri. Pembatasan sekarang ada di
 * src/proxy.ts dan hanya menyasar endpoint tulis publik.
 */
export async function GET(req: NextRequest) {
  try {
    const limit = pickLimit(req.nextUrl.searchParams.get("limit"), {
      fallback: 100,
      max: 200,
    });

    const { data, error } = await getAllEvents(limit);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengambil data kegiatan", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil data kegiatan");
  }
}

/**
 * POST /api/events — admin.
 * Field wajib: `title`, `event_date` (ISO 8601).
 * Opsional: `description`, `location`, `is_active`, file `image`.
 */
export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseRequest(req);

    const payload = parseEventInput(fields);
    const imagePath = await resolveEventImage(
      pickFile(files, "image", "image_url"),
      fields.image_url,
    );

    const { data, error } = await createEvent(payload, imagePath);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(201, "Kegiatan berhasil dibuat", data);
  } catch (error) {
    return apiError(error, "Gagal membuat kegiatan baru");
  }
}
