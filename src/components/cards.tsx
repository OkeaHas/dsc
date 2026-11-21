import Image from "next/image";
import Link from "next/link";
import { Avatar, Badge, Card } from "@/components/ui";
import {
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconNews,
  IconPin,
  IconTrophy,
} from "@/components/icons";
import type { Event, LeaderboardEntry, Member, News } from "@/lib/types";
import {
  formatAngka,
  formatRelatif,
  formatTanggalJam,
  formatTanggalPendek,
  labelStatusEvent,
  potongTeks,
} from "@/utils/format";

/* ─── Kegiatan ─────────────────────────────────────────────────────────────── */

function statusTone(eventDate: string, isActive: boolean) {
  if (!isActive) return "neutral" as const;
  const sisa = new Date(eventDate).getTime() - Date.now();
  if (sisa < 0) return "neutral" as const;
  if (sisa < 3 * 86_400_000) return "accent" as const;
  return "brand" as const;
}

export function EventCard({ event }: { event: Event }) {
  return (
    <Card as="article" className="overflow-hidden">
      <Link href={`/events/${event.id}`} className="block group">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted">
              <IconCalendar className="size-10" />
            </div>
          )}
          <span className="absolute left-3 top-3">
            <Badge tone={statusTone(event.event_date, event.is_active)}>
              {labelStatusEvent(event.event_date, event.is_active)}
            </Badge>
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-brand sm:text-lg">
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {potongTeks(event.description, 160)}
            </p>
          )}

          <dl className="mt-3 flex flex-col gap-1.5 text-xs text-muted">
            <div className="flex items-center gap-2">
              <IconClock className="size-4 shrink-0" />
              <dd>{formatTanggalJam(event.event_date)}</dd>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <IconPin className="size-4 shrink-0" />
                <dd className="truncate">{event.location}</dd>
              </div>
            )}
          </dl>
        </div>
      </Link>
    </Card>
  );
}

/* ─── Berita ───────────────────────────────────────────────────────────────── */

export function NewsCard({ news }: { news: News }) {
  return (
    <Card as="article" className="overflow-hidden">
      <Link href={`/news/${news.slug}`} className="block group">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
          {news.cover_image_url ? (
            <Image
              src={news.cover_image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted">
              <IconNews className="size-10" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs text-muted">
            {formatTanggalPendek(news.created_at)} • {formatRelatif(news.created_at)}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug group-hover:text-brand sm:text-lg">
            {news.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {potongTeks(news.content, 180)}
          </p>
        </div>
      </Link>
    </Card>
  );
}

/* ─── Anggota ──────────────────────────────────────────────────────────────── */

export function MemberCard({ member }: { member: Member }) {
  const links = Object.entries(member.social_links ?? {}).filter(
    ([, value]) => typeof value === "string" && value,
  );

  return (
    <Card as="article" className="p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <Avatar name={member.name} photoUrl={member.photo_url} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold leading-tight">{member.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">{member.role}</p>
          {member.points > 0 && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
              <IconTrophy className="size-3.5" />
              {formatAngka(member.points)} poin
            </p>
          )}
        </div>
      </div>

      {links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {links.slice(0, 4).map(([key, value]) => (
            <li key={key}>
              <a
                href={normalizeLink(value as string)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-8 items-center rounded-lg bg-surface-2 px-2.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
              >
                {key}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** `@nama` dianggap username Instagram; tanpa skema dianggap domain. */
function normalizeLink(value: string): string {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith("@")) return `https://instagram.com/${text.slice(1)}`;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(text)) return `https://${text}`;
  return `https://instagram.com/${text}`;
}

/* ─── Leaderboard ──────────────────────────────────────────────────────────── */

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardRow({ entry, highlight = false }: { entry: LeaderboardEntry; highlight?: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 sm:gap-4 sm:px-4 ${
        highlight ? "bg-brand-soft" : "hover:bg-surface-2"
      }`}
    >
      <span className="w-7 shrink-0 text-center text-sm font-bold text-muted">
        {MEDALS[entry.rank - 1] ?? entry.rank}
      </span>
      <Avatar name={entry.name} photoUrl={entry.photo_url} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{entry.name}</span>
        <span className="block truncate text-xs text-muted">{entry.role}</span>
      </span>
      <span className="shrink-0 text-sm font-bold tabular-nums">
        {formatAngka(entry.points)}
      </span>
    </li>
  );
}

export function SeeAllLink({ href, label = "Lihat semua" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-2"
    >
      {label}
      <IconArrowRight className="size-4" />
    </Link>
  );
}
