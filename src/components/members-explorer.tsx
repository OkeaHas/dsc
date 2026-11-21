"use client";

import { useMemo, useState } from "react";
import { MemberCard } from "@/components/cards";
import { EmptyState } from "@/components/ui";
import type { Member } from "@/lib/types";

/**
 * Pencarian & daftar anggota.
 *
 * Disaring di sisi klien: daftar anggota sebuah klub itu kecil (puluhan orang),
 * jadi memuat semuanya sekali lalu menyaring di memori jauh lebih responsif
 * daripada memanggil API tiap ketikan — dan tetap jalan di jaringan lambat.
 */
export function MembersExplorer({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(needle) ||
        member.role.toLowerCase().includes(needle),
    );
  }, [members, query]);

  return (
    <div>
      <div className="relative mt-8">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama atau jabatan…"
          aria-label="Cari anggota"
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/25 sm:max-w-md sm:text-sm"
        />
      </div>

      <p className="mt-3 text-xs text-muted" aria-live="polite">
        Menampilkan {filtered.length} dari {members.length} anggota
      </p>

      {filtered.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="Tidak ada anggota yang cocok"
            description={`Tidak ditemukan anggota dengan kata kunci "${query}". Coba kata lain.`}
          />
        </div>
      )}
    </div>
  );
}
