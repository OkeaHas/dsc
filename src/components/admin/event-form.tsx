"use client";

import Image from "next/image";
import { useActionState } from "react";
import { simpanKegiatan } from "@/app/admin/actions";
import { HASIL_AWAL } from "@/app/admin/hasil";
import { Catatan, Field, kolomKelas, PesanAksi, TombolKirim } from "@/components/admin/kontrol";
import type { Event } from "@/lib/types";
import { keInputDatetime } from "@/utils/format";

/**
 * Form kegiatan (agenda + galeri).
 *
 * Gambar kegiatan dipakai dua tempat sekaligus: kartu agenda di halaman
 * kegiatan, dan dinding galeri di beranda. Jadi satu unggahan, dua manfaat.
 */
export function KegiatanForm({ awal }: { awal?: Event }) {
  const [hasil, kirim] = useActionState(simpanKegiatan, HASIL_AWAL);

  return (
    <form action={kirim} className="space-y-6">
      <input type="hidden" name="id" value={awal?.id ?? ""} />
      {hasil.pesan ? <PesanAksi hasil={hasil} /> : null}

      <Field label="Nama kegiatan" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          maxLength={255}
          defaultValue={awal?.title ?? ""}
          placeholder="Study Jam: Dasar React"
          className={kolomKelas}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tanggal & jam" htmlFor="event_date" hint="Waktu WITA (UTC+8).">
          <input
            id="event_date"
            name="event_date"
            type="datetime-local"
            required
            defaultValue={awal ? keInputDatetime(awal.event_date) : ""}
            className={kolomKelas}
          />
        </Field>

        <Field label="Lokasi" htmlFor="location">
          <input
            id="location"
            name="location"
            maxLength={255}
            defaultValue={awal?.location ?? ""}
            placeholder="Lab Komputer 2"
            className={kolomKelas}
          />
        </Field>
      </div>

      <Field label="Deskripsi" htmlFor="description" hint="Maksimal 5.000 karakter.">
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={awal?.description ?? ""}
          className={`${kolomKelas} leading-relaxed`}
        />
      </Field>

      <Field
        label="Gambar kegiatan"
        htmlFor="image"
        hint="Dipakai di kartu agenda sekaligus dinding galeri beranda."
      >
        <div className="flex items-center gap-4">
          {awal?.image_url ? (
            <Image
              src={awal.image_url}
              alt={awal.title}
              width={96}
              height={64}
              className="h-16 w-24 shrink-0 rounded-xl object-cover"
            />
          ) : null}
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="min-w-0 flex-1 text-xs text-muted file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-brand file:px-4 file:text-xs file:font-bold file:text-white"
          />
        </div>
      </Field>

      {awal?.image_url ? (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remove_image" value="true" className="size-4 accent-[var(--danger)]" />
          Hapus gambar yang sekarang
        </label>
      ) : null}

      <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2/40 p-4">
        <input
          type="checkbox"
          name="is_active"
          value="true"
          defaultChecked={awal?.is_active ?? true}
          className="mt-0.5 size-4 accent-[var(--brand)]"
        />
        <span className="text-sm">
          <span className="font-bold text-foreground">Pendaftaran dibuka</span>
          <span className="block text-xs text-muted">
            Kalau dimatikan, tombol absen di halaman kegiatan ditutup — tapi jadwalnya tetap
            tampil sebagai riwayat.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <TombolKirim>{awal ? "Simpan perubahan" : "Tambah kegiatan"}</TombolKirim>
        <Catatan>{awal ? `Sedang mengubah: ${awal.title}` : "Kegiatan baru langsung tampil di beranda."}</Catatan>
      </div>
    </form>
  );
}
