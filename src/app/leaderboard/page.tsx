import { LeaderboardRow } from "@/components/cards";
import { Container, DataNotice, EmptyState, PageHeader, Stat } from "@/components/ui";
import { getLeaderboard } from "@/server/leaderboard";
import { formatAngka } from "@/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Papan Peringkat",
  description:
    "Peringkat anggota Developer Student Club berdasarkan poin keaktifan.",
};

export default async function LeaderboardPage() {
  const { data, error } = await getLeaderboard(100);
  const entries = data ?? [];

  const totalPoin = entries.reduce((sum, entry) => sum + entry.points, 0);
  const rataRata = entries.length > 0 ? Math.round(totalPoin / entries.length) : 0;

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Kontribusi"
        title="Papan Peringkat"
        description="Poin dihitung dari keaktifan anggota di kegiatan, kepanitiaan, dan kontribusi proyek."
      />

      {error && (
        <div className="mt-6">
          <DataNotice message={error.message} />
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <Stat label="Peringkat 1" value={entries[0].name} hint={`${formatAngka(entries[0].points)} poin`} />
          <Stat label="Total poin" value={formatAngka(totalPoin)} hint="seluruh anggota" />
          <Stat
            label="Rata-rata"
            value={formatAngka(rataRata)}
            hint={`dari ${entries.length} anggota`}
            />
        </div>
      )}

      {entries.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
          <ol className="divide-y divide-border p-2">
            {entries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                highlight={index < 3}
              />
            ))}
          </ol>
        </div>
      ) : (
        !error && (
          <div className="mt-8">
            <EmptyState
              title="Papan peringkat masih kosong"
              description="Poin muncul setelah pengurus memperbarui kolom points di data anggota."
            />
          </div>
        )
      )}
    </Container>
  );
}
