import type { NextRequest } from "next/server";
import { createMember, getAllMembers, parseMemberFormData } from "@/server/members";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, pickFlag, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";

/** GET /api/members — publik: daftar seluruh anggota DSC. */
export async function GET() {
  try {
    const { data, error } = await getAllMembers();
    if (error) return errorResponse(statusFromError(error), error.message);
    return response(200, "Berhasil mengambil daftar anggota DSC", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil daftar anggota DSC");
  }
}

/**
 * POST /api/members — admin (Bearer token).
 * Menerima JSON maupun form-data. File foto dikirim di field `photo_url` (atau `photo`).
 */
export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseRequest(req);

    if (pickFlag(fields, "remove_photo")) {
      return errorResponse(400, "Anggota baru belum punya foto untuk dihapus.");
    }

    // Bentuk ulang jadi FormData supaya parser anggota tetap satu pintu.
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== null && value !== undefined) formData.set(key, String(value));
    }
    const photoFile = pickFile(files, "photo_url", "photo");
    if (photoFile) formData.set("photo_url", photoFile);

    const { payload, photoFile: picked } = parseMemberFormData(formData);

    const { data, error } = await createMember(payload, picked);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(201, "Berhasil menambahkan anggota DSC", data);
  } catch (error) {
    return apiError(error, "Gagal menambahkan anggota DSC");
  }
}
