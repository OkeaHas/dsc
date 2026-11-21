import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight } from "@/components/icons";
import { Card, Container, DataNotice } from "@/components/ui";
import { getNewsBySlug, getAllNews } from "@/server/news";
import { formatRelatif, formatTanggalPanjang } from "@/utils/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Di Next.js 16 `params` pada page juga berupa Promise. */
async function resolveSlug(params: PageProps["params"]): Promise<string> {
  const { slug } = await params;
  return decodeURIComponent(slug).trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const { data } = await getNewsBySlug(slug);

  if (!data) return { title: "Berita tidak ditemukan" };

  return {
    title: data.title,
    description: data.content.slice(0, 160),
    openGraph: {
      title: data.title,
      description: data.content.slice(0, 160),
      images: data.cover_image_url ? [{ url: data.cover_image_url }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const slug = await resolveSlug(params);
  const { data: news, error } = await getNewsBySlug(slug);

  if (error && /tidak ditemukan/i.test(error.message)) notFound();
  if (error || !news) {
    return (
      <Container className="py-10">
        <DataNotice message={error?.message ?? "Berita tidak bisa dimuat."} />
      </Container>
    );
  }

  const { data: others } = await getAllNews(4);
  const related = (others ?? []).filter((item) => item.id !== news.id).slice(0, 3);

  const paragraphs = news.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <Container className="py-6 sm:py-10">
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/news" className="hover:text-foreground">
            Berita
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{news.title}</span>
        </nav>

        <header className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {formatRelatif(news.created_at)}
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            {news.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Diterbitkan {formatTanggalPanjang(news.created_at)}
          </p>
        </header>

        {news.cover_image_url && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-2">
            <Image
              src={news.cover_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="dsc-prose mt-8 text-[15px] sm:text-base">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl border-t border-border pt-8">
          <h2 className="text-base font-bold sm:text-lg">Berita lainnya</h2>
          <ul className="mt-4 grid gap-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/news/${item.slug}`} className="block">
                  <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-2 sm:p-5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug sm:text-base">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {formatRelatif(item.created_at)}
                      </span>
                    </span>
                    <IconArrowRight className="size-4 shrink-0 text-muted" />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
