import type { NextRequest } from "next/server";
import {
  deleteMemberById,
  getMemberById,
  parseMemberFormData,
  updateMemberById,
} from "@/server/members";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, pickFlag, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";
import { requireUuid } from "@/utils/validate";

/** Next.js 16: `params` adalah Promise dan wajib di-await. */
interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/members/[id] — publik: detail satu anggota. */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id anggota");

    const { data, error } = await getMemberById(validId);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, `Detail anggota DSC: ${data?.name ?? validId}`, data);
  } catch (error) {
    return apiError(error, "Gagal mengambil detail anggota");
  }
}

/**
 * PUT /api/members/[id] — admin.
 *
 * Foto:
 *   - kirim file di `photo_url` / `photo` → foto diganti
 *   - kirim `remove_photo=true`           → foto dihapus
 *   - kirim keduanya                       → ditolak (400)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id anggota");
    const { fields, files } = await parseRequest(req);

    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== null && value !== undefined) formData.set(key, String(value));
    }
    const photoFile = pickFile(files, "photo_url", "photo");
    if (photoFile) formData.set("photo_url", photoFile);

    const { payload, photoFile: picked } = parseMemberFormData(formData);
    const removePhoto = pickFlag(fields, "remove_photo");

    const { data, error } = await updateMemberById(validId, payload, picked, removePhoto);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengubah data anggota DSC", data);
  } catch (error) {
    return apiError(error, "Gagal mengubah data anggota DSC");
  }
}

/** DELETE /api/members/[id] — admin. */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id anggota");

    const { data, error } = await deleteMemberById(validId);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil menghapus anggota DSC", data);
  } catch (error) {
    return apiError(error, "Gagal menghapus anggota DSC");
  }
}
