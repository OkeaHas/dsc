/**
 * Tombol hapus dengan konfirmasi.
 *
 * Dipakai di dalam `<form action={hapusSesuatu}>` yang membawa id tersembunyi.
 * Konfirmasinya memakai `confirm()` bawaan browser: satu-satunya cara memastikan
 * panitia tidak menghapus anggota/berita karena salah klik, tanpa menambah
 * state dialog yang bisa lupa direset.
 */

"use client";

import { useFormStatus } from "react-dom";
import { IconClose } from "@/components/icons";

export function TombolHapus({
  nama,
  label = "Hapus",
  pesanKonfirmasi,
}: {
  /** Nama barang yang dihapus, dipakai di pesan konfirmasi. */
  nama: string;
  label?: string;
  pesanKonfirmasi?: string;
}) {
  const { pending } = useFormStatus();

  const pesan =
    pesanKonfirmasi ?? `Hapus "${nama}"? Tindakan ini tidak bisa dibatalkan.`;

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(pesan)) event.preventDefault();
      }}
      className="dsc-tap inline-flex min-h-10 items-center gap-1.5 rounded-full border border-danger/30 px-3 text-xs font-bold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
    >
      <IconClose className="size-3.5" />
      {pending ? "Menghapus..." : label}
    </button>
  );
}
