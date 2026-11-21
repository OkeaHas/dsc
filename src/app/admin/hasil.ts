/**
 * Bentuk hasil server action panel admin.
 *
 * Sengaja dipisah dari `actions.ts`: berkas ber-`"use server"` hanya boleh
 * mengekspor fungsi async — mengekspor objek/konstanta dari sana membuat Next
 * menolak seluruh modul dengan pesan "A use server file can only export async
 * functions, found object". Nilai dan tipenya tinggal di sini, action-nya di
 * sana, dan keduanya memakai definisi yang sama.
 */

export interface HasilAksi {
  ok: boolean;
  pesan: string;
}

/** Nilai awal `useActionState` — belum ada pesan apa pun. */
export const HASIL_AWAL: HasilAksi = { ok: true, pesan: "" };
