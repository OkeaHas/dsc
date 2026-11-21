import Link from "next/link";
import { BeritaForm } from "@/components/admin/news-form";

/** Tulis berita baru. Slug dibuat otomatis dari judul di sisi server. */

export const metadata = { title: "Tulis Berita — Panel Admin" };

export default function TulisBeritaPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/berita" className="text-xs font-bold text-brand hover:underline">
          ← Berita
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          Tulis berita
        </h1>
        <p className="mt-1 text-sm text-muted">
          Berita langsung terbit begitu disimpan dan muncul di beranda bagian kabar terbaru.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <BeritaForm />
      </div>
    </div>
  );
}
