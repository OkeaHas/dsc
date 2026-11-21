import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AttendanceForm } from "@/components/forms/attendance-form";
import { IconAlert, IconCalendar, IconClock, IconPin } from "@/components/icons";
import { Badge, Card, Container, DataNotice } from "@/components/ui";
import { getEventById } from "@/server/events";
import Image from "next/image";
import { formatTanggalJam, formatTanggalPanjang, labelStatusEvent, sudahLewat } from "@/utils/format";
import { isUuid } from "@/utils/validate";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Kegiatan tidak ditemukan" };

  const { data } = await getEventById(id);
  if (!data) return { title: "Kegiatan tidak ditemukan" };

  return {
    title: data.title,
    description: data.description ?? `Detail kegiatan ${data.title}.`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Id bukan UUID = tidak mungkin ada di database. Jangan buang satu query
  // ke Postgres hanya untuk mendapat pesan error tipe.
  if (!isUuid(id)) notFound();

  const { data: event, error } = await getEventById(id);

  if (error && /tidak ditemukan/i.test(error.message)) notFound();
  if (error || !event) {
    return (
      <Container className="py-10">
        <DataNotice message={error?.message ?? "Kegiatan tidak bisa dimuat."} />
      </Container>
    );
  }

  const eventSudahLewat = sudahLewat(event.event_date);
  const bisaAbsen = event.is_active && !eventSudahLewat;
  const status = labelStatusEvent(event.event_date, event.is_active);

  return (
    <Container className="py-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/events" className="hover:text-foreground">
          Kegiatan
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{event.title}</span>
      </nav>

      {event.image_url && (
        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-2 sm:aspect-[21/9]">
          <Image
            src={event.image_url}
            alt={`Banner kegiatan ${event.title}`}
            fill
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <Badge tone={bisaAbsen ? "brand" : "neutral"}>{status}</Badge>

          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            {event.title}
          </h1>

          <dl className="mt-5 grid gap-3 border-y border-border py-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <IconCalendar className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Tanggal
                </dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatTanggalPanjang(event.event_date)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconClock className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Waktu
                </dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatTanggalJam(event.event_date).split("• ")[1] ?? "-"}
                </dd>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <IconPin className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Lokasi
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">{event.location}</dd>
                </div>
              </div>
            )}
          </dl>

          {event.description ? (
            <div className="dsc-prose mt-6 text-sm text-foreground/90 sm:text-base">
              {event.description
                .split(/\n{2,}/)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Deskripsi kegiatan ini belum diisi pengurus.
            </p>
          )}
        </div>

        {/* Panel absen — sticky di desktop supaya tetap terlihat saat membaca */}
        <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold sm:text-lg">
            {bisaAbsen ? "Daftar kehadiran" : "Pendaftaran ditutup"}
          </h2>

          {bisaAbsen ? (
            <>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Isi datamu di bawah ini untuk mencatat kehadiran.
              </p>
              <div className="mt-5">
                <AttendanceForm eventId={event.id} eventTitle={event.title} />
              </div>
            </>
          ) : (
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted">
              <IconAlert className="mt-0.5 size-4 shrink-0" />
              {eventSudahLewat
                ? "Kegiatan ini sudah selesai, jadi absen sudah tidak dibuka lagi."
                : "Pengurus sudah menutup pendaftaran untuk kegiatan ini."}
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
