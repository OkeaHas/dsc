"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

/**
 * Batas kesalahan halaman.
 *
 * `error.tsx` WAJIB client component. Pesan aslinya hanya ditampilkan di mode
 * development supaya detail internal tidak bocor di production.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DSC] Render error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <Container className="flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-danger">
        Terjadi kesalahan
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
        Halaman ini gagal dimuat
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Ada yang gagal saat memuat halaman ini. Coba muat ulang dulu — sering kali
        sekali klik sudah cukup. Kalau tetap gagal, catat kode di bawah dan kirim
        ke pengurus: kode itu mempertemukan pesan ini dengan catatan di terminal
        server.
      </p>

      {error.digest ? (
        <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-muted">
          kode: {error.digest}
        </p>
      ) : null}

      {isDev && (
        <pre className="mt-5 max-w-full overflow-x-auto rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-xs">
          {error.message}
        </pre>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-background transition-opacity hover:opacity-90"
      >
        Coba lagi
      </button>
    </Container>
  );
}
