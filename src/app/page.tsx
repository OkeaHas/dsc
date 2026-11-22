import { IconAlert } from "@/components/icons";
import { Anggota } from "@/components/sections/anggota";
import { CtaBand } from "@/components/sections/cta";
import { Wadah } from "@/components/sections/decor";
import { FeedbackSection } from "@/components/sections/feedback";
import { Galeri } from "@/components/sections/galeri";
import { Hero } from "@/components/sections/hero";
import { Kabar } from "@/components/sections/kabar";
import { Leaderboard } from "@/components/sections/leaderboard";
import { Tentang } from "@/components/sections/tentang";
import { VisiMisi } from "@/components/sections/visi-misi";
import { getLeaderboard } from "@/server/leaderboard";
import { getAllEvents } from "@/server/events";
import { getAllMembers } from "@/server/members";
import { getAllNews } from "@/server/news";

/**
 * Beranda = satu halaman panjang berisi semua section (Tentang Kami, Visi &
 * Misi, Anggota, Galeri, Kabar Terbaru, Leaderboard, Feedback), persis seperti
 * desain. Menu di navbar menggulir ke section, bukan pindah halaman.
 *
 * "Kabar Terbaru" adalah satu-satunya section yang tidak ada di desain: panel
 * admin bisa menerbitkan berita, jadi beranda perlu pintu menuju berita —
 * kalau tidak, tulisan panitia tidak akan pernah dilihat pengunjung.
 *
 * `force-dynamic` supaya data anggota/kegiatan/berita selalu segar — halaman
 * ini dikelola panitia lewat panel admin, jadi tidak boleh disajikan dari cache.
 */
export const dynamic = "force-dynamic";

export default async function Beranda() {
  // Empat permintaan jalan bersamaan; kalau salah satu gagal, section lain tetap
  // tampil dengan data kosong dan alasannya diberitahukan di banner.
  const [hasilAnggota, hasilKegiatan, hasilKabar, hasilPapan] = await Promise.all([
    getAllMembers(),
    getAllEvents(24),
    getAllNews(3),
    getLeaderboard(10),
  ]);

  const anggota = hasilAnggota.data ?? [];
  const kegiatan = hasilKegiatan.data ?? [];
  const kabar = hasilKabar.data ?? [];
  const papan = hasilPapan.data ?? [];

  const gagal = [
    hasilAnggota.error ? "data anggota" : null,
    hasilKegiatan.error ? "data kegiatan" : null,
    hasilKabar.error ? "kabar terbaru" : null,
    hasilPapan.error ? "papan peringkat" : null,
  ].filter((item): item is string => item !== null);

  return (
    <>
      <Hero />

      {gagal.length > 0 && (
        <Wadah>
          <p
            role="status"
            className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            <IconAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              Sebagian data belum bisa dimuat ({gagal.join(", ")}). Biasanya
              karena kunci Supabase belum diisi di berkas <code>.env</code> atau
              koneksi internet sedang bermasalah — bagian lain halaman tetap bisa
              dibaca.
            </span>
          </p>
        </Wadah>
      )}

      <Tentang jumlahAnggota={anggota.length} jumlahKegiatan={kegiatan.length} />
      <VisiMisi />
      <Anggota members={anggota} />
      <Galeri events={kegiatan} />
      <Kabar news={kabar} />
      <Leaderboard entries={papan} />
      <FeedbackSection />
      <CtaBand />
    </>
  );
}
