/**
 * Kontrol tampilan bersama untuk seluruh halaman admin.
 *
 * Semua halaman admin memakai token warna yang sama dengan situs publik
 * (`bg-surface`, `text-muted`, `border-border`, `bg-brand`) supaya panel ini
 * terasa satu keluarga dengan beranda, bukan tempelan.
 *
 * Berkas ini client component karena beberapa kontrol membutuhkan status
 * pengiriman form (`useFormStatus`) — halaman server tetap boleh mengimpornya.
 */

"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { HasilAksi } from "@/app/admin/hasil";
import { IconAlert, IconCheck } from "@/components/icons";

/** Kelas dasar untuk semua input teks admin. */
export const kolomKelas =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

export const labelKelas = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted";

/** Bungkus satu baris isian: label + kontrol + petunjuk kecil. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className={labelKelas} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** Tombol kirim yang menonaktifkan diri saat form sedang dikirim. */
export function TombolKirim({
  children,
  className = "",
  menunggu = "Menyimpan...",
}: {
  children: ReactNode;
  className?: string;
  menunggu?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`dsc-btn-primary dsc-tap inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold disabled:opacity-60 ${className}`}
    >
      {pending ? menunggu : children}
    </button>
  );
}

/** Kotak pesan hasil server action: hijau kalau berhasil, merah kalau gagal. */
export function PesanAksi({ hasil }: { hasil: HasilAksi | null }) {
  if (!hasil || !hasil.pesan) return null;

  const berhasil = hasil.ok;
  const Icon = berhasil ? IconCheck : IconAlert;

  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        berhasil
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{hasil.pesan}</span>
    </p>
  );
}

/** Catatan abu-abu untuk hal-hal yang perlu dijelaskan ke panitia. */
export function Catatan({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted">{children}</p>;
}
