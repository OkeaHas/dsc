import Image from "next/image";
import { IconArrowRight, IconImage, IconUsers } from "@/components/icons";
import { Muncul } from "@/components/muncul";
import { HERO, KONTAK } from "@/lib/site-content";
import { Wadah } from "@/components/sections/decor";

/**
 * Hero beranda — judul merah besar di kiri, bingkai foto di kanan.
 *
 * Foto kegitan tidak ikut masuk repo. Selama `HERO.foto` masih kosong,
 * bingkai menampilkan pola gradien + logo supaya halaman tetap terlihat utuh,
 * bukan kotak rusak. Begitu panitia menaruh berkas di
 * `public/images/hero-club.jpg` dan mengisi `HERO.foto`, fotonya langsung
 * dipakai tanpa perubahan lain.
 *
 * Isi hero muncul bertingkat saat halaman dibuka (label → judul → paragraf →
 * tombol, foto menyusul di tengah) — animasi masuk, bukan animasi saat digulir,
 * karena bagian ini sudah terlihat sejak detik pertama.
 */
export function Hero() {
  return (
    <section id="beranda" className="dsc-hero-glow relative overflow-hidden">
      {/* Taburan titik oranye — ornamen di desain, pojok kiri bawah. */}
      <div
        aria-hidden
        className="dsc-dotgrid pointer-events-none absolute bottom-8 left-2 h-28 w-40 opacity-70 sm:h-36 sm:w-56"
      />

      <Wadah className="py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <Muncul>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
                <IconUsers className="size-4" />
                Komunitas Developer Kampus
              </p>
            </Muncul>

            <Muncul delay={90}>
              <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] text-brand sm:text-5xl lg:text-[3.5rem]">
                {HERO.judul}
              </h1>
            </Muncul>

            <Muncul delay={180}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                {HERO.deskripsi}
              </p>
            </Muncul>

            <Muncul delay={260}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <a
                  href={`https://wa.me/${KONTAK.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dsc-btn-primary dsc-tap inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold sm:text-base"
                >
                  {HERO.ctaLabel}
                  <IconArrowRight className="size-4" />
                </a>

                <a
                  href="#tentang-kami"
                  className="dsc-tap inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand hover:text-brand sm:text-base"
                >
                  Kenali kami
                </a>
              </div>
            </Muncul>
          </div>

          <Muncul delay={140}>
            <BingkaiFoto />
          </Muncul>
        </div>
      </Wadah>
    </section>
  );
}

function BingkaiFoto() {
  const adaFoto = HERO.foto.length > 0;

  return (
    <div className="relative min-w-0">
      {/* Bingkai merah miring di belakang foto — aksen dari desain. */}
      <div
        aria-hidden
        className="absolute -inset-2 rotate-[-2.5deg] rounded-[2rem] bg-brand/90 sm:-inset-3"
      />

      <div className="dsc-polaroid relative overflow-hidden rounded-[1.75rem]">
        <div className="relative aspect-[4/3] w-full bg-linear-to-br from-accent-soft via-peach to-accent-soft">
          {adaFoto ? (
            <Image
              src={HERO.foto}
              alt="Foto bersama anggota Developer Student Club"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface/80 text-brand shadow-sm">
                  <IconImage className="size-7" />
                </span>
                <p className="mt-3 font-display text-2xl font-extrabold text-brand">
                  DSC
                </p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  Foto kegiatan belum diunggah
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kartu kecil mengapung: jumlah kegiatan, seperti badge di desain. */}
      <div className="absolute -bottom-4 left-4 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg sm:left-6">
        <p className="font-display text-xl font-extrabold leading-none text-brand">
          48+
        </p>
        <p className="mt-1 text-[11px] font-semibold text-muted">
          Kegiatan terlaksana
        </p>
      </div>
    </div>
  );
}
