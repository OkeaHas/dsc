import type { NextRequest } from "next/server";
import { getLeaderboard } from "@/server/leaderboard";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickLimit } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";

/**
 * GET /api/leaderboard — publik.
 * Query: ?limit=10 (default 10, maksimal 100)
 *
 * Leaderboard diambil dari kolom `points` di tabel `members` — tidak ada tabel
 * terpisah, sesuai catatan di src/lib/schema.sql.
 */
export async function GET(req: NextRequest) {
  try {
    const limit = pickLimit(req.nextUrl.searchParams.get("limit"), {
      fallback: 10,
      max: 100,
    });

    const { data, error } = await getLeaderboard(limit);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengambil data leaderboard", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil data leaderboard");
  }
}
