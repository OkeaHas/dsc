import Link from "next/link";
import { IconArrowRight, IconCalendar, IconChat, IconNews, IconUsers } from "@/components/icons";
import { getAllAttendance } from "@/server/attendance";
import { getAllEvents } from "@/server/events";
import { getAllFeedbacks } from "@/server/feedback";
import { getAllMembers } from "@/server/members";
import { getAllNews } from "@/server/news";
import { formatTanggalJam, formatRelatif, labelStatusEvent, potongTeks, sekarangMs } from "@/utils/format";

/**
 * Ringkasan panel admin.
 *
 * Isinya sengaja cuma tiga hal yang benar-benar dipakai panitia tiap minggu:
 * berapa isi datanya, kegiatan terdekat, dan masukan terbaru. Semuanya dibaca
 * langsung dari data access layer — tidak lewat API, jadi tidak butuh token.
 */

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [anggota, berita, kegiatan, absen, feedback] = await Promise.all([
    getAllMembers(),
    getAllNews(100),
    getAllEvents(200),
    getAllAttendance(500),
    getAllFeedbacks(500),
  ]);

  const daftarKegiatan = kegiatan.data ?? [];
  const aktif = daftarKegiatan.filter((k) => k.is_active).length;
  const akanDatang = daftarKegiatan
    .filter((k) => new Date(k.event_date).getTime() >= sekarangMs())
    .sort((a, b) => Date.parse(a.event_date) - Date.parse(b.event_date))
    .slice(0, 4);

  const masukanTerbaru = (feedback.data ?? []).slice(0, 4);

  const kartu = [
    {
      label: "Anggota",
      nilai: anggota.data?.length ?? 0,
      href: "/admin/anggota",
      Icon: IconUsers,
      catatan: "termasuk pengurus & anggota",
    },
    {
      label: "Berita",
      nilai: berita.data?.length ?? 0,
      href: "/admin/berita",
      Icon: IconNews,
      catatan: "terbit dan bisa dibaca publik",
    },
    {
      label: "Kegiatan",
      nilai: daftarKegiatan.length,
      href: "/admin/kegiatan",
      Icon: IconCalendar,
      catatan: `${aktif} masih membuka pendaftaran`,
    },
    {
      label: "Absen & feedback",
      nilai: (absen.data?.length ?? 0) + (feedback.data?.length ?? 0),
      href: "/admin/absen",
      Icon: IconChat,
      catatan: `${absen.data?.length ?? 0} absen, ${feedback.data?.length ?? 0} masukan`,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">Ringkasan</h1>
        <p className="mt-1 text-sm text-muted">
          Semua yang tampil di beranda dikelola dari sini. Perubahan langsung terlihat publik —
          tidak ada tombol terbit terpisah.
        </p>
      </header>

      <section aria-label="Jumlah data" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map(({ label, nilai, href, Icon, catatan }) => (
          <Link
            key={label}
            href={href}
            className="dsc-tap group rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <IconArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{nilai}</p>
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted">{catatan}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Kegiatan terdekat" className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold text-foreground">Kegiatan terdekat</h2>
            <Link href="/admin/kegiatan" className="text-xs font-bold text-brand hover:underline">
              Kelola
            </Link>
          </div>

          {akanDatang.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Belum ada kegiatan dengan tanggal di depan. Tambahkan lewat menu Kegiatan.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {akanDatang.map((k) => (
                <li key={k.id} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{k.title}</p>
                    <p className="text-xs text-muted">{formatTanggalJam(k.event_date)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      k.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {labelStatusEvent(k.event_date, k.is_active)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Masukan terbaru" className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold text-foreground">Masukan terbaru</h2>
            <Link href="/admin/feedback" className="text-xs font-bold text-brand hover:underline">
              Lihat semua
            </Link>
          </div>

          {masukanTerbaru.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Kotak masukan masih kosong.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {masukanTerbaru.map((m) => (
                <li key={m.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-foreground">{potongTeks(m.message, 120)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {m.sender_name} • {formatRelatif(m.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
