import { hapusFeedback } from "@/app/admin/actions";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { IconChat } from "@/components/icons";
import { getAllFeedbacks } from "@/server/feedback";
import { formatRelatif, formatTanggalJam } from "@/utils/format";

/**
 * Kotak masukan dari pengunjung.
 *
 * Tanpa fitur "tandai sudah dibaca" — supaya tidak ada status yang harus
 * dirawat. Kalau sudah ditindaklanjuti, hapus. Kalau perlu disimpan, salin
 * isinya (tombol balas lewat email sudah disiapkan kalau pengirimnya mengisi
 * email).
 */

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;
  const { data, error } = await getAllFeedbacks(500);
  const daftar = data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">Feedback</h1>
        <p className="mt-1 text-sm text-muted">
          {daftar.length} masukan dari pengunjung situs. Yang terbaru di urutan paling atas.
        </p>
      </header>

      {galat ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {galat}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          Gagal membaca data: {error.message}
        </p>
      ) : null}

      {daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconChat className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-foreground">Belum ada masukan.</p>
          <p className="mt-1 text-xs text-muted">
            Formulir masukan ada di bagian bawah beranda.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {daftar.map((f) => (
            <li key={f.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{f.sender_name}</p>
                  <p className="text-xs text-muted">
                    {f.sender_email ? (
                      <a href={`mailto:${f.sender_email}`} className="hover:text-brand hover:underline">
                        {f.sender_email}
                      </a>
                    ) : (
                      "tanpa email"
                    )}{" "}
                    • {formatRelatif(f.created_at)} • {formatTanggalJam(f.created_at)}
                  </p>
                </div>

                <form action={hapusFeedback}>
                  <input type="hidden" name="id" value={f.id} />
                  <TombolHapus nama={`masukan dari ${f.sender_name}`} label="Sudah dibaca" />
                </form>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {f.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
