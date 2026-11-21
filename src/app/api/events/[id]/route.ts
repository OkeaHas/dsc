import type { NextRequest } from "next/server";
import {
  deleteEventById,
  getEventById,
  parseEventInput,
  resolveEventImage,
  updateEventById,
} from "@/server/events";
import { apiError, statusFromError } from "@/utils/api-error";
import { pickFile, pickFlag, parseRequest } from "@/utils/request";
import { errorResponse, response } from "@/utils/response";
import { requireUuid } from "@/utils/validate";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/events/[id] — publik: detail kegiatan. */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id kegiatan");

    const { data, error } = await getEventById(validId);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Berhasil mengambil detail kegiatan", data);
  } catch (error) {
    return apiError(error, "Gagal mengambil detail kegiatan");
  }
}

/**
 * PUT /api/events/[id] — admin: ubah kegiatan.
 * Field yang tidak dikirim tidak diubah.
 * Kirim `remove_image=true` untuk menghapus banner.
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id kegiatan");
    const { fields, files } = await parseRequest(req);

    const partial: Parameters<typeof updateEventById>[1] = {};

    if (fields.title !== undefined) partial.title = String(fields.title);
    if (fields.description !== undefined) {
      partial.description = fields.description === null ? null : String(fields.description);
    }
    if (fields.event_date !== undefined) {
      partial.event_date = String(fields.event_date);
    }
    if (fields.location !== undefined) {
      partial.location = fields.location === null ? null : String(fields.location);
    }
    if (fields.is_active !== undefined) {
      partial.is_active = ["true", "1", "yes", "on"].includes(
        String(fields.is_active).trim().toLowerCase(),
      );
    }

    // Validasi ulang field yang dikirim (judul/tanggal) memakai parser yang sama.
    const validated = parseEventInput({
      title: partial.title ?? "placeholder",
      description: partial.description ?? null,
      event_date: partial.event_date ?? new Date().toISOString(),
      location: partial.location ?? null,
      is_active: partial.is_active ?? true,
    });

    const payload = {
      ...(partial.title !== undefined ? { title: validated.title } : {}),
      ...(partial.description !== undefined ? { description: validated.description } : {}),
      ...(partial.event_date !== undefined ? { event_date: validated.event_date } : {}),
      ...(partial.location !== undefined ? { location: validated.location } : {}),
      ...(partial.is_active !== undefined ? { is_active: validated.is_active } : {}),
    };

    if (Object.keys(payload).length === 0) {
      return errorResponse(400, "Tidak ada field yang dikirim untuk diubah.");
    }

    const imageFile = pickFile(files, "image", "image_url");
    const removeImage = pickFlag(fields, "remove_image");

    if (imageFile && removeImage) {
      return errorResponse(400, "Tidak bisa menghapus dan mengganti banner sekaligus.");
    }

    const imagePath = await resolveEventImage(imageFile, fields.image_url);

    const { data, error } = await updateEventById(validId, payload, imagePath, removeImage);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Kegiatan berhasil diperbarui", data);
  } catch (error) {
    return apiError(error, "Gagal memperbarui kegiatan");
  }
}

/** DELETE /api/events/[id] — admin. */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const validId = requireUuid(id, "id kegiatan");

    const { data, error } = await deleteEventById(validId);
    if (error) return errorResponse(statusFromError(error), error.message);

    return response(200, "Kegiatan berhasil dihapus", data);
  } catch (error) {
    return apiError(error, "Gagal menghapus kegiatan");
  }
}
