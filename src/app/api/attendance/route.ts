import type { NextRequest } from "next/server";
import {
  createAttendance,
  getAllAttendance,
  getAttendanceByEvent,
  parseAttendanceInput,
} from "@/server/attendance";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickLimit, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";

/**
 * GET /api/attendance — ADMIN (dibatasi src/proxy.ts).
 * Tanpa `?event_id=` → rekap semua kegiatan.
 * Dengan `?event_id=` → rekap satu kegiatan.
 */
export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("event_id");

    if (eventId) {
      const { data, error } = await getAttendanceByEvent(eventId);
      if (error) return errorResponse(statusFromError(error), error.message);
      return response(200, "Berhasil mengambil rekap absen kegiatan", data);
    }

    const limit = pickLimit(req.nextUrl.searchParams.get("limit"), {
      fallback: 200,
      max: 500,
    });
    const { data, error } = await getAllAttendance(limit);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengambil seluruh data absen", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil data absen");
  }
}

/**
 * POST /api/attendance — PUBLIK (pendaftaran absen peserta).
 * Body: { event_id, participant_name, participant_email, institution? }
 *
 * Kegiatan harus ada dan `is_active` masih true. Satu email hanya boleh absen
 * sekali per kegiatan (dijaga unique index di database).
 */
export async function POST(req: NextRequest) {
  try {
    const { fields } = await parseRequest(req);
    const eventId = String(fields.event_id ?? "").trim();

    if (!eventId) {
      return errorResponse(400, "event_id wajib diisi.");
    }

    const input = parseAttendanceInput({
      participant_name: fields.participant_name ?? fields.name,
      participant_email: fields.participant_email ?? fields.email,
      institution: fields.institution,
    });

    const { data, error } = await createAttendance(eventId, input);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(201, "Absen berhasil dicatat. Sampai jumpa di kegiatan!", data);
  } catch (error) {
    return apiError(error, "Gagal mencatat absen");
  }
}
