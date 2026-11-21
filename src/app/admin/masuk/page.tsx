import Link from "next/link";
import { redirect } from "next/navigation";
import { MasukForm } from "@/components/admin/login-form";
import { sesiAktif } from "@/lib/admin-auth";
import { hasAdminPassword } from "@/lib/env";

/**
 * Halaman masuk panel admin.
 *
 * Sengaja di luar route group `(panel)` — halaman ini satu-satunya halaman
 * admin yang boleh dilihat tanpa sesi.
 */

export const metadata = {
  title: "Masuk Panel Admin — Developer Student Club",
  robots: { index: false, follow: false },
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ dari?: string }>;
}) {
  if (await sesiAktif()) redirect("/admin");

  const { dari } = await searchParams;
  const siapDipakai = hasAdminPassword();

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-2/60 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">Panel Admin</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-brand">
          Developer Student Club
        </h1>
        <p className="mt-3 text-sm text-muted">
          Masukkan kata sandi admin untuk mengelola anggota, berita, kegiatan, absen, dan
          feedback.
        </p>

        <div className="mt-6">
          {siapDipakai ? (
            <MasukForm dari={dari} />
          ) : (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              <p className="font-bold">Panel admin belum dikonfigurasi.</p>
              <p className="mt-1 text-xs leading-relaxed">
                Isi <code className="font-mono">ADMIN_PASSWORD</code> di file{" "}
                <code className="font-mono">.env</code> (lihat{" "}
                <code className="font-mono">.env.example</code>), lalu jalankan ulang server.
                Halaman ini menolak semua percobaan masuk selama nilainya kosong.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="font-bold text-brand hover:underline">
            Kembali ke situs
          </Link>
        </p>
      </div>
    </main>
  );
}
