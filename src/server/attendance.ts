import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Attendance } from "@/lib/types";
import { isEmail, requireText, optionalText, requireUuid } from "@/utils/validate";
import { dalFail, dalOk, isNotFoundError, type DalResult } from "./types";

/**
 * Data Access Layer tabel `attendance` (absen peserta kegiatan).
 *
 * Aturan:
 *  - Pendaftaran absen BERSIFAT PUBLIK → memakai anon client, dibatasi policy
 *    "insert only" di Supabase (lihat src/lib/schema.sql). Publik tidak bisa
 *    membaca daftar hadir orang lain.
 *  - Membaca rekap absen HANYA untuk admin → memakai service role, dan
 *    endpoint-nya dilindungi src/proxy.ts.
 */

const ATTENDANCE_COLUMNS =
  "id, event_id, participant_name, participant_email, institution, created_at";

export interface AttendanceInput {
  participant_name: string;
  participant_email: string;
  institution: string | null;
}

/** Membaca payload absen dari JSON body / FormData. Melempar ValidationError. */
export function parseAttendanceInput(raw: {
  participant_name?: unknown;
  participant_email?: unknown;
  institution?: unknown;
}): AttendanceInput {
  const email = requireText(raw.participant_email, "Email", { max: 255 });
  if (!isEmail(email)) {
    throw new Error("Format email tidak valid.");
  }

  return {
    participant_name: requireText(raw.participant_name, "Nama peserta", { max: 255 }),
    participant_email: email.toLowerCase(),
    institution: optionalText(raw.institution, 255),
  };
}

/**
 * Mendaftarkan absen.
 *
 * Kegiatan harus ada, dan pendaftarannya harus masih dibuka (`is_active`),
 * supaya orang tidak bisa absen di kegiatan yang sudah lewat atau ditutup.
 */
export async function createAttendance(
  eventId: string,
  input: AttendanceInput,
): Promise<DalResult<Attendance>> {
  try {
    const id = requireUuid(eventId, "event_id");

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, is_active, event_date")
      .eq("id", id)
      .single();

    if (isNotFoundError(eventError)) {
      return dalFail(new Error("Kegiatan tidak ditemukan."), "Kegiatan tidak ditemukan.");
    }
    if (eventError) return dalFail(eventError, "Gagal memeriksa kegiatan");

    if (!event?.is_active) {
      return dalFail(
        new Error("Pendaftaran kegiatan ini sudah ditutup."),
        "Pendaftaran kegiatan ini sudah ditutup.",
      );
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        event_id: id,
        participant_name: input.participant_name,
        participant_email: input.participant_email,
        institution: input.institution,
      })
      .select(ATTENDANCE_COLUMNS)
      .single();

    if (error) {
      // 23505 = unique_violation pada pasangan (event_id, email).
      if (error.code === "23505") {
        return dalFail(
          new Error("Email ini sudah terdaftar pada kegiatan tersebut."),
          "Email ini sudah terdaftar pada kegiatan tersebut.",
        );
      }
      return dalFail(error, "Gagal menyimpan absen");
    }

    return dalOk(data as Attendance);
  } catch (err) {
    return dalFail(err, "Gagal menyimpan absen");
  }
}

/** Rekap absen sebuah kegiatan (admin). */
export async function getAttendanceByEvent(
  eventId: string,
): Promise<DalResult<Attendance[]>> {
  try {
    const id = requireUuid(eventId, "event_id");

    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select(ATTENDANCE_COLUMNS)
      .eq("event_id", id)
      .order("created_at", { ascending: true });

    if (error) return dalFail(error, "Gagal mengambil data absen");
    return dalOk((data ?? []) as Attendance[]);
  } catch (err) {
    return dalFail(err, "Gagal mengambil data absen");
  }
}

/** Semua absen dari semua kegiatan (admin). */
export async function getAllAttendance(limit = 200): Promise<DalResult<Attendance[]>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select(ATTENDANCE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));

    if (error) return dalFail(error, "Gagal mengambil data absen");
    return dalOk((data ?? []) as Attendance[]);
  } catch (err) {
    return dalFail(err, "Gagal mengambil data absen");
  }
}
