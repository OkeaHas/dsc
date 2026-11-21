import Image from "next/image";
import Link from "next/link";
import { hapusAnggota } from "@/app/admin/actions";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { IconUsers } from "@/components/icons";
import { getAllMembers } from "@/server/members";
import { formatAngka, inisial } from "@/utils/format";

/**
 * Daftar anggota + aksi ubah/hapus.
 *
 * Pencarian memakai query string biasa (`?q=`) dan diproses di server — tidak
 * perlu state di browser, hasilnya bisa dibagikan lewat URL, dan tetap jalan
 * walau JavaScript belum termuat.
 */

export const dynamic = "force-dynamic";

export default async function AdminAnggotaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; galat?: string }>;
}) {
  const { q, galat } = await searchParams;
  const { data, error } = await getAllMembers();

  const semua = data ?? [];
  const kata = (q ?? "").trim().toLowerCase();
  const daftar = kata
    ? semua.filter((m) => `${m.name} ${m.role}`.toLowerCase().includes(kata))
    : semua;

  const totalPoin = semua.reduce((jumlah, m) => jumlah + (m.points ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand sm:text-3xl">Anggota</h1>
          <p className="mt-1 text-sm text-muted">
            {formatAngka(semua.length)} anggota • total {formatAngka(totalPoin)} poin. Poin
            menentukan urutan di papan peringkat beranda.
          </p>
        </div>

        <Link
          href="/admin/anggota/baru"
          className="dsc-btn-primary dsc-tap inline-flex min-h-11 items-center rounded-full px-5 text-sm font-extrabold"
        >
          Tambah anggota
        </Link>
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

      <form className="flex gap-2" action="/admin/anggota">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama atau jabatan..."
          className="w-full max-w-sm rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          className="dsc-tap inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          Cari
        </button>
      </form>

      {daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <IconUsers className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-foreground">
            {kata ? "Tidak ada anggota yang cocok." : "Belum ada anggota."}
          </p>
          <p className="mt-1 text-xs text-muted">
            {kata ? "Coba kata kunci lain." : "Tambahkan pengurus pertama lewat tombol di atas."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {daftar.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              {m.photo_url ? (
                <Image
                  src={m.photo_url}
                  alt={m.name}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-soft font-display text-lg font-extrabold text-brand">
                  {inisial(m.name)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.role}</p>
              </div>

              <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                {formatAngka(m.points)} poin
              </span>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/anggota/${m.id}`}
                  className="dsc-tap inline-flex min-h-10 items-center rounded-full border border-border px-3 text-xs font-bold text-muted transition-colors hover:text-foreground"
                >
                  Ubah
                </Link>

                <form action={hapusAnggota}>
                  <input type="hidden" name="id" value={m.id} />
                  <TombolHapus nama={m.name} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
