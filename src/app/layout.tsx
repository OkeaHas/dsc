import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono, Poppins } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";
// CSS wajib Lenis (html.lenis, .lenis-stopped, dst.) — disalin dari paketnya
// supaya tidak perlu menyalin aturannya ke globals.css dan bisa ikut ter-update.
import "lenis/dist/lenis.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Poppins untuk judul — bentuk hurufnya bulat dan tebal, sama dengan tipografi
 * di desain Figma. Poppins bukan font variabel di Google Fonts, jadi bobotnya
 * harus disebut satu per satu.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

/** Caveat = tulisan tangan, dipakai kalau nanti ada catatan ala sticky note. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Developer Student Club — Profil, Kegiatan & Berita",
    template: "%s • Developer Student Club",
  },
  description:
    "Website profil Developer Student Club: daftar anggota, agenda kegiatan, berita terbaru, papan peringkat, dan kotak kritik & saran.",
  applicationName: "DSC Profile",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Developer Student Club",
    title: "Developer Student Club — Profil, Kegiatan & Berita",
    description:
      "Agenda kegiatan, berita, anggota, dan papan peringkat Developer Student Club.",
  },
};

/**
 * `viewportFit: "cover"` wajib supaya `env(safe-area-inset-bottom)` di tab bar
 * benar-benar bernilai di iPhone/Android dengan gesture bar. Tanpa ini, nilai
 * inset-nya selalu 0 dan tab bar tertutup gesture bar.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#120d0c" },
  ],
};

/**
 * `children` ditulis eksplisit, bukan memakai helper global `LayoutProps<"/">`.
 * Helper itu baru ada setelah `next typegen` dijalankan, sehingga `tsc` pada
 * repo yang baru di-clone akan gagal sebelum ada satu baris pun yang salah.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />

        {/*
          Padding bawah menutup tinggi tab bar (h-16 = 4rem) + area aman, supaya
          konten terakhir tidak ketutupan tab bar di HP.
        */}
        <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>

        <SiteFooter />
        <BottomNav />
        {/* Guliran halus (Lenis) — tidak aktif di /admin dan tidak aktif kalau
            pengguna meminta gerak berkurang. */}
        <SmoothScroll />
      </body>
    </html>
  );
}
