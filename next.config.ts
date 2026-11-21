import type { NextConfig } from "next";

/**
 * Daftar host gambar yang diizinkan untuk `next/image`.
 *
 * Wajib: gambar dari Supabase Storage berupa URL absolut, dan `next/image`
 * menolak host yang tidak terdaftar. Versi lama belum mengatur ini sama sekali
 * — begitu ada foto anggota asli, halaman akan gagal render.
 */
function remotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    // Semua project Supabase (hostname project berakhiran .supabase.co).
    { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/**" },
  ];

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (raw) {
    try {
      const { hostname } = new URL(raw);
      if (!patterns.some((pattern) => pattern.hostname === hostname)) {
        patterns.push({ protocol: "https", hostname, pathname: "/storage/v1/object/**" });
      }
    } catch {
      // URL belum diisi dengan benar — pola wildcard di atas tetap dipakai.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: remotePatterns(),
    // Gambar situs ini jarang berubah dan sudah punya cache-control panjang
    // dari Supabase, jadi cukup satu kualitas keluaran.
    qualities: [75],
  },
  experimental: {
    serverActions: {
      // Form admin mengirim gambar lewat server action, sementara batas bawaan
      // Next hanya 1 MB. Batas unggah di `src/utils/uploadImage.ts` adalah 2 MB,
      // jadi beri ruang lebih untuk overhead multipart.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
