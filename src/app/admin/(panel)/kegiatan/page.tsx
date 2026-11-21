import Link from "next/link";
import { hapusKegiatan, ubahStatusKegiatan } from "@/app/admin/actions";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { IconCalendar } from "@/components/icons";
import { getAllAttendance } from "@/server/attendance";
import { getAllEvents } from "@/server/events";
import { formatTanggalJam, labelStatusEvent } from "@/utils/format";

/**
 * Daftar kegiatan + pengaturan status pendaftaran.
 *
 * Tombol buka/tutup pendaftaran sengaja ditaruh langsung di daftar: itu aksi
 * yang paling sering dipakai panitia (menutup pendaftaran begitu acara mulai),
 * jadi tidak perlu masuk ke halaman ubah dulu.
 */

export const dynamic = "force-dynamic";

export default async function AdminKegiatanPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;
  const [kegiatan, absen] = await Promise.all([getAllEvents(200), getAllAttendance(500)]);

  const daftar = kegiatan.data ?? [];
  const jumlahAbsen = new Map<string, number>();
  for (const a of absen.data ?? []) {
    jumlahAbsen.set(a.event_id, (jumlahAbsen.get(a.event_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">Kegiatan</h1>
          <p className="mt-1 text-sm text-muted">
            {daftar.length} kegiatan. Gambarnya ikut tampil di dinding galeri beranda.
          </p>
        </div>

        <Link
          href="/admin/kegiatan/baru"
          className="dsc-btn-primary dsc-tap inline-flex min-h-11 items-center rounded-full px-5 text-sm font-extrabold"
        >
          Tambah kegiatan
        </Link>
      </header>

      {galat ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {galat}
        </p>
      ) : null}

      {kegiatan.error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          Gagal membaca data: {kegiatan.error.message}
        </p>
      ) : null}

      {daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconCalendar className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-foreground">Belum ada kegiatan.</p>
          <p className="mt-1 text-xs text-muted">Tambahkan agenda pertama lewat tombol di atas.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {daftar.map((k) => {
            const peserta = jumlahAbsen.get(k.id) ?? 0;
            return (
              <li key={k.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{k.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatTanggalJam(k.event_date)}
                      {k.location ? ` • ${k.location}` : ""}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      k.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {labelStatusEvent(k.event_date, k.is_active)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="mr-auto text-xs text-muted">{peserta} peserta absen</span>

                  <form action={ubahStatusKegiatan}>
                    <input type="hidden" name="id" value={k.id} />
                    <input type="hidden" name="is_active" value={k.is_active ? "false" : "true"} />
                    <button
                      type="submit"
                      className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                    >
                      {k.is_active ? "Tutup pendaftaran" : "Buka pendaftaran"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/absen?event=${k.id}`}
                    className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                  >
                    Lihat absen
                  </Link>

                  <Link
                    href={`/admin/kegiatan/${k.id}`}
                    className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                  >
                    Ubah
                  </Link>

                  <form action={hapusKegiatan}>
                    <input type="hidden" name="id" value={k.id} />
                    <TombolHapus
                      nama={k.title}
                      pesanKonfirmasi={`Hapus "${k.title}"? Absen peserta kegiatan ini ikut terhapus.`}
                    />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
