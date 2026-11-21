import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry, Member } from "@/lib/types";
import { imageUrl } from "@/utils/uploadImage";
import { dalFail, dalOk, type DalResult } from "./types";

/**
 * Data Access Layer papan peringkat.
 *
 * Leaderboard TIDAK punya tabelnya sendiri — datanya diambil dari kolom
 * `points` di tabel `members` (lihat catatan di src/lib/schema.sql).
 * Tipenya sendiri (`LeaderboardEntry`) tinggal di src/lib/types.ts supaya
 * komponen tampilan tidak perlu meng-import modul server.
 */

export type { LeaderboardEntry };

const LEADERBOARD_COLUMNS = "id, name, role, photo_url, points";

export async function getLeaderboard(limit = 10): Promise<DalResult<LeaderboardEntry[]>> {
  try {
    const { data, error } = await supabase
      .from("members")
      .select(LEADERBOARD_COLUMNS)
      .order("points", { ascending: false })
      .order("name", { ascending: true })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error) return dalFail(error, "Gagal mengambil data leaderboard");

    const entries = ((data ?? []) as Omit<Member, "social_links" | "created_at">[]).map(
      (row, index) => ({
        rank: index + 1,
        id: row.id,
        name: row.name,
        role: row.role,
        photo_url: imageUrl(row.photo_url),
        points: row.points ?? 0,
      }),
    );

    return dalOk(entries);
  } catch (err) {
    return dalFail(err, "Gagal mengambil data leaderboard");
  }
}
