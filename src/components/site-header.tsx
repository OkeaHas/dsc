"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IconClose, IconMenu, IconUsers } from "@/components/icons";
import { SECTION_ITEMS, sectionHref } from "@/components/nav-items";

/**
 * Navbar lengket di atas halaman.
 *
 * Dua hal yang bikin komponen ini client, dan cuma dua itu:
 *  1. Menu HP (buka/tutup sheet).
 *  2. Penanda menu aktif — di desain, menu yang sedang dilihat diberi garis
 *     bawah. Karena beranda itu satu halaman panjang, "sedang dilihat" harus
 *     dibaca dari posisi gulir (IntersectionObserver), bukan dari URL.
 */
export function SiteHeader() {
  const pathname = usePathname();
  /*
   * Menu HP disimpan sebagai "path tempat menu dibuka", bukan true/false biasa.
   * Efeknya: begitu halaman berpindah, nilai itu tidak cocok lagi dengan path
   * sekarang dan menunya tertutup sendiri — tanpa perlu effect yang memanggil
   * setState setelah render (yang memicu render berantai).
   */
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [aktif, setAktif] = useState<string | null>(null);

  const diBeranda = pathname === "/";
  const adaAnchor = diBeranda || pathname === "";
  const terbuka = menuPath === pathname;

  /** Kunci gulir badan halaman selama sheet terbuka. */
  useEffect(() => {
    if (!terbuka) return;
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = sebelumnya;
    };
  }, [terbuka]);

  /** Pantau section mana yang sedang di layar. */
  useEffect(() => {
    // Di halaman lain tidak ada section beranda untuk dipantau.
    if (!diBeranda) return;

    const elemen = SECTION_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => el !== null);

    if (elemen.length === 0) return;

    const pengamat = new IntersectionObserver(
      (entri) => {
        const terlihat = entri
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (terlihat[0]) setAktif(terlihat[0].target.id);
      },
      /*
       * Garis pandang dipersempit ke 45%–25% dari atas layar. Kalau memakai
       * ambang 0 seperti biasa, dua section bisa sama-sama "terlihat" dan
       * penandanya berkedip di antara keduanya.
       */
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );

    for (const el of elemen) pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [diBeranda]);

  /*
   * Di luar beranda tidak ada menu yang ditandai aktif. Dihitung saat render
   * (bukan lewat setState di dalam effect) supaya tidak ada render tambahan.
   */
  const aktifSection = diBeranda ? aktif : null;

  /** Saat menu diklik, langsung tandai aktif — jangan tunggu observer. */
  const tandai = useCallback(
    (id: string) => {
      setAktif(id);
      setMenuPath(null);
    },
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Menu mendatar — baru muncul di layar lebar (≥1024px). */}
        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTION_ITEMS.map((item) => {
              const sedang = adaAnchor && aktifSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id, pathname)}
                    onClick={() => tandai(item.id)}
                    aria-current={sedang ? "true" : undefined}
                    className={`relative flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      sedang
                        ? "text-brand"
                        : "text-foreground/75 hover:text-brand"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand transition-opacity ${
                        sedang ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setMenuPath(terbuka ? null : pathname)}
          aria-expanded={terbuka}
          aria-controls="menu-hp"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          className="dsc-tap grid size-11 place-items-center rounded-xl border border-border bg-surface text-foreground lg:hidden"
        >
          {terbuka ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}
        </button>
      </div>

      {/* Sheet menu untuk HP & tablet. */}
      {terbuka && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMenuPath(null)}
            className="dsc-backdrop fixed inset-0 top-[var(--header-h)] z-40"
          />
          <div
            id="menu-hp"
            /* Lenis tidak ikut campur di area yang bisa digulir sendiri. */
            data-lenis-prevent
            className="fixed inset-x-0 top-[var(--header-h)] z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-b border-border bg-background px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 sm:px-6"
          >
            <ul className="flex flex-col gap-1">
              {SECTION_ITEMS.map((item) => {
                const sedang = adaAnchor && aktifSection === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={sectionHref(item.id, pathname)}
                      onClick={() => tandai(item.id)}
                      className={`dsc-tap flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold ${
                        sedang
                          ? "bg-brand-soft text-brand"
                          : "text-foreground hover:bg-surface-2"
                      }`}
                    >
                      <item.Icon className="size-5 shrink-0" />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

/** Lambang DSC: kotak merah + tulisan dua baris, seperti di desain. */
function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <IconUsers className="size-6" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          DSC
        </span>
        <span className="text-[10px] font-bold tracking-[0.18em] text-muted">
          DEVELOPER CLUBS
        </span>
      </span>
    </Link>
  );
}
