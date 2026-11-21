import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Member } from "@/lib/types";
import { deleteImage, imageUrl, uploadImage } from "@/utils/uploadImage";
import {
  parsePoints,
  parseSocialLinks,
  requireText,
} from "@/utils/validate";
import { dalFail, dalOk, isNotFoundError, type DalResult } from "./types";

/**
 * Data Access Layer tabel `members`.
 *
 * Aturan main:
 *  - BACA data publik memakai client anon (dibatasi Row Level Security).
 *  - TULIS data memakai service role, karena form-data + upload file tidak bisa
 *    lewat jalur publik.
 *  - Kolom `photo_url` di database BERPISI NAMA FILE. Yang keluar dari fungsi
 *    di sini sudah berupa URL publik siap pakai (lihat `mapMember`).
 */

/** Urutan kolom yang dikirim ke frontend — jangan bocorkan apa pun di luar ini. */
const MEMBER_COLUMNS = "id, name, role, photo_url, social_links, points, created_at";

export function mapMember(row: Member): Member {
  return { ...row, photo_url: imageUrl(row.photo_url) };
}

/** Semua anggota, urut abjad. */
export async function getAllMembers(): Promise<DalResult<Member[]>> {
  try {
    const { data, error } = await supabase
      .from("members")
      .select(MEMBER_COLUMNS)
      .order("name", { ascending: true });

    if (error) return dalFail(error, "Gagal mengambil data anggota");
    return dalOk(((data ?? []) as Member[]).map(mapMember));
  } catch (err) {
    return dalFail(err, "Gagal mengambil data anggota");
  }
}

export async function getMemberById(id: string): Promise<DalResult<Member>> {
  try {
    const { data, error } = await supabase
      .from("members")
      .select(MEMBER_COLUMNS)
      .eq("id", id)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Anggota tidak ditemukan."), "Anggota tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal mengambil detail anggota");

    return dalOk(mapMember(data as Member));
  } catch (err) {
    return dalFail(err, "Gagal mengambil detail anggota");
  }
}

export interface MemberInput {
  name: string;
  role: string;
  photo_url: string | null;
  social_links: Member["social_links"];
  points: number;
}

/** Membaca FormData menjadi payload tervalidasi. Melempar ValidationError. */
export function parseMemberFormData(formData: FormData): {
  payload: Omit<MemberInput, "photo_url">;
  photoFile: File | null;
  removePhoto: boolean;
} {
  const name = requireText(formData.get("name"), "Nama", { max: 255 });
  const role = requireText(formData.get("role"), "Jabatan (role)", { max: 255 });
  const social_links = parseSocialLinks(formData.get("social_links"));
  const points = parsePoints(formData.get("points"));

  const rawPhoto = formData.get("photo_url") ?? formData.get("photo");
  const photoFile =
    rawPhoto instanceof File && rawPhoto.size > 0 ? rawPhoto : null;
  const removePhoto = String(formData.get("remove_photo") ?? "") === "true";

  return { payload: { name, role, social_links, points }, photoFile, removePhoto };
}

/** Menambah anggota baru. Foto lama otomatis dibersihkan bila insert gagal. */
export async function createMember(
  payload: Omit<MemberInput, "photo_url">,
  photoFile: File | null,
): Promise<DalResult<Member>> {
  let uploadedPath: string | null = null;

  try {
    if (photoFile) {
      uploadedPath = await uploadImage(photoFile);
    }

    const { data, error } = await supabaseAdmin
      .from("members")
      .insert({
        name: payload.name,
        role: payload.role,
        social_links: payload.social_links,
        points: payload.points,
        photo_url: uploadedPath,
      })
      .select(MEMBER_COLUMNS)
      .single();

    if (error) {
      // Jangan tinggalkan file yatim di storage kalau baris DB gagal dibuat.
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      return dalFail(error, "Gagal menambahkan anggota");
    }

    return dalOk(mapMember(data as Member));
  } catch (err) {
    if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
    return dalFail(err, "Gagal menambahkan anggota");
  }
}

/**
 * Mengubah data anggota.
 *
 * Urutan operasi sengaja begini: DB dulu, file belakangan.
 * Kalau DB gagal → foto baru yang sudah terunggah dihapus.
 * Kalau DB sukses → foto lama baru dihapus.
 */
export async function updateMemberById(
  id: string,
  payload: Omit<MemberInput, "photo_url">,
  photoFile: File | null,
  removePhoto: boolean,
): Promise<DalResult<Member>> {
  let uploadedPath: string | null = null;

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("members")
      .select("id, photo_url")
      .eq("id", id)
      .single();

    if (isNotFoundError(findError)) {
      return dalFail(new Error("Anggota tidak ditemukan."), "Anggota tidak ditemukan.");
    }
    if (findError) return dalFail(findError, "Gagal membaca data anggota");

    if (photoFile && removePhoto) {
      return dalFail(
        new Error("Tidak bisa menghapus dan mengganti foto secara bersamaan."),
        "Operasi foto tidak valid.",
      );
    }

    const oldPhotoPath = (existing?.photo_url as string | null) ?? null;

    const updateData: Record<string, unknown> = {
      name: payload.name,
      role: payload.role,
      social_links: payload.social_links,
      points: payload.points,
    };

    if (photoFile) {
      uploadedPath = await uploadImage(photoFile);
      updateData.photo_url = uploadedPath;
    } else if (removePhoto) {
      updateData.photo_url = null;
    }

    const { data, error } = await supabaseAdmin
      .from("members")
      .update(updateData)
      .eq("id", id)
      .select(MEMBER_COLUMNS)
      .single();

    if (error) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      return dalFail(error, "Gagal mengubah data anggota");
    }

    if (oldPhotoPath && (photoFile || removePhoto)) {
      await deleteImage(oldPhotoPath).catch(() => {});
    }

    return dalOk(mapMember(data as Member));
  } catch (err) {
    if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
    return dalFail(err, "Gagal mengubah data anggota");
  }
}

export async function deleteMemberById(id: string): Promise<DalResult<Member>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("members")
      .delete()
      .eq("id", id)
      .select(MEMBER_COLUMNS)
      .single();

    if (isNotFoundError(error)) {
      return dalFail(new Error("Anggota tidak ditemukan."), "Anggota tidak ditemukan.");
    }
    if (error) return dalFail(error, "Gagal menghapus anggota");

    const member = mapMember(data as Member);
    if (member.photo_url) {
      await deleteImage(member.photo_url).catch(() => {});
    }

    return dalOk(member);
  } catch (err) {
    return dalFail(err, "Gagal menghapus anggota");
  }
}
