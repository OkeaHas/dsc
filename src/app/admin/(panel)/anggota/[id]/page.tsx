import Link from "next/link";
import { notFound } from "next/navigation";
import { AnggotaForm } from "@/components/admin/member-form";
import { getMemberById } from "@/server/members";
import { isUuid } from "@/utils/validate";

/**
 * Ubah data anggota.
 *
 * `params` di Next 16 adalah Promise — wajib di-`await`. Id dari URL divalidasi
 * sebagai UUID lebih dulu: id ngawur (misal "abc") tidak perlu sampai ke
 * database hanya untuk berbalas error Postgres.
 */

export const dynamic = "force-dynamic";

export default async function UbahAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { data, error } = await getMemberById(id);
  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/anggota" className="text-xs font-bold text-brand hover:underline">
          ← Anggota
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          {data.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{data.role}</p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <AnggotaForm awal={data} />
      </div>
    </div>
  );
}
