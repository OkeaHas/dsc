"use client";

import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS, sectionHref } from "@/components/nav-items";

/**
 * Tab bar bawah — khusus HP dan tablet potret (`lg:hidden`).
 *
 * Tingginya dipatok 4rem, sama dengan ruang bawah yang disiapkan `main` di
 * `app/layout.tsx`; kalau salah satu diubah, ubah keduanya.
 *
 * Isinya jalan pintas ke section beranda, jadi selalu ada cara cepat pindah
 * section tanpa membuka menu — juga saat dibuka dari halaman lain, karena
 * tautannya otomatis jadi `/#nama-section`.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi cepat"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-3xl items-stretch">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const href = sectionHref(item.id, pathname);

          return (
            <li key={item.id} className="flex-1">
              <a
                href={href}
                className="flex h-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold text-muted transition-colors hover:text-brand"
              >
                <item.Icon className="size-5" />
                <span className="truncate">{item.short}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
