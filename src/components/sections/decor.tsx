import type { ReactNode } from "react";
import { Muncul } from "@/components/muncul";

/**
 * Ornamen & potongan bersama untuk section beranda.
 *
 * Semua section di beranda DSC punya pola yang sama: label kecil (eyebrow) di
 * atas, judul besar, lalu isinya. Daripada mengulang markup di sepuluh tempat,
 * pola itu dikumpulkan di sini.
 */

/** Label kecil di atas judul — huruf besar, jarak antarhuruf lebar. */
export function Eyebrow({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: "brand" | "putih" | "gelap";
  className?: string;
}) {
  const warna =
    tone === "putih"
      ? "text-white/90"
      : tone === "gelap"
        ? "text-ink/70"
        : "text-brand";

  return (
    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${warna} ${className}`}>
      {children}
    </p>
  );
}

/**
 * Ombak di tepi atas panel oranye ("Tentang Kami" dan banner CTA).
 *
 * Cara kerjanya: dipasang sebagai elemen pertama DI DALAM panel oranye, dengan
 * warna `text-background` — jadi bentuk putih yang menutupi tepi atas oranye.
 * Efeknya tepi panel bergelombang tanpa perlu potong gambar.
 */
export function OmbakAtas({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden
      className={`dsc-wave h-8 w-full text-background sm:h-12 lg:h-16 ${className}`}
    >
      <path
        fill="currentColor"
        d="M0 0h1440v22c-232 60-464 62-696 22C512 6 240 4 0 44V0Z"
      />
    </svg>
  );
}

/** Pasangan `OmbakAtas` — dipasang setelah panel oranye, dengan warna oranye. */
export function OmbakBawah({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden
      className={`dsc-wave h-8 w-full text-accent sm:h-12 lg:h-16 ${className}`}
    >
      <path
        fill="currentColor"
        d="M0 0h1440v40c-240-40-512-38-744 0-232 40-464 38-696-4V0Z"
      />
    </svg>
  );
}

/** Wadah standar section: lebar maksimum + jarak tepi yang konsisten. */
export function Wadah({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* ── Animasi muncul saat digulir ───────────────────────────────────────────
 *
 * Judul + deskripsi section.
 *
 * `tone` menentukan warnanya, karena section di beranda ada dua latar: putih
 * dan oranye. Di latar oranye teks harus gelap/putih, bukan merah lagi.
 *
 * Bagian-bagiannya muncul bertingkat (label → judul → deskripsi) memakai
 * `Muncul`. Dipasang di sini — bukan di tiap section — supaya semua section
 * berperilaku sama tanpa satu pun section perlu tahu soal animasi. Aturan
 * CSS-nya ada di `globals.css` (kelas `.dsc-muncul`).
 */
export function JudulSection({
  eyebrow,
  judul,
  deskripsi,
  tone = "terang",
  align = "kiri",
}: {
  eyebrow?: string;
  judul: string;
  deskripsi?: string;
  tone?: "terang" | "oranye";
  align?: "kiri" | "tengah";
}) {
  const judulWarna = tone === "oranye" ? "text-ink" : "text-foreground";
  const isiWarna = tone === "oranye" ? "text-ink/80" : "text-muted";

  return (
    <div className={align === "tengah" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <Muncul>
          <Eyebrow tone={tone === "oranye" ? "gelap" : "brand"}>{eyebrow}</Eyebrow>
        </Muncul>
      )}
      <Muncul delay={90}>
        <h2
          className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem] ${judulWarna}`}
        >
          {judul}
        </h2>
      </Muncul>
      {deskripsi && (
        <Muncul delay={180}>
          <p className={`mt-4 text-sm leading-relaxed sm:text-base ${isiWarna}`}>
            {deskripsi}
          </p>
        </Muncul>
      )}
    </div>
  );
}
