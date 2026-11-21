import { IconMail, IconWhatsapp } from "@/components/icons";
import { OmbakAtas, Wadah } from "@/components/sections/decor";
import { CTA, KONTAK } from "@/lib/site-content";

/**
 * Banner ajakan di bawah halaman (panel oranye, tepi atas bergelombang).
 *
 * Dua tombol kontak — email dan WhatsApp — karena di desain memang dua itu yang
 * dipakai panitia untuk dihubungi.
 */
export function CtaBand() {
  return (
    <section className="bg-accent">
      <OmbakAtas />

      <Wadah className="py-10 sm:py-12 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.5rem]">
              {CTA.judul}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/85 sm:text-base">
              {CTA.paragraf}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/70">
              {CTA.label}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={`mailto:${KONTAK.email}`}
                className="dsc-tap inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
              >
                <IconMail className="size-5 shrink-0" />
                <span className="truncate">Email kami</span>
              </a>

              <a
                href={`https://wa.me/${KONTAK.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dsc-tap inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink/25 bg-transparent px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-ink/60"
              >
                <IconWhatsapp className="size-5 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>
            </div>

            <p className="mt-3 text-xs font-medium text-ink/70">
              Jadwal rutin: {KONTAK.jadwal}
            </p>
          </div>
        </div>
      </Wadah>
    </section>
  );
}
