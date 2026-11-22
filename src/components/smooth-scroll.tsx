"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Smooth scroll Lenis untuk situs publik.
 *
 * Tiga hal yang diatur di sini, dan alasan masing-masing:
 *
 *  1. **Roda tetikus dihaluskan, sentuhan tidak.** `smoothWheel: true` dan
 *     `syncTouch` bawaan (false) → di HP gulirannya tetap guliran asli sistem.
 *     Mengakali guliran jari di HP hampir selalu terasa lambat dan salah.
 *  2. **Tautan anchor ditangani sendiri.** Lenis punya opsi `anchors`, tapi
 *     versi ini tidak memanggil `preventDefault()` — jadi peramban melompat
 *     dulu, baru Lenis menganimasikan, dan hasilnya justru terasa patah. Di
 *     sini kliknya dicegat, digulir halus lewat `lenis.scrollTo()` (yang tetap
 *     menghormati `scroll-margin-top` dari `.dsc-anchor`), lalu hash URL
 *     diperbarui supaya tautannya tetap bisa dibagikan.
 *  3. **Berhenti saat menu HP terbuka.** Sheet menu mengunci gulir badan
 *     halaman lewat `body.style.overflow`; Lenis memantaunya dengan
 *     MutationObserver, jadi komponen navbar tidak perlu tahu apa pun soal
 *     Lenis.
 *
 * Tidak dipasang di `/admin`: di panel, guliran yang lembut terasa menghambat
 * saat mengisi form panjang.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const diAdmin = pathname?.startsWith("/admin") ?? false;
  const jalur = pathname ?? "/";

  useEffect(() => {
    if (diAdmin) return;

    // Pengguna yang meminta gerak berkurang mendapat guliran asli peramban.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoResize: true,
      // Motor animasinya dijalankan sendiri supaya bisa dimatikan rapi.
      autoRaf: false,
    });

    let frame = 0;
    const langkah = (waktu: number) => {
      lenis.raf(waktu);
      frame = requestAnimationFrame(langkah);
    };
    frame = requestAnimationFrame(langkah);

    /** Klik pada tautan anchor di halaman yang sama → gulir halus. */
    const saatKlik = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const asal = event.target instanceof Element ? event.target : null;
      const tautan = asal?.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!tautan) return;

      const tujuanUrl = new URL(tautan.href, window.location.href);
      // Halaman lain, atau tautan ke luar: biarkan Next.js yang mengurus.
      if (tujuanUrl.origin !== window.location.origin) return;
      if (tujuanUrl.pathname !== window.location.pathname) return;
      if (tujuanUrl.hash.length < 2) return;

      const tujuan = document.getElementById(decodeURIComponent(tujuanUrl.hash.slice(1)));
      if (!tujuan) return;

      event.preventDefault();
      lenis.scrollTo(tujuan, { duration: 1.25 });
      history.pushState(null, "", tujuanUrl.hash);
    };

    document.addEventListener("click", saatKlik);

    /** Ikuti kunci gulir yang dipasang navbar saat sheet menu HP terbuka. */
    const selaraskanKunci = () => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    };
    selaraskanKunci();

    const pengamatKunci = new MutationObserver(selaraskanKunci);
    pengamatKunci.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", saatKlik);
      pengamatKunci.disconnect();
      lenis.destroy();
    };
  }, [diAdmin]);

  /**
   * Pindah halaman → kembali ke atas tanpa animasi.
   *
   * Dijalankan di effect terpisah (bukan di dalam effect Lenis) supaya instance
   * Lenis tidak dibongkar-pasang setiap navigasi. Kalau URL membawa hash
   * (mis. dari `/news` menuju `/#kabar`), tidak diapa-apakan — peramban yang
   * menempatkannya.
   */
  useEffect(() => {
    if (diAdmin || window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [jalur, diAdmin]);

  return null;
}
