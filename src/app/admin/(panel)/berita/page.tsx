import Link from "next/link";
import { hapusBerita } from "@/app/admin/actions";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { IconNews } from "@/components/icons";
import { getAllNews } from "@/server/news";
import { formatTanggalPendek, potongTeks } from "@/utils/format";

/** Daftar berita + aksi ubah/hapus. Urut dari yang terbaru. */

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;
  const { data, error } = await getAllNews(100);
  const daftar = data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">Berita</h1>
          <p className="mt-1 text-sm text-muted">
            {daftar.length} berita terbit. Alamatnya otomatis dari judul.
          </p>
        </div>

        <Link
          href="/admin/berita/baru"
          className="dsc-btn-primary dsc-tap inline-flex min-h-11 items-center rounded-full px-5 text-sm font-extrabold"
        >
          Tulis berita
        </Link>
      </header>

      {galat ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {galat}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          Gagal membaca data: {error.message}
        </p>
      ) : null}

      {daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconNews className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-foreground">Belum ada berita.</p>
          <p className="mt-1 text-xs text-muted">Tulis kabar pertama lewat tombol di atas.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {daftar.map((n) => (
            <li
              key={n.id}
              className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{n.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatTanggalPendek(n.created_at)} • /news/{n.slug}
                </p>
                <p className="mt-2 text-sm text-muted">{potongTeks(n.content, 140)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/news/${n.slug}`}
                  className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                >
                  Lihat
                </Link>

                <Link
                  href={`/admin/berita/${n.slug}`}
                  className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                >
                  Ubah
                </Link>

                <form action={hapusBerita}>
                  <input type="hidden" name="slug" value={n.slug} />
                  <TombolHapus nama={n.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
