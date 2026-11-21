import Link from "next/link";
import { AnggotaForm } from "@/components/admin/member-form";

/** Tambah anggota baru. Setelah tersimpan, halaman diarahkan ke daftar. */

export const metadata = { title: "Tambah Anggota — Panel Admin" };

export default function TambahAnggotaPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/anggota" className="text-xs font-bold text-brand hover:underline">
          ← Anggota
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          Tambah anggota
        </h1>
        <p className="mt-1 text-sm text-muted">
          Cukup nama dan jabatan; foto, tautan sosial, dan poin bisa diisi sekalian.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <AnggotaForm />
      </div>
    </div>
  );
}
