import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { inisial } from "@/utils/format";

/**
 * Kumpulan komponen tampilan dasar.
 *
 * Semua di sini adalah server component murni (tanpa state) supaya bisa dipakai
 * di mana saja — di halaman, di dalam form client, atau di komponen lain.
 * Semua ukuran disentuh dengan pendekatan mobile-first: default = HP, lalu
 * `sm:` (≥640px, HP besar/tablet potret), `md:` (≥768px, tablet), `lg:` (≥1024px).
 */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "accent" | "success" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-2 text-muted",
    brand: "bg-brand-soft text-brand-strong",
    accent: "bg-accent-soft text-accent",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  description,
  href,
  linkLabel = "Lihat semua",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-brand hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/** Kotak kosong yang informatif — bukan cuma "tidak ada data". */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/**
 * Pemberitahuan saat data gagal dimuat.
 *
 * Penting saat `.env` belum diisi: halaman tetap tampil rapi dengan pesan yang
 * menjelaskan, bukan layar error bawaan Next.js.
 */
export function DataNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-4 sm:px-6">
      <p className="text-sm font-semibold text-danger">Data belum bisa dimuat</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{message}</p>
      <p className="mt-2 text-xs text-muted">
        Periksa file <code className="font-mono">.env</code> (lihat{" "}
        <code className="font-mono">.env.example</code>) dan pastikan skema di{" "}
        <code className="font-mono">src/lib/schema.sql</code> sudah dijalankan.
      </p>
    </div>
  );
}

export function Avatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-9 text-xs",
    md: "size-14 text-sm",
    lg: "size-20 text-lg",
  } as const;

  // Ukuran piksel asli untuk next/image — harus cocok dengan kelas di `sizes`.
  const pixels = { sm: 36, md: 56, lg: 80 } as const;

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={`Foto ${name}`}
        width={pixels[size]}
        height={pixels[size]}
        className={`${sizes[size]} shrink-0 rounded-full border border-border object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full border border-border bg-brand-soft font-bold text-brand-strong`}
    >
      {inisial(name) || "?"}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />;
}
