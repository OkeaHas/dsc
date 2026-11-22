import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

/**
 * sitemap.xml — daftar halaman yang layak dijelajahi mesin pencari.
 *
 * Sengaja HANYA berisi halaman tetap, tanpa membaca database. Sitemap di Next
 * disusun saat build; kalau di sini ada query Supabase, build akan gagal begitu
 * environment variable belum terpasang di mesin/CI — dan itu membuat masalah
 * kecil (sitemap) menumbangkan masalah besar (deploy).
 *
 * Alamat detail berita & kegiatan tidak perlu didaftarkan di sini: keduanya
 * terjangkau dari daftarnya, dan crawler akan mengikutinya sendiri.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const dasar = getSiteUrl();
  const diubah = new Date();

  const halaman: { jalur: string; frekuensi: "weekly" | "monthly"; prioritas: number }[] = [
    { jalur: "", frekuensi: "weekly", prioritas: 1 },
    { jalur: "/news", frekuensi: "weekly", prioritas: 0.9 },
    { jalur: "/events", frekuensi: "weekly", prioritas: 0.8 },
    { jalur: "/members", frekuensi: "monthly", prioritas: 0.6 },
    { jalur: "/leaderboard", frekuensi: "weekly", prioritas: 0.6 },
    { jalur: "/feedback", frekuensi: "monthly", prioritas: 0.5 },
  ];

  return halaman.map(({ jalur, frekuensi, prioritas }) => ({
    url: `${dasar}${jalur || "/"}`,
    lastModified: diubah,
    changeFrequency: frekuensi,
    priority: prioritas,
  }));
}
