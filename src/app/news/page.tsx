import { NewsCard } from "@/components/cards";
import { Container, DataNotice, EmptyState, PageHeader } from "@/components/ui";
import { getAllNews } from "@/server/news";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Berita",
  description:
    "Berita, pengumuman, dan catatan kegiatan terbaru dari Developer Student Club.",
};

export default async function NewsPage() {
  const { data, error } = await getAllNews(50);
  const news = data ?? [];

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Kabar komunitas"
        title="Berita"
        description="Pengumuman, rangkuman kegiatan, dan tulisan dari anggota."
      />

      {error && (
        <div className="mt-6">
          <DataNotice message={error.message} />
        </div>
      )}

      {news.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="mt-8">
            <EmptyState
              title="Belum ada berita"
              description="Tulisan pertama akan muncul di sini setelah diterbitkan lewat API POST /api/news."
            />
          </div>
        )
      )}
    </Container>
  );
}
