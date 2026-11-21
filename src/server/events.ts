import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Event } from "@/lib/types";
import { deleteImage, imageUrl, uploadImage } from "@/utils/uploadImage";
import { isHttpUrl, optionalText, requireIsoDate, requireText } from "@/utils/validate";
import { dalFail, dalOk, isNotFoundError, type DalResult } from "./types";

/**
 * Data Access Layer tabel `events` (roadmap / daftar kegiatan).
 *
 * Baca publik lewat anon client, penulisan lewat service role. Semua fungsi
 * mengembalikan `DalResult<T>` yang sama supaya route handler-nya seragam.
 */

const EVENT_COLUMNS =
  "id, title, description, event_date, location, image_url, is_active, created_at";

export function mapEvent(row: Event): Event {
  return { ...row, image_url: imageUrl(row.image_url) };
}

export async function getAllEvents(limit = 100): Promise<DalResult<Event[]>> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("event_date", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200));

    if (error) return dalFail(error, "Gagal mengambil data kegiatan");
    return dalOk(((data ?? []) as Event[]).map(mapEvent));
  } catch (err) {
    return dalFail(err, "Gagal mengambil data kegiatan");
  }
}

/**
 * Kegiatan yang akan datang, urut paling dekat.
 * Dipakai halaman depan & halaman roadmap.
 */
export async function getUpcomingEvents(limit = 6): Promise<DalResult<Event[]>> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(Math.min(Math.max(limit, 1), 50));

    if (error) return dalFail(error, "Gagal mengambil agenda terdekat");
    return dalOk(((data ?? []) as Event[]).map(mapEvent));
  } catch (err) {
    return dalFail(err, "Gagal mengambil agenda terdekat");
  }
}

export async function getEventById(id: string): Promise<DalResult<Event>> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("id", id)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Kegiatan tidak ditemukan."), "Kegiatan tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal mengambil detail kegiatan");

    return dalOk(mapEvent(data as Event));
  } catch (err) {
    return dalFail(err, "Gagal mengambil detail kegiatan");
  }
}

export interface EventInput {
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
}

/** Payload event dari FormData atau JSON. Melempar ValidationError. */
export function parseEventInput(raw: {
  title?: unknown;
  description?: unknown;
  event_date?: unknown;
  location?: unknown;
  is_active?: unknown;
  image_url?: unknown;
}): Omit<EventInput, "image_url"> {
  return {
    title: requireText(raw.title, "Judul kegiatan", { max: 255 }),
    description: optionalText(raw.description, 5_000),
    event_date: requireIsoDate(raw.event_date, "Tanggal kegiatan"),
    location: optionalText(raw.location, 255),
    is_active: parseActive(raw.is_active),
  };
}

function parseActive(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  const text = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(text);
}

/** Ambil URL gambar dari form (file unggahan menang atas URL teks). */
export async function resolveEventImage(
  file: File | null,
  imageUrlText: unknown,
): Promise<string | null> {
  if (file) return await uploadImage(file);
  if (isHttpUrl(imageUrlText)) return imageUrlText.trim();
  return null;
}

export async function createEvent(
  payload: Omit<EventInput, "image_url">,
  imagePath: string | null,
): Promise<DalResult<Event>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({ ...payload, image_url: imagePath })
      .select(EVENT_COLUMNS)
      .single();

    if (error) {
      if (imagePath) await deleteImage(imagePath).catch(() => {});
      return dalFail(error, "Gagal membuat kegiatan");
    }

    return dalOk(mapEvent(data as Event));
  } catch (err) {
    if (imagePath) await deleteImage(imagePath).catch(() => {});
    return dalFail(err, "Gagal membuat kegiatan");
  }
}

export async function updateEventById(
  id: string,
  payload: Partial<Omit<EventInput, "image_url">>,
  imagePath: string | null,
  removeImage: boolean,
): Promise<DalResult<Event>> {
  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("events")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (isNotFoundError(findError)) {
      return dalFail(new Error("Kegiatan tidak ditemukan."), "Kegiatan tidak ditemukan.");
    }
    if (findError) return dalFail(findError, "Gagal membaca data kegiatan");

    const updateData: Record<string, unknown> = { ...payload };

    if (imagePath) {
      updateData.image_url = imagePath;
    } else if (removeImage) {
      updateData.image_url = null;
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select(EVENT_COLUMNS)
      .single();

    if (error) {
      if (imagePath) await deleteImage(imagePath).catch(() => {});
      return dalFail(error, "Gagal memperbarui kegiatan");
    }

    const oldImage = (existing?.image_url as string | null) ?? null;
    if (oldImage && (imagePath || removeImage)) {
      await deleteImage(oldImage).catch(() => {});
    }

    return dalOk(mapEvent(data as Event));
  } catch (err) {
    if (imagePath) await deleteImage(imagePath).catch(() => {});
    return dalFail(err, "Gagal memperbarui kegiatan");
  }
}

export async function deleteEventById(id: string): Promise<DalResult<Event>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)
      .select(EVENT_COLUMNS)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Kegiatan tidak ditemukan."), "Kegiatan tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal menghapus kegiatan");

    const event = mapEvent(data as Event);
    if (event.image_url) await deleteImage(event.image_url).catch(() => {});

    return dalOk(event);
  } catch (err) {
    return dalFail(err, "Gagal menghapus kegiatan");
  }
}
