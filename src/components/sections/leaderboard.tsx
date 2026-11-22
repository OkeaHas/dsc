import Link from "next/link";
import { IconTrophy } from "@/components/icons";
import { Muncul } from "@/components/muncul";
import { JudulSection, Wadah } from "@/components/sections/decor";
import { Avatar, EmptyState } from "@/components/ui";
import { LEADERBOARD } from "@/lib/site-content";
import type { LeaderboardEntry } from "@/lib/types";
import { formatAngka } from "@/utils/format";

/**
 * Section "Leaderboard".
 *
 * Dua panel: grafik batang (tiga teratas, tinggi batang proporsional dengan
 * poin) dan daftar lengkap dengan medali. Merah-oranye dipakai sebagai gradien
 * batang supaya nyambung dengan palet.
 *
 * Perhitungan tinggi batang dilakukan di sini, bukan lewat kelas Tailwind
 * dinamis — Tailwind tidak bisa membuat kelas dari angka runtime.
 */
export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const teratas = entries.slice(0, 3);
  const maks = teratas.length > 0 ? Math.max(...teratas.map((e) => e.points)) : 1;

  return (
    <section id="leaderboard" className="dsc-anchor">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <JudulSection eyebrow={LEADERBOARD.eyebrow} judul={LEADERBOARD.judul} />
        <p className="mt-2 text-base font-bold text-accent-strong sm:text-lg">
          {LEADERBOARD.subjudul}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {LEADERBOARD.deskripsi}
        </p>

        {entries.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Papan peringkat masih kosong"
              description="Poin akan muncul setelah anggota tercatat di kegiatan atau menerima poin dari pengurus."
            />
          </div>
        ) : (
          <Muncul delay={140}>
            <div className="mt-9 grid gap-5 sm:mt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
            {/* Panel grafik batang */}
            <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <IconTrophy className="size-4 text-accent" />
                Tiga teratas
              </p>

              <div className="mt-6 flex h-56 items-end justify-around gap-2 sm:h-64 sm:gap-4">
                {teratas.map((entry, index) => {
                  // Batang terendah tetap 28% tinggi supaya tetap kelihatan.
                  const persen = 28 + 72 * (entry.points / maks);
                  return (
                    <div
                      key={entry.id}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <Avatar name={entry.name} photoUrl={entry.photo_url} size="sm" />
                      <p className="mt-1.5 max-w-full truncate text-[11px] font-bold text-foreground">
                        {entry.name}
                      </p>
                      <p className="text-[11px] font-semibold tabular-nums text-muted">
                        {formatAngka(entry.points)}
                      </p>

                      <div
                        className="mt-2 w-full max-w-16 rounded-t-xl bg-linear-to-t from-brand to-accent"
                        style={{ height: `${persen}%` }}
                        aria-hidden
                      />

                      <span className="mt-1.5 text-[11px] font-bold text-brand">
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel daftar peringkat */}
            <div className="rounded-3xl border border-border bg-surface p-2 sm:p-3">
              <ol className="divide-y divide-border">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 px-2 py-2.5 sm:gap-4 sm:px-3"
                  >
                    <span
                      className={`w-8 shrink-0 text-center text-sm font-extrabold tabular-nums ${
                        entry.rank <= 3 ? "text-accent-strong" : "text-muted"
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <Avatar name={entry.name} photoUrl={entry.photo_url} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {entry.name}
                      </span>
                      <span className="block truncate text-xs text-muted">{entry.role}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-black tabular-nums text-accent-strong">
                      {formatAngka(entry.points)}
                    </span>
                  </li>
                ))}
              </ol>

              <Link
                href="/leaderboard"
                className="dsc-tap mt-2 flex items-center justify-center rounded-2xl text-sm font-bold text-brand hover:bg-brand-soft"
              >
                Lihat papan lengkap
              </Link>
            </div>
          </div>
          </Muncul>
        )}
      </Wadah>
    </section>
  );
}