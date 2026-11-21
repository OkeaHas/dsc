import { FeedbackForm } from "@/components/forms/feedback-form";
import { IconChat } from "@/components/icons";
import { JudulSection, Wadah } from "@/components/sections/decor";
import { FEEDBACK, TESTIMONI } from "@/lib/site-content";

/**
 * Section "Feedback".
 *
 * Kiri: judul, deskripsi, dan formnya (komponen client terpisah).
 * Kanan: mockup ponsel berisi catatan tempel oranye — testimoni anggota.
 *
 * Catatan tempel itu hiasan murni, tidak bisa diklik, jadi sengaja ditandai
 * `aria-hidden` supaya pembaca layar tidak berhenti di teks dekoratif.
 */
export function FeedbackSection() {
  return (
    <section id="feedback" className="dsc-anchor">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          <div className="min-w-0">
            <JudulSection judul={FEEDBACK.judul} deskripsi={FEEDBACK.deskripsi} />

            <div className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <FeedbackForm />
            </div>
          </div>

          <MockupPonsel />
        </div>
      </Wadah>
    </section>
  );
}

/** Tiga testimoni ditata seperti catatan tempel yang ditempel miring. */
const POSISI = [
  "lg:-rotate-2 lg:-translate-x-6",
  "lg:rotate-1 lg:translate-x-8",
  "lg:-rotate-1 lg:translate-x-1",
];

function MockupPonsel() {
  return (
    <div className="relative min-w-0 lg:pt-6">
      {/* Ponselnya sendiri — cuma bingkai; yang penting catatannya. */}
      <div
        aria-hidden
        className="dsc-phone mx-auto hidden aspect-[9/16] w-full max-w-[18rem] rounded-[2.5rem] lg:block"
      />

      <div className="lg:absolute lg:inset-x-0 lg:top-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
          {TESTIMONI.map((t, index) => (
            <li
              key={t.nama}
              className={`rounded-2xl p-5 shadow-lg transition-transform duration-300 hover:rotate-0 hover:translate-x-0 ${POSISI[index % POSISI.length]}`}
              // Warna bergantian: oranye penuh, oranye lembut, oranye penuh.
              style={{
                background: index % 2 === 0 ? "var(--accent)" : "var(--accent-soft)",
                color: index % 2 === 0 ? "#3a1d00" : "var(--foreground)",
              }}
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                <IconChat className="size-4" />
                {t.nama}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{t.pesan}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
