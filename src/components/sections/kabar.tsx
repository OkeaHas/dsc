import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconNews } from "@/components/icons";
import { Muncul } from "@/components/muncul";
import { JudulSection, Wadah } from "@/components/sections/decor";
import { EmptyState } from "@/components/ui";
import { KABAR } from "@/lib/site-content";
import type { News } from "@/lib/types";
import { formatTanggalPendek, potongTeks } from "@/utils/format";

/**
 * Section "Kabar Terbaru" — tiga berita terakhir di beranda.
 *
 * Kenapa ada: panel admin bisa menerbitkan berita, tapi beranda tidak punya
 * tempat untuknya dan tidak ada satu pun tautan menuju `/news`. Akibatnya
 * berita yang sudah ditulis tidak pernah dilihat pengunjung. Section ini
 * menutup lubang itu, sekaligus jadi pintu masuk ke daftar berita lengkap.
 *
 * Isinya sengaja HANYA tiga: beranda adalah halaman pengenalan, bukan arsip.
 * "Semua berita" mengarah ke `/news` untuk sisanya.
 */
export function Kabar({ news }: { news: News[] }) {
  const tampil = news.slice(0, 3);

  return (
    <section id="kabar" className="dsc-anchor">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <JudulSection judul={KABAR.judul} />
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-accent-strong sm:text-lg">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {KABAR.subjudul}
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            </p>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{KABAR.deskripsi}</p>
          </div>

          <Link
            href="/news"
            className="dsc-tap inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Semua berita
            <IconArrowUpRight className="size-4" />
          </Link>
        </div>

        {tampil.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Belum ada kabar"
              description="Berita pertama yang diterbitkan panitia lewat panel admin akan muncul di sini."
            />
          </div>
        ) : (
          <Muncul delay={140}>
            <ul className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {tampil.map((item) => (
              <li key={item.id} className="min-w-0">
                <KartuKabar news={item} />
              </li>
            ))}
          </ul>
          </Muncul>
        )}
      </Wadah>
    </section>
  );
}

/**
 * Kartu berita beranda.
 *
 * Tanpa gambar pun tetap enak dilihat: bidang gradien + ikon berita, pola yang
 * sama dengan kartu galeri dan kartu anggota yang belum punya foto.
 */
function KartuKabar({ news }: { news: News }) {
  return (
    <Link
      href={`/news/${news.slug}`}
      className="dsc-tap group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-brand/40"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
        {news.cover_image_url ? (
          <Image
            src={news.cover_image_url}
            alt={news.title}
            fill
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-brand-soft to-accent-soft text-brand/60">
            <IconNews className="size-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-strong">
          {formatTanggalPendek(news.created_at)}
        </p>

        <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-snug text-foreground sm:text-lg">
          {news.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {potongTeks(news.content, 160)}
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
          Baca selengkapnya
          <IconArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
