/**
 * Satu sumber kebenaran untuk environment variable.
 *
 * Semua akses env lewat sini supaya pesan error-nya jelas (bahasa Indonesia)
 * dan tidak muncul sebagai error "supabaseUrl is required" yang bikin bingung
 * saat `.env` belum dibuat.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Environment variable "${name}" belum diisi. ` +
        `Copy file .env.example menjadi .env lalu isi nilainya dari dashboard Supabase.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Hanya boleh dipanggil dari kode server (route handler / server component). */
export function getSupabaseServiceKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Kunci Bearer untuk operasi tulis API (POST/PUT/PATCH/DELETE). */
export function getApiSecretKey(): string {
  return required("API_SECRET_KEY", process.env.API_SECRET_KEY);
}

export function hasApiSecretKey(): boolean {
  return Boolean(process.env.API_SECRET_KEY?.trim());
}

/**
 * Kata sandi panel admin.
 *
 * Dipakai `src/lib/admin-session.ts` untuk memeriksa percobaan masuk. Fungsi
 * ini hanya menagih nilai yang ada; kalau kosong, halaman masuk akan selalu
 * menolak (lihat `periksaKataSandi`) alih-alih membuka akses tanpa kunci.
 */
export function getAdminPassword(): string {
  return required("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);
}

export function hasAdminPassword(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}
