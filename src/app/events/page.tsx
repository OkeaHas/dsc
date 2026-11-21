import { EventCard } from "@/components/cards";
import { Badge, Card, Container, DataNotice, EmptyState, PageHeader } from "@/components/ui";
import { getAllEvents } from "@/server/events";
import { formatTanggalJam, labelStatusEvent, potongTeks, sekarangMs } from "@/utils/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kegiatan",
  description:
    "Roadmap dan agenda kegiatan Developer Student Club — workshop, hackathon, sharing session.",
};

export default async function EventsPage() {
  const { data, error } = await getAllEvents(200);
  const events = data ?? [];

  const now = sekarangMs();
  const upcoming = events
    .filter((event) => new Date(event.event_date).getTime() >= now)
    .sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    );
  const past = events.filter((event) => new Date(event.event_date).getTime() < now);

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Roadmap"
        title="Kegiatan"
        description="Semua agenda yang sudah dan akan berjalan. Klik salah satu untuk melihat detail dan mendaftarkan kehadiran."
      />

      {error && (
        <div className="mt-6">
          <DataNotice message={error.message} />
        </div>
      )}

      {/* Agenda mendatang — kartu bergambar */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">
          Akan datang{" "}
          <span className="font-normal text-muted">({upcoming.length})</span>
        </h2>

        {upcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada agenda mendatang"
            description="Kegiatan yang sudah dijadwalkan akan muncul di sini beserta tombol pendaftaran."
          />
        )}
      </section>

      {/* Agenda lampau — daftar ringkas, hemat ruang di HP */}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">
            Sudah berjalan{" "}
            <span className="font-normal text-muted">({past.length})</span>
          </h2>

          <Card className="divide-y divide-border">
            <ul>
              {past.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex flex-col gap-2 p-4 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold sm:text-base">
                        {event.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatTanggalJam(event.event_date)}
                        {event.location ? ` • ${event.location}` : ""}
                      </span>
                      {event.description && (
                        <span className="mt-1 block line-clamp-1 text-xs text-muted">
                          {potongTeks(event.description, 120)}
                        </span>
                      )}
                    </span>
                    <Badge tone="neutral" className="self-start sm:self-center">
                      {labelStatusEvent(event.event_date, event.is_active)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </Container>
  );
}
