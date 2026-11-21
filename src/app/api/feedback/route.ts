import type { NextRequest } from "next/server";
import { createFeedback, getAllFeedbacks } from "@/server/feedback";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickLimit, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";
import { requireUuid } from "@/utils/validate";
import { deleteFeedbackById } from "@/server/feedback";

/**
 * GET /api/feedback — ADMIN (dibatasi src/proxy.ts).
 * Hanya admin yang boleh membaca kotak masuk kritik & saran.
 */
export async function GET(req: NextRequest) {
  try {
    const limit = pickLimit(req.nextUrl.searchParams.get("limit"), {
      fallback: 100,
      max: 500,
    });

    const { data, error } = await getAllFeedbacks(limit);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengambil data feedback", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil data feedback");
  }
}

/**
 * POST /api/feedback — PUBLIK.
 * Body: { message (wajib), sender_name?, sender_email? }
 */
export async function POST(req: NextRequest) {
  try {
    const { fields } = await parseRequest(req);

    const { data, error } = await createFeedback({
      message: fields.message,
      sender_name: fields.sender_name ?? fields.name,
      sender_email: fields.sender_email ?? fields.email,
    });

    if (error) return errorResponse(statusFromError(error), error.message);
    return response(201, "Terima kasih! Kritik & saran kamu sudah kami terima.", data);
  } catch (error) {
    return apiError(error, "Gagal mengirim feedback");
  }
}

/** DELETE /api/feedback?id=... — ADMIN: hapus satu feedback. */
export async function DELETE(req: NextRequest) {
  try {
    const id = requireUuid(req.nextUrl.searchParams.get("id"), "id feedback");

    const { data, error } = await deleteFeedbackById(id);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Feedback berhasil dihapus", data);
  } catch (error) {
    return apiError(error, "Gagal menghapus feedback");
  }
}
