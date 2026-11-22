import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

/**
 * robots.txt — dibuat Next dari berkas ini.
 *
 * Semua halaman publik boleh diindeks. Yang ditutup:
 *  - `/admin` — panel panitia, sudah diberi `robots: index:false` di layoutnya,
 *    ini lapisan kedua supaya mesin pencari tidak repot menelusurinya.
 *  - `/api`  — endpoint, tidak ada isinya yang berguna untuk crawler.
 */
export default function robots(): MetadataRoute.Robots {
  const situs = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${situs}/sitemap.xml`,
    host: situs,
  };
}
