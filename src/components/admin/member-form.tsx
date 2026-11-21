"use client";

import Image from "next/image";
import { useActionState } from "react";
import { simpanAnggota } from "@/app/admin/actions";
import { HASIL_AWAL } from "@/app/admin/hasil";
import { Catatan, Field, kolomKelas, PesanAksi, TombolKirim } from "@/components/admin/kontrol";
import type { Member } from "@/lib/types";

/**
 * Form anggota — dipakai untuk menambah maupun mengubah.
 *
 * Pembedaannya cuma satu: field tersembunyi `id`. Kalau kosong, action-nya
 * menambah baris baru lalu kembali ke daftar; kalau terisi, mengubah baris itu
 * dan tetap di halaman yang sama supaya enak mengubah beberapa hal berturut-turut.
 */
export function AnggotaForm({ awal }: { awal?: Member }) {
  const [hasil, kirim] = useActionState(simpanAnggota, HASIL_AWAL);
  const tautan = awal?.social_links ?? {};

  return (
    <form action={kirim} className="space-y-6">
      <input type="hidden" name="id" value={awal?.id ?? ""} />
      {hasil.pesan ? <PesanAksi hasil={hasil} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            maxLength={255}
            defaultValue={awal?.name ?? ""}
            placeholder="Rengga X"
            className={kolomKelas}
          />
        </Field>

        <Field label="Jabatan" htmlFor="role" hint="Contoh: Ketua Umum, Divisi Web">
          <input
            id="role"
            name="role"
            required
            maxLength={255}
            defaultValue={awal?.role ?? ""}
            className={kolomKelas}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Poin kontribusi"
          htmlFor="points"
          hint="Angka ini yang menentukan urutan di papan peringkat beranda."
        >
          <input
            id="points"
            name="points"
            type="number"
            min={0}
            step={1}
            defaultValue={awal?.points ?? 0}
            className={kolomKelas}
          />
        </Field>

        <Field label="Foto" htmlFor="photo_url" hint="JPG, PNG, WebP, atau AVIF — maksimal 2 MB.">
          <div className="flex items-center gap-4">
            {awal?.photo_url ? (
              <Image
                src={awal.photo_url}
                alt={awal.name}
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-xl object-cover"
              />
            ) : null}
            <input
              id="photo_url"
              name="photo_url"
              type="file"
              accept="image/*"
              className="min-w-0 flex-1 text-xs text-muted file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-brand file:px-4 file:text-xs file:font-bold file:text-white"
            />
          </div>
        </Field>
      </div>

      {awal?.photo_url ? (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remove_photo" value="true" className="size-4 accent-[var(--danger)]" />
          Hapus foto yang sekarang (tanpa menggantinya)
        </label>
      ) : null}

      <fieldset className="space-y-4 rounded-2xl border border-border bg-surface-2/40 p-4">
        <legend className="px-2 text-xs font-bold uppercase tracking-wider text-muted">
          Tautan sosial
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="sosial_instagram" hint="@username atau URL lengkap">
            <input
              id="sosial_instagram"
              name="sosial_instagram"
              defaultValue={tautan.instagram ?? ""}
              className={kolomKelas}
            />
          </Field>

          <Field label="LinkedIn" htmlFor="sosial_linkedin">
            <input
              id="sosial_linkedin"
              name="sosial_linkedin"
              defaultValue={tautan.linkedin ?? ""}
              className={kolomKelas}
            />
          </Field>

          <Field label="GitHub" htmlFor="sosial_github">
            <input
              id="sosial_github"
              name="sosial_github"
              defaultValue={tautan.github ?? ""}
              className={kolomKelas}
            />
          </Field>

          <Field label="Situs pribadi" htmlFor="sosial_website">
            <input
              id="sosial_website"
              name="sosial_website"
              defaultValue={tautan.website ?? ""}
              className={kolomKelas}
            />
          </Field>
        </div>

        <Catatan>Kosongkan yang tidak dipakai. Tautan kosong tidak ikut tersimpan.</Catatan>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <TombolKirim>{awal ? "Simpan perubahan" : "Tambah anggota"}</TombolKirim>
        <Catatan>
          {awal ? `Sedang mengubah: ${awal.name}` : "Anggota baru langsung muncul di beranda."}
        </Catatan>
      </div>
    </form>
  );
}
