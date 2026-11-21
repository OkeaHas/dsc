"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCalendar,
  IconChat,
  IconCheck,
  IconHome,
  IconNews,
  IconUsers,
} from "@/components/icons";

/**
 * Navigasi panel admin.
 *
 * Desktop: kolom tegak di sisi kiri.
 * HP & tablet: strip mendatar yang bisa digeser — lebih sederhana daripada
 * laci menu, dan tidak ada state yang bisa lupa ditutup.
 */

interface ItemAdmin {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}

const ITEM: ItemAdmin[] = [
  { href: "/admin", label: "Ringkasan", Icon: IconHome },
  { href: "/admin/anggota", label: "Anggota", Icon: IconUsers },
  { href: "/admin/berita", label: "Berita", Icon: IconNews },
  { href: "/admin/kegiatan", label: "Kegiatan", Icon: IconCalendar },
  { href: "/admin/absen", label: "Absen", Icon: IconCheck },
  { href: "/admin/feedback", label: "Feedback", Icon: IconChat },
];

function aktif(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Navigasi panel" className="hidden lg:block">
        <ul className="space-y-1">
          {ITEM.map(({ href, label, Icon }) => {
            const ini = aktif(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={ini ? "page" : undefined}
                  className={`dsc-tap flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                    ini
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Navigasi panel" className="-mx-4 lg:hidden">
        <ul className="dsc-no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
          {ITEM.map(({ href, label, Icon }) => {
            const ini = aktif(pathname, href);
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={ini ? "page" : undefined}
                  className={`dsc-tap inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition-colors ${
                    ini
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
