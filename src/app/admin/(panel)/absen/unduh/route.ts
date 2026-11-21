import { NextResponse, type NextRequest } from "next/server";
import { getAllAttendance } from "@/server/attendance";
import { getAllEvents } from "@/server/events";
import { sesiAktif } from "@/lib/admin-auth";

/**
 * Unduh rekap absen sebagai CSV.
 *
 * Route handler, bukan server action, karena hasilnya berkas — bukan halaman.
 * Dua hal yang mudah salah dan sengaja ditangani di sini:
 *  - Dipisah titik koma (;) dan diawali BOM, supaya Excel ber-locale Indonesia
 *    langsung memecahnya jadi kolom alih-alih menumpuk di satu sel.
 *  - Nilai yang mengandung titik koma/kutip dibungkus tanda kutip ganda.
 */

export async function GET(request: NextRequest) {
  if (!(await sesiAktif())) {
    return new NextResponse("Tidak punya akses.", { status: 401 });
  }

  const eventId = request.nextUrl.searchParams.get("event");

  const [absen, kegiatan] = await Promise.all([getAllAttendance(500), getAllEvents(200)]);
  const judul = new Map((kegiatan.data ?? []).map((k) => [k.id, k.title]));

  const baris = (absen.data ?? []).filter((a) => (eventId ? a.event_id === eventId : true));

  const kolom = ["Nama", "Email", "Institusi", "Kegiatan", "Waktu Absen"];
  const isi = baris.map((a) => [
    a.participant_name,
    a.participant_email,
    a.institution ?? "",
    judul.get(a.event_id) ?? "",
    new Date(a.created_at).toISOString(),
  ]);

  const csv = [kolom, ...isi].map((barisKolom) => barisKolom.map(sel).join(";")).join("\r\n");

  const namaFile = eventId
    ? `absen-${(judul.get(eventId) ?? "kegiatan").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`
    : "absen-semua-kegiatan.csv";

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${namaFile}"`,
      "cache-control": "no-store",
    },
  });
}

/** Bungkus sel kalau isinya bisa mengacaukan pemisah kolom. */
function sel(nilai: string): string {
  const teks = nilai ?? "";
  return /[";\r\n]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
}
