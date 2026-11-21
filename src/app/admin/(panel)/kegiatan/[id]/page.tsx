import Link from "next/link";
import { notFound } from "next/navigation";
import { KegiatanForm } from "@/components/admin/event-form";
import { getEventById } from "@/server/events";
import { isUuid } from "@/utils/validate";

/** Sunting kegiatan. Id dari URL divalidasi UUID lebih dulu. */

export const dynamic = "force-dynamic";

export default async function SuntingKegiatanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { data, error } = await getEventById(id);
  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/kegiatan" className="text-xs font-bold text-brand hover:underline">
          ← Kegiatan
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          {data.title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          <Link href={`/events/${data.id}`} className="font-bold text-brand hover:underline">
            Lihat halaman publiknya
          </Link>
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <KegiatanForm awal={data} />
      </div>
    </div>
  );
}
