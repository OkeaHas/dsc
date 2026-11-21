"use client";

import Image from "next/image";
import { useActionState } from "react";
import { simpanBerita } from "@/app/admin/actions";
import { HASIL_AWAL } from "@/app/admin/hasil";
import { Catatan, Field, kolomKelas, PesanAksi, TombolKirim } from "@/components/admin/kontrol";
import type { News } from "@/lib/types";

/**
 * Form berita — satu form untuk tulis baru dan sunting.
 *
 * `slug` adalah penanda mana yang sedang diubah (halaman publik berita memakai
 * slug sebagai alamat). Waktu menambah, slug dibuat otomatis dari judul di
 * sisi server — panitia tidak perlu memikirkan ramah-URL.
 */
export function BeritaForm({ awal }: { awal?: News }) {
  const [hasil, kirim] = useActionState(simpanBerita, HASIL_AWAL);

  return (
    <form action={kirim} className="space-y-6">
      <input type="hidden" name="slug" value={awal?.slug ?? ""} />
      {hasil.pesan ? <PesanAksi hasil={hasil} /> : null}

      <Field
        label="Judul berita"
        htmlFor="title"
        hint={awal ? `Alamat halaman: /news/${awal.slug}` : "Alamat halaman dibuat otomatis dari judul."}
      >
        <input
          id="title"
          name="title"
          required
          maxLength={255}
          defaultValue={awal?.title ?? ""}
          className={kolomKelas}
        />
      </Field>

      <Field label="Isi berita" htmlFor="content" hint="Teks biasa. Baris baru dipisah paragraf di halaman publik.">
        <textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={awal?.content ?? ""}
          className={`${kolomKelas} leading-relaxed`}
        />
      </Field>

      <Field label="Gambar sampul" htmlFor="cover" hint="Opsional. JPG, PNG, WebP, atau AVIF — maksimal 2 MB.">
        <div className="flex items-center gap-4">
          {awal?.cover_image_url ? (
            <Image
              src={awal.cover_image_url}
              alt={awal.title}
              width={96}
              height={64}
              className="h-16 w-24 shrink-0 rounded-xl object-cover"
            />
          ) : null}
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className="min-w-0 flex-1 text-xs text-muted file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-brand file:px-4 file:text-xs file:font-bold file:text-white"
          />
        </div>
      </Field>

      {awal?.cover_image_url ? (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remove_cover" value="true" className="size-4 accent-[var(--danger)]" />
          Hapus sampul yang sekarang
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <TombolKirim>{awal ? "Simpan perubahan" : "Terbitkan berita"}</TombolKirim>
        <Catatan>
          {awal
            ? "Perubahan langsung terlihat di halaman berita publik."
            : "Berita terbit seketika — tidak ada status draf."}
        </Catatan>
      </div>
    </form>
  );
}
