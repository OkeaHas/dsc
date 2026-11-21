import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, getSupabaseUrl } from "./env";

/**
 * Client Supabase ADMIN (service role key) — MENEMBUS semua Row Level Security.
 *
 * ⚠️  HANYA untuk kode server: route handler, server action, dan data-access
 * layer di src/server/.
 *
 * Modul ini sengaja tidak boleh di-import dari client component. Pengamanannya
 * dua lapis:
 *
 *  1. `guardServerOnly()` langsung melempar error begitu modul ini dievaluasi
 *     di browser, jadi salah import kelihatan seketika — bukan diam-diam
 *     mengirim service role key ke bundle.
 *  2. Nama env-nya `SUPABASE_SERVICE_ROLE_KEY` (tanpa awalan NEXT_PUBLIC_),
 *     sehingga Next.js tidak akan pernah mengganti nilainya di sisi client.
 */
function guardServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "supabase-admin hanya boleh dipakai di server. " +
        "Client component harus memakai import dari '@/lib/supabase'.",
    );
  }
}

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  guardServerOnly();

  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
