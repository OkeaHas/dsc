"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Pembungkus animasi muncul-saat-digulir.
 *
 * Cara kerjanya sengaja dua lapis supaya tidak pernah ada konten yang hilang:
 *
 *  1. Keadaan "tersembunyi" (opacity 0 + bergeser ke bawah) hanya aktif kalau
 *     peramban benar-benar menjalankan JavaScript DAN pengguna tidak meminta
 *     gerak berkurang — dijaga `@media (scripting: enabled)` di globals.css.
 *     Jadi tanpa JavaScript, semuanya langsung terlihat normal.
 *  2. Begitu elemen masuk layar, kelas `dsc-muncul-masuk` dipasang dan CSS
 *     transisinya bergerak ke posisi akhir.
 *
 * Kalau `IntersectionObserver` tidak ada (peramban sangat tua), elemen
 * dibiarkan terlihat — animasi itu bonus, bukan syarat terbacanya isi.
 */
export function Muncul({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Jeda sebelum animasi mulai (milidetik) — untuk efek bertingkat. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemen = ref.current;
    if (!elemen) return;

    if (typeof IntersectionObserver === "undefined") {
      elemen.classList.add("dsc-muncul-masuk");
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("dsc-muncul-masuk");
          // Sekali saja: setelah muncul, berhenti diamati. Animasi yang berulang
          // setiap kali digulir naik-turun terasa mengganggu, bukan halus.
          pengamat.unobserve(e.target);
        }
      },
      // Mulai sedikit sebelum elemen benar-benar menempel di tepi bawah layar.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    pengamat.observe(elemen);
    return () => pengamat.disconnect();
  }, []);

  const gaya = delay > 0 ? ({ "--dsc-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} className={`dsc-muncul ${className}`.trim()} style={gaya}>
      {children}
    </div>
  );
}
