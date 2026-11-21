import { IconFacebook, IconInstagram, IconMail, IconPhone, IconClock, IconYoutube } from "@/components/icons";
import { FOOTER, KONTAK, SOSIAL } from "@/lib/site-content";
import { sectionHref } from "@/components/nav-items";

/**
 * Footer sesuai desain: kolom logo + sosial, dua kolom tautan section, dan
 * kolom kontak. Semua tautan section memakai helper `sectionHref()` supaya
 * tetap benar walau footer ini ikut tampil di halaman lain.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Kolom lambang + sosial */}
          <div className="min-w-0">
            <p className="font-display text-2xl font-extrabold tracking-tight text-brand">
              {FOOTER.brandUtama}
            </p>
            <p className="mt-1 text-[11px] font-bold tracking-[0.18em] text-muted">
              {FOOTER.brandKecil}
            </p>

            <ul className="mt-4 flex items-center gap-2">
              {[
                { href: SOSIAL.facebook, label: "Facebook", Icon: IconFacebook },
                { href: SOSIAL.instagram, label: "Instagram", Icon: IconInstagram },
                { href: SOSIAL.youtube, label: "YouTube", Icon: IconYoutube },
              ]
                .filter((s) => s.href)
                .map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid size-10 place-items-center rounded-full border border-border bg-surface-2 text-foreground transition-colors hover:border-brand hover:text-brand"
                    >
                      <s.Icon className="size-5" />
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Kolom tautan section */}
          {FOOTER.kolom.map((kolom) => (
            <nav key={kolom.judul} aria-label={kolom.judul} className="min-w-0">
              <p className="text-sm font-bold text-foreground">{kolom.judul}</p>
              <ul className="mt-3 space-y-2">
                {kolom.tautan.map((tautan) => (
                  <li key={tautan.id}>
                    <a
                      href={sectionHref(tautan.id)}
                      className="text-sm text-muted transition-colors hover:text-brand"
                    >
                      {tautan.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Kolom kontak */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Contact Us</p>
            <ul className="mt-3 space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 size-4 shrink-0 text-brand" />
                <a
                  href={`mailto:${KONTAK.email}`}
                  className="break-all transition-colors hover:text-brand"
                >
                  {KONTAK.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 size-4 shrink-0 text-brand" />
                <a
                  href={`tel:${KONTAK.telepon.replace(/[^+\d]/g, "")}`}
                  className="transition-colors hover:text-brand"
                >
                  {KONTAK.telepon}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>{KONTAK.jadwal}</span>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Padding bawah ekstra di HP: tab bar (4rem) + area aman gesture bar,
          supaya baris hak cipta tidak pernah tertutup tab bar.
        */}
        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
          {FOOTER.hakCipta}
        </p>
      </div>
    </footer>
  );
}
