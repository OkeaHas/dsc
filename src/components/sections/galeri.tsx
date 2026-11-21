import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconImage, IconPin } from "@/components/icons";
import { JudulSection, Wadah } from "@/components/sections/decor";
import { EmptyState } from "@/components/ui";
import { GALERI } from "@/lib/site-content";
import type { Event } from "@/lib/types";
import { formatTanggalPendek } from "@/utils/format";

/**
 * Section "Galeri" — dokumentasi kegiatan.
 *
 * Sumber gambarnya tabel `events` (kolom `image_url`), jadi tidak ada tabel
 * galeri terpisah yang harus diisi dua kali. Tata letaknya masonry: kolom CSS
 * supaya foto potret dan lanskap sama-sama muat tanpa terpotong paksa.
 */
export function Galeri({ events }: { events: Event[] }) {
  // Kegiatan yang punya gambar didahulukan — kartu kosong ditaruh paling akhir.
  const urut = [...events].sort((a, b) => {
    const aAda = a.image_url ? 1 : 0;
    const bAda = b.image_url ? 1 : 0;
    return bAda - aAda;
  });

  const tampil = urut.slice(0, 9);

  return (
    <section id="galeri" className="dsc-anchor bg-surface-2">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <JudulSection judul={GALERI.judul} />
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-accent-strong sm:text-lg">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {GALERI.subjudul}
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            </p>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{GALERI.deskripsi}</p>
          </div>
          <Link
            href="/events"
            className="dsc-tap inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Semua kegiatan
            <IconArrowUpRight className="size-4" />
          </Link>
        </div>

        {tampil.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Belum ada dokumentasi"
              description="Tambahkan kegiatan beserta gambarnya, nanti fotonya otomatis muncul di sini."
            />
          </div>
        ) : (
          <ul className="mt-8 columns-2 gap-3 sm:mt-10 sm:columns-3 sm:gap-4 lg:columns-4">
            {tampil.map((event, index) => (
              <li key={event.id} className="mb-3 break-inside-avoid sm:mb-4">
                <KartuGaleri event={event} index={index} />
              </li>
            ))}
          </ul>
        )}
      </Wadah>
    </section>
  );
}

/**
 * Tinggi kartu dibuat berselang-seling (4:3, 3:4, 1:1) supaya susunan masonry
 * terlihat hidup, bukan deretan kotak seragam.
 */
const RASIO = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square"];

function KartuGaleri({ event, index }: { event: Event; index: number }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className={`relative w-full overflow-hidden bg-surface-2 ${RASIO[index % RASIO.length]}`}>
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-brand-soft to-accent-soft text-brand/60">
            <IconImage className="size-8" />
          </div>
        )}

        {/* Lapisan gelap di bawah supaya judul putih tetap terbaca. */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
          <p className="line-clamp-2 text-xs font-bold leading-snug text-white sm:text-sm">
            {event.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white/80">
            {event.location ? (
              <>
                <IconPin className="size-3 shrink-0" />
                <span className="truncate">{event.location}</span>
              </>
            ) : (
              formatTanggalPendek(event.event_date)
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}