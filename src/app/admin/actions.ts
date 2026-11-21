"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HasilAksi } from "./hasil";
import { batasiPercobaanMasuk, buatSesi, hapusSesi, wajibAdmin } from "@/lib/admin-auth";
import { periksaKataSandi } from "@/lib/admin-session";
import { deleteFeedbackById } from "@/server/feedback";
import {
  createEvent,
  deleteEventById,
  parseEventInput,
  resolveEventImage,
  updateEventById,
} from "@/server/events";
import {
  createMember,
  deleteMemberById,
  parseMemberFormData,
  updateMemberById,
} from "@/server/members";
import { createNews, deleteNewsBySlug, updateNewsBySlug } from "@/server/news";
import { zonaWaktuWita } from "@/utils/format";
import { parseBoolean, ValidationError } from "@/utils/validate";

/**
 * Semua server action panel admin.
 *
 * Prinsipnya: satu pintu per entitas. Form "tambah" dan "ubah" memanggil action
 * yang sama, dibedakan oleh field tersembunyi `id` (anggota/kegiatan) atau
 * `slug` (berita). Dengan begitu aturan validasi tidak bisa berbeda diam-diam
 * antara dua form.
 *
 * Setiap action dimulai dengan `wajibAdmin()`. Proxy juga menjaga permintaan GET
 * ke /admin/*, tapi pagar di dalam action inilah yang sebenarnya menentukan:
 * tanpa sesi yang sah, tidak ada satu pun penulisan yang jalan.
 *
 * ⚠️  Berkas ini hanya boleh mengekspor FUNGSI ASYNC. Interface/tipe boleh
 * (dihapus saat kompilasi), tapi konstanta apa pun — termasuk nilai awal
 * `useActionState` — harus tinggal di `./hasil.ts`. Kalau tidak, Next menolak
 * seluruh modul dengan "A use server file can only export async functions".
 */

function pesanKesalahan(err: unknown, cadangan: string): string {
  if (err instanceof ValidationError) return err.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return cadangan;
}

/**
 * Segarkan halaman admin yang terpengaruh plus beranda.
 *
 * Halaman publik memakai `dynamic = "force-dynamic"`, jadi ini bukan penopang
 * utama — tapi tetap dipanggil supaya daftar admin yang sedang dibuka langsung
 * mencerminkan perubahan tanpa perlu reload manual.
 */
function segarkan(jalur: string[] = []): void {
  revalidatePath("/admin");
  for (const p of jalur) revalidatePath(p);
  revalidatePath("/");
}

function keTeks(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Nama field tautan sosial di form admin. */
const TAUTAN = ["instagram", "linkedin", "github", "website"] as const;

/**
 * Form admin memakai satu input per tautan sosial (lebih ramah panitia
 * daripada menempel JSON mentah). Di sini keempatnya dikumpulkan kembali
 * menjadi satu nilai `social_links` — bentuk yang dimengerti
 * `parseMemberFormData` dan kolom JSONB di database.
 */
function denganTautanSosial(formData: FormData): FormData {
  const tautan: Record<string, string> = {};

  for (const nama of TAUTAN) {
    const nilai = keTeks(formData.get(`sosial_${nama}`));
    if (nilai) tautan[nama] = nilai;
  }

  const salinan = new FormData();
  for (const [key, value] of formData.entries()) salinan.set(key, value);
  salinan.set("social_links", JSON.stringify(tautan));

  return salinan;
}

/** Tanggal dari form admin — selalu dianggap waktu WITA, bukan waktu server. */
function tanggalKegiatan(value: FormDataEntryValue | null): string {
  return zonaWaktuWita(keTeks(value));
}

// ─── Masuk & keluar ─────────────────────────────────────────────────────────

export async function masukAction(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  const tunggu = await batasiPercobaanMasuk();
  if (tunggu !== null) {
    return {
      ok: false,
      pesan: `Terlalu banyak percobaan masuk. Coba lagi dalam ${tunggu} detik.`,
    };
  }

  const sandi = String(formData.get("password") ?? "");
  if (!sandi) return { ok: false, pesan: "Kata sandi wajib diisi." };

  if (!(await periksaKataSandi(sandi))) {
    return { ok: false, pesan: "Kata sandi salah." };
  }

  await buatSesi();

  const dari = keTeks(formData.get("dari"));
  redirect(dari.startsWith("/admin") ? dari : "/admin");
}

export async function keluarAction(): Promise<void> {
  await hapusSesi();
  redirect("/admin/masuk");
}

// ─── Anggota ────────────────────────────────────────────────────────────────

export async function simpanAnggota(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  let gagal: string | null = null;

  try {
    const { payload, photoFile, removePhoto } = parseMemberFormData(denganTautanSosial(formData));

    const hasil = id
      ? await updateMemberById(id, payload, photoFile, removePhoto)
      : await createMember(payload, photoFile);

    if (hasil.error) gagal = hasil.error.message;
  } catch (err) {
    gagal = pesanKesalahan(err, "Gagal menyimpan data anggota.");
  }

  if (gagal) return { ok: false, pesan: gagal };

  segarkan(["/admin/anggota", "/admin/leaderboard"]);
  if (!id) redirect("/admin/anggota");

  return { ok: true, pesan: "Perubahan anggota tersimpan." };
}

export async function hapusAnggota(formData: FormData): Promise<void> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  if (id) {
    const { error } = await deleteMemberById(id);
    if (error) {
      redirect(`/admin/anggota?galat=${encodeURIComponent(error.message)}`);
    }
  }

  segarkan(["/admin/anggota", "/admin/leaderboard"]);
  redirect("/admin/anggota");
}

// ─── Berita ─────────────────────────────────────────────────────────────────

export async function simpanBerita(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  await wajibAdmin();

  const slug = keTeks(formData.get("slug"));
  let gagal: string | null = null;
  let slugBaru: string | null = null;

  try {
    const judul = keTeks(formData.get("title"));
    const isi = keTeks(formData.get("content"));
    const sampulMentah = formData.get("cover");
    const sampulBaru = sampulMentah instanceof File && sampulMentah.size > 0 ? sampulMentah : null;
    const hapusSampul = keTeks(formData.get("remove_cover")) === "true";

    if (slug) {
      const hasil = await updateNewsBySlug(slug, {
        title: judul,
        content: isi,
        coverFile: sampulBaru,
        cover_image_url: hapusSampul ? null : undefined,
      });
      if (hasil.error) gagal = hasil.error.message;
      else slugBaru = hasil.data?.slug ?? slug;
    } else {
      const hasil = await createNews({ title: judul, content: isi, coverFile: sampulBaru });
      if (hasil.error) gagal = hasil.error.message;
      else slugBaru = hasil.data?.slug ?? null;
    }
  } catch (err) {
    gagal = pesanKesalahan(err, "Gagal menyimpan berita.");
  }

  if (gagal) return { ok: false, pesan: gagal };

  segarkan(["/admin/berita", "/news"]);
  if (slugBaru) revalidatePath(`/news/${slugBaru}`);
  if (!slug) redirect("/admin/berita");

  return { ok: true, pesan: "Berita tersimpan." };
}

export async function hapusBerita(formData: FormData): Promise<void> {
  await wajibAdmin();

  const slug = keTeks(formData.get("slug"));
  if (slug) {
    const { error } = await deleteNewsBySlug(slug);
    if (error) {
      redirect(`/admin/berita?galat=${encodeURIComponent(error.message)}`);
    }
  }

  segarkan(["/admin/berita", "/news"]);
  redirect("/admin/berita");
}

// ─── Kegiatan ───────────────────────────────────────────────────────────────

export async function simpanKegiatan(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  let gagal: string | null = null;

  try {
    const payload = parseEventInput({
      title: formData.get("title"),
      description: formData.get("description"),
      event_date: tanggalKegiatan(formData.get("event_date")),
      location: formData.get("location"),
      // Checkbox yang tidak dicentang tidak terkirim sama sekali, jadi
      // bawaannya harus "mati", bukan "hidup".
      is_active: parseBoolean(formData.get("is_active"), false) ? "true" : "false",
    });

    const gambarMentah = formData.get("image");
    const gambarBaru = gambarMentah instanceof File && gambarMentah.size > 0 ? gambarMentah : null;
    const hapusGambar = keTeks(formData.get("remove_image")) === "true";

    if (id) {
      const gambar = gambarBaru ? await resolveEventImage(gambarBaru, null) : null;
      const hasil = await updateEventById(id, payload, gambar, hapusGambar);
      if (hasil.error) gagal = hasil.error.message;
    } else {
      const gambar = await resolveEventImage(gambarBaru, null);
      const hasil = await createEvent(payload, gambar);
      if (hasil.error) gagal = hasil.error.message;
    }
  } catch (err) {
    gagal = pesanKesalahan(err, "Gagal menyimpan kegiatan.");
  }

  if (gagal) return { ok: false, pesan: gagal };

  segarkan(["/admin/kegiatan", "/events"]);
  if (!id) redirect("/admin/kegiatan");

  return { ok: true, pesan: "Kegiatan tersimpan." };
}

export async function hapusKegiatan(formData: FormData): Promise<void> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  if (id) {
    const { error } = await deleteEventById(id);
    if (error) {
      redirect(`/admin/kegiatan?galat=${encodeURIComponent(error.message)}`);
    }
  }

  segarkan(["/admin/kegiatan", "/events"]);
  redirect("/admin/kegiatan");
}

/** Buka/tutup pendaftaran absen sebuah kegiatan dari daftar. */
export async function ubahStatusKegiatan(formData: FormData): Promise<void> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  const aktif = keTeks(formData.get("is_active")) === "true";

  if (id) {
    const { error } = await updateEventById(id, { is_active: aktif }, null, false);
    if (error) {
      redirect(`/admin/kegiatan?galat=${encodeURIComponent(error.message)}`);
    }
  }

  segarkan(["/admin/kegiatan", "/events"]);
  redirect("/admin/kegiatan");
}

// ─── Feedback ───────────────────────────────────────────────────────────────

export async function hapusFeedback(formData: FormData): Promise<void> {
  await wajibAdmin();

  const id = keTeks(formData.get("id"));
  if (id) {
    const { error } = await deleteFeedbackById(id);
    if (error) {
      redirect(`/admin/feedback?galat=${encodeURIComponent(error.message)}`);
    }
  }

  segarkan(["/admin/feedback"]);
  redirect("/admin/feedback");
}
