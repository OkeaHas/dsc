import Link from "next/link";
import type { ReactNode } from "react";
import { keluarAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { wajibAdmin } from "@/lib/admin-auth";

/**
 * Kerangka panel admin.
 *
 * Berkas ini ada di dalam route group `(panel)` supaya halaman `/admin/masuk`
 * TIDAK ikut dipagari — kalau ikut, halaman masuk sendiri akan minta sesi dan
 * terjadi putaran redirect tanpa ujung.
 *
 * `wajibAdmin()` dipanggil di sini, sekali untuk seluruh halaman admin. Proxy
 * juga menjaga permintaan GET ke /admin/*, tapi pagar di sini yang menentukan:
 * satu tempat, tidak bisa lupa dipasang di halaman baru.
 */

export const metadata = {
  title: "Panel Admin — Developer Student Club",
  // Panel ini tidak untuk publik: jangan sampai muncul di hasil pencarian.
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  await wajibAdmin();

  return (
    <div className="min-h-dvh bg-surface-2/60">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-display text-sm font-extrabold text-brand">Panel Admin</p>
            <p className="truncate text-xs text-muted">Developer Student Club</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3.5 text-xs font-bold text-muted transition-colors hover:text-foreground"
            >
              Lihat situs
            </Link>

            <form action={keluarAction}>
              <button
                type="submit"
                className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-danger/30 px-3.5 text-xs font-bold text-danger transition-colors hover:bg-danger/10"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminNav />
        </aside>
        <main className="min-w-0 pt-4 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
