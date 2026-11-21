import Link from "next/link";
import { KegiatanForm } from "@/components/admin/event-form";

/** Tambah kegiatan baru. */

export const metadata = { title: "Tambah Kegiatan — Panel Admin" };

export default function TambahKegiatanPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/kegiatan" className="text-xs font-bold text-brand hover:underline">
          ← Kegiatan
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          Tambah kegiatan
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tanggal memakai waktu WITA. Pendaftaran absen langsung dibuka kecuali kamu mematikannya.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <KegiatanForm />
      </div>
    </div>
  );
}
