import { JudulSection, Wadah } from "@/components/sections/decor";
import { VISI_MISI } from "@/lib/site-content";

/**
 * Section "Visi & Misi".
 *
 * Kartu visi dibuat merah penuh dan sedikit miring supaya jadi titik fokus;
 * tiga kartu misi di sebelahnya putih dengan nomor oranye, jadi hierarkinya
 * jelas dibaca sekali lirik — sama seperti desain.
 */
export function VisiMisi() {
  return (
    <section id="visi-misi" className="dsc-anchor">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <JudulSection judul={VISI_MISI.judul} />
        <p className="mt-2 text-base font-bold text-accent-strong sm:text-lg">
          {VISI_MISI.subjudul}
        </p>

        <div className="mt-10 grid gap-5 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-7">
          {/* Kartu visi — merah, sesuai desain. */}
          <div className="rounded-3xl bg-brand px-6 py-8 text-white shadow-xl shadow-brand/20 sm:-rotate-1 sm:px-8 sm:py-10">
            <p className="font-display text-2xl font-extrabold text-accent">
              {VISI_MISI.visiJudul}
            </p>
            <p className="mt-4 text-lg font-semibold leading-relaxed sm:text-xl">
              {VISI_MISI.visi}
            </p>
          </div>

          {/* Tiga kartu misi. */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {VISI_MISI.misi.map((item, index) => (
              <article
                key={item.judul}
                className="flex flex-col rounded-3xl border border-border bg-surface p-6 lg:p-7"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-accent font-display text-lg font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 font-display text-lg font-extrabold text-foreground">
                  {item.judul}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.deskripsi}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Wadah>
    </section>
  );
}
