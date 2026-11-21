import Link from "next/link";
import { notFound } from "next/navigation";
import { BeritaForm } from "@/components/admin/news-form";
import { getNewsBySlug } from "@/server/news";

/** Sunting berita berdasarkan slug — alamat yang sama dengan halaman publiknya. */

export const dynamic = "force-dynamic";

export default async function SuntingBeritaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getNewsBySlug(decodeURIComponent(slug));
  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/berita" className="text-xs font-bold text-brand hover:underline">
          ← Berita
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-brand sm:text-3xl">
          {data.title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Alamat publik:{" "}
          <Link href={`/news/${data.slug}`} className="font-bold text-brand hover:underline">
            /news/{data.slug}
          </Link>
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <BeritaForm awal={data} />
      </div>
    </div>
  );
}
