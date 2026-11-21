import type { ComponentType, SVGProps } from "react";
import {
  IconChat,
  IconHome,
  IconImage,
  IconTarget,
  IconTrophy,
  IconUsers,
} from "@/components/icons";

/**
 * Navigasi DSC mengikuti desain Figma: halaman beranda adalah SATU halaman
 * panjang berisi semua section, dan menu di navbar menggulir ke section itu
 * (anchor), bukan pindah halaman.
 *
 * Karena itu yang disimpan di sini adalah `id` section, bukan `href`. Helper
 * `sectionHref()` yang menyusun URL-nya — di beranda cukup `#anggota`, dari
 * halaman lain harus `/#anggota` supaya browser pulang dulu ke beranda.
 */

export interface NavItem {
  /** `id` elemen section di beranda (dipakai juga sebagai target anchor). */
  id: string;
  label: string;
  /** Label pendek untuk tab bar HP — ruangnya sempit. */
  short: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Urutan section di beranda, sama persis dengan urutan menu di desain. */
export const SECTION_ITEMS: NavItem[] = [
  { id: "tentang-kami", label: "Tentang Kami", short: "Tentang", Icon: IconUsers },
  { id: "visi-misi", label: "Visi & Misi", short: "Visi", Icon: IconTarget },
  { id: "anggota", label: "Anggota", short: "Anggota", Icon: IconUsers },
  { id: "galeri", label: "Galeri", short: "Galeri", Icon: IconImage },
  { id: "leaderboard", label: "Leaderboard", short: "Peringkat", Icon: IconTrophy },
  { id: "feedback", label: "Feedback", short: "Feedback", Icon: IconChat },
];

/** Alias lama — dulu ini daftar halaman terpisah, sekarang daftar section. */
export const NAV_ITEMS = SECTION_ITEMS;

/**
 * Yang tampil di tab bar bawah (maksimal 5 — lebih dari itu jadi sempit di HP).
 * "Beranda" di sini berarti menggulir ke paling atas, bukan pindah halaman.
 */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "beranda", label: "Beranda", short: "Beranda", Icon: IconHome },
  { id: "anggota", label: "Anggota", short: "Anggota", Icon: IconUsers },
  { id: "galeri", label: "Galeri", short: "Galeri", Icon: IconImage },
  { id: "leaderboard", label: "Leaderboard", short: "Peringkat", Icon: IconTrophy },
  { id: "feedback", label: "Feedback", short: "Feedback", Icon: IconChat },
];

/**
 * URL anchor satu section.
 *
 * Di beranda: `#anggota` (tanpa path) supaya tidak memicu navigasi ulang
 * Next.js. Di halaman lain: `/#anggota` supaya browser balik ke beranda lalu
 * menggulir.
 */
export function sectionHref(id: string, pathname = "/"): string {
  if (id === "beranda") return pathname === "/" ? "#beranda" : "/";
  return pathname === "/" ? `#${id}` : `/#${id}`;
}

/** Tab aktif kalau path-nya persis sama, atau merupakan sub-path dari href. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
