import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Feedback } from "@/lib/types";
import { isEmail, optionalText, requireText } from "@/utils/validate";
import { dalFail, dalOk, type DalResult } from "./types";

/**
 * Data Access Layer tabel `feedback` (kotak kritik & saran).
 *
 * Kirim feedback = publik (anon + policy insert-only).
 * Baca daftar feedback = admin (service role + dilindungi proxy).
 */

const FEEDBACK_COLUMNS = "id, sender_name, sender_email, message, created_at";

export interface FeedbackInput {
  sender_name?: unknown;
  sender_email?: unknown;
  message: unknown;
}

export async function createFeedback(input: FeedbackInput): Promise<DalResult<Feedback>> {
  try {
    const message = requireText(input.message, "Pesan", { max: 5_000 });

    const email = optionalText(input.sender_email, 255);
    if (email && !isEmail(email)) {
      throw new Error("Format email tidak valid.");
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        // Kolom sender_name NOT NULL — kalau kosong jadi "Anonymous".
        sender_name: optionalText(input.sender_name, 255) ?? "Anonymous",
        sender_email: email,
        message,
      })
      .select(FEEDBACK_COLUMNS)
      .single();

    if (error) return dalFail(error, "Gagal mengirim feedback");
    return dalOk(data as Feedback);
  } catch (err) {
    return dalFail(err, "Gagal mengirim feedback");
  }
}

export async function getAllFeedbacks(limit = 100): Promise<DalResult<Feedback[]>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("feedback")
      .select(FEEDBACK_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));

    if (error) return dalFail(error, "Gagal mengambil data feedback");
    return dalOk((data ?? []) as Feedback[]);
  } catch (err) {
    return dalFail(err, "Gagal mengambil data feedback");
  }
}

export async function deleteFeedbackById(id: string): Promise<DalResult<Feedback>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("feedback")
      .delete()
      .eq("id", id)
      .select(FEEDBACK_COLUMNS)
      .single();

    if (error) return dalFail(error, "Gagal menghapus feedback");
    return dalOk(data as Feedback);
  } catch (err) {
    return dalFail(err, "Gagal menghapus feedback");
  }
}
