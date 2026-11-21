"use client";

import { useActionState } from "react";
import { masukAction } from "@/app/admin/actions";
import { HASIL_AWAL } from "@/app/admin/hasil";
import { Field, kolomKelas, PesanAksi, TombolKirim } from "@/components/admin/kontrol";

/**
 * Form masuk panel admin.
 *
 * Satu kotak kata sandi saja — tanpa username, tanpa lupa sandi. Kalau sandinya
 * hilang, yang perlu dilakukan panitia adalah mengganti `ADMIN_PASSWORD` di
 * `.env` lalu deploy ulang. Sederhana dan tidak bisa disalahgunakan.
 */
export function MasukForm({ dari }: { dari?: string }) {
  const [hasil, kirim] = useActionState(masukAction, HASIL_AWAL);

  return (
    <form action={kirim} className="space-y-5">
      <input type="hidden" name="dari" value={dari ?? ""} />
      {hasil.pesan ? <PesanAksi hasil={hasil} /> : null}

      <Field label="Kata sandi admin" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={kolomKelas}
        />
      </Field>

      <TombolKirim className="w-full" menunggu="Memeriksa...">
        Masuk
      </TombolKirim>
    </form>
  );
}
