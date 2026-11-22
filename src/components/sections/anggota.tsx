import Image from "next/image";
import { Muncul } from "@/components/muncul";
import { JudulSection, Wadah } from "@/components/sections/decor";
import { EmptyState } from "@/components/ui";
import { ANGGOTA } from "@/lib/site-content";
import type { Member } from "@/lib/types";
import { inisial } from "@/utils/format";

/**
 * Section "Anggota" — kartu ala polaroid, sedikit miring bergantian seperti
 * tempelan di papan tulis, mengikuti desain.
 *
 * Kemiringan hanya kosmetik dan mati sendiri saat kursor mendekat, jadi nama
 * anggota tetap terbaca lurus.
 */
export function Anggota({ members }: { members: Member[] }) {
  return (
    <section id="anggota" className="dsc-anchor">
      <Wadah className="py-14 sm:py-16 lg:py-24">
        <JudulSection
          eyebrow={ANGGOTA.eyebrow}
          judul={ANGGOTA.judul}
          deskripsi={ANGGOTA.deskripsi}
        />

        {members.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Belum ada anggota yang ditampilkan"
              description="Data anggota akan muncul di sini setelah ditambahkan lewat API /api/members."
            />
          </div>
        ) : (
          <Muncul delay={140}>
            <ul className="mt-9 grid grid-cols-2 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {members.slice(0, 12).map((member, index) => (
              <li key={member.id} className="min-w-0">
                <KartuPolaroid member={member} index={index} />
              </li>
            ))}
          </ul>
          </Muncul>
        )}
      </Wadah>
    </section>
  );
}

/** Sudut miring bergiliran — [-1.5deg, 0.5deg, 1.5deg, -0.5deg]. */
const SUDUT = ["-rotate-[1.5deg]", "rotate-[0.5deg]", "rotate-[1.5deg]", "-rotate-[0.5deg]"];

function KartuPolaroid({ member, index }: { member: Member; index: number }) {
  const miring = SUDUT[index % SUDUT.length];

  return (
    <figure
      className={`dsc-polaroid h-full rounded-2xl p-2.5 pb-3.5 transition-transform duration-300 hover:rotate-0 hover:scale-[1.02] ${miring}`}
    >
      {/* Titik oranye di kepala kartu — penanda khas kartu polaroid di desain. */}
      <span aria-hidden className="mx-auto mb-2 block size-2 rounded-full bg-accent" />

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-2">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`Foto ${member.name}`}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 45vw"
            className="object-cover"
          />
        ) : (
          /* Tanpa foto: inisial besar di atas gradien oranye lembut. */
          <div className="grid size-full place-items-center bg-linear-to-br from-accent-soft to-peach">
            <span className="font-display text-3xl font-extrabold text-brand/70 sm:text-4xl">
              {inisial(member.name) || "?"}
            </span>
          </div>
        )}
      </div>

      <figcaption className="mt-3 min-w-0 px-1 text-center">
        <p className="truncate text-sm font-bold text-foreground">{member.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{member.role}</p>
      </figcaption>
    </figure>
  );
}