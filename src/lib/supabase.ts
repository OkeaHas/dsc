import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Client Supabase PUBLIK (anon key).
 *
 * Aman dipakai di server component maupun client component: anon key memang
 * dirancang untuk publik. Batas keamanannya ada di Row Level Security
 * (lihat src/lib/schema.sql).
 *
 * Client dibuat lazily supaya modul ini tidak meledak saat di-import
 * sebelum `.env` siap (misalnya saat proses build).
 */
let publicClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

/**
 * Proxy tipis supaya pemakaian lama `supabase.from(...)` tetap jalan,
 * tapi client-nya baru dibuat saat benar-benar dipakai.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
