import Link from "next/link";
import { getAllAttendance } from "@/server/attendance";
import { getAllEvents } from "@/server/events";
import { IconCheck } from "@/components/icons";
import { formatTanggalJam } from "@/utils/format";

/**
 * Rekap absen peserta.
 *
 * Satu halaman, dua mode: tanpa filter = semua absen terbaru; dengan
 * `?event=<id>` = satu kegiatan saja. Tombol "Unduh CSV" mengikuti filter yang
 * sedang aktif, jadi panitia bisa langsung mengirim daftar hadir ke pembina.
 */

export const dynamic = "force-dynamic";

export default async function AdminAbsenPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;

  const [absen, kegiatan] = await Promise.all([getAllAttendance(500), getAllEvents(200)]);
  const daftarKegiatan = kegiatan.data ?? [];
  const semua = absen.data ?? [];

  const judul = new Map(daftarKegiatan.map((k) => [k.id, k.title]));
  const baris = event ? semua.filter((a) => a.event_id === event) : semua;

  const terpilih = event ? judul.get(event) : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">
            {terpilih ?? "Absen peserta"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {terpilih
              ? `${baris.length} peserta terdaftar di kegiatan ini.`
              : `${semua.length} absen dari seluruh kegiatan.`}
          </p>
        </div>

        <a
          href={`/admin/absen/unduh${event ? `?event=${event}` : ""}`}
          className="dsc-btn-primary dsc-tap inline-flex min-h-11 items-center rounded-full px-5 text-sm font-extrabold"
        >
          Unduh CSV
        </a>
      </header>

      <nav aria-label="Saring kegiatan" className="-mx-4 lg:mx-0">
        <ul className="dsc-no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 lg:flex-wrap lg:px-0">
          <li className="shrink-0">
            <Link
              href="/admin/absen"
              className={`dsc-tap inline-flex min-h-10 items-center rounded-full border px-3.5 text-xs font-bold whitespace-nowrap ${
                event ? "border-border bg-surface text-muted" : "border-brand bg-brand text-white"
              }`}
            >
              Semua kegiatan
            </Link>
          </li>

          {daftarKegiatan.map((k) => {
            const ini = event === k.id;
            const jumlah = semua.filter((a) => a.event_id === k.id).length;

            return (
              <li key={k.id} className="shrink-0">
                <Link
                  href={`/admin/absen?event=${k.id}`}
                  aria-current={ini ? "page" : undefined}
                  className={`dsc-tap inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap ${
                    ini
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  {k.title}
                  <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{jumlah}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {baris.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconCheck className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-foreground">Belum ada absen.</p>
          <p className="mt-1 text-xs text-muted">
            Peserta mengisi formulir absen di halaman kegiatan, lalu namanya muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-surface-2/70 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Nama</th>
                <th scope="col" className="px-4 py-3 font-bold">Email</th>
                <th scope="col" className="px-4 py-3 font-bold">Institusi</th>
                {event ? null : <th scope="col" className="px-4 py-3 font-bold">Kegiatan</th>}
                <th scope="col" className="px-4 py-3 font-bold">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {baris.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-foreground">{a.participant_name}</td>
                  <td className="px-4 py-3 text-muted">
                    <a href={`mailto:${a.participant_email}`} className="hover:text-brand hover:underline">
                      {a.participant_email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.institution ?? "-"}</td>
                  {event ? null : (
                    <td className="px-4 py-3 text-muted">{judul.get(a.event_id) ?? "Kegiatan terhapus"}</td>
                  )}
                  <td className="px-4 py-3 text-muted">{formatTanggalJam(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
