/**
 * Tipe data bersama antara server (DAL), API route, dan frontend.
 * Satu sumber kebenaran — jangan bikin interface duplikat di tempat lain.
 */

/** Link sosial anggota. Semua opsional. */
export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  /** Boleh ada key lain (tiktok, x, dst) — nilainya string. */
  [key: string]: string | undefined;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  social_links: SocialLinks | null;
  points: number;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  participant_name: string;
  participant_email: string;
  institution: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  sender_name: string;
  sender_email: string | null;
  message: string;
  created_at: string;
}

/** Satu baris papan peringkat. Leaderboard tidak punya tabel sendiri — */
/** datanya berasal dari kolom `points` di tabel `members`. */
export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  points: number;
}

/** Bentuk amplop response yang dipakai SEMUA endpoint API DSC. */
export interface ApiEnvelope<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string; status: number };
