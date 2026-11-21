import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand">
        Error 404
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
        Halaman ini tidak ada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Alamatnya mungkin salah ketik, atau isinya sudah dipindahkan. Coba mulai
        dari beranda.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/events"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-bold transition-colors hover:bg-surface-2"
        >
          Lihat kegiatan
        </Link>
      </div>
    </Container>
  );
}
