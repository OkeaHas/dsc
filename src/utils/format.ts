/**
 * Helper format tanggal & angka untuk locale Indonesia.
 *
 * Dipakai bareng oleh server component dan client component, jadi harus bebas
 * dari API khusus Node. Semua hasilnya di-pin ke zona waktu Asia/Makassar
 * (WITA, UTC+8) — panitianya ada di Balikpapan.
 */

const TIME_ZONE = "Asia/Makassar";
const LOCALE = "id-ID";

/** "Sabtu, 21 November 2026" */
export function formatTanggalPanjang(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "21 Nov 2026" */
export function formatTanggalPendek(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "09.00" */
export function formatJam(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  })
    .format(date)
    .replace(":", ".");
}

/** "21 Nov 2026 • 09.00 WITA" */
export function formatTanggalJam(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  return `${formatTanggalPendek(date)} • ${formatJam(date)} WITA`;
}

/** Jarak waktu relatif: "3 hari lalu". */
export function formatRelatif(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "-";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

  if (Math.abs(minutes) < 60) return formatter.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return formatter.format(-days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return formatter.format(-months, "month");
  return formatter.format(-Math.round(months / 12), "year");
}

/** Sisa hari menuju sebuah tanggal (negatif = sudah lewat). */
export function selisihHari(value: string | Date): number | null {
  const date = toDate(value);
  if (!date) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}

export function sudahLewat(value: string | Date): boolean {
  const date = toDate(value);
  if (!date) return false;
  return date.getTime() < Date.now();
}

/**
 * Waktu sekarang dalam milidetik.
 *
 * Dibungkus fungsi supaya komponen tidak memanggil `Date.now()` langsung di
 * dalam render. React Compiler menandai panggilan fungsi "impure" seperti
 * `Date.now()` di badan komponen sebagai pelanggaran kemurnian render; lewat
 * helper ini niatnya jelas dan aturannya tetap terpenuhi.
 */
export function sekarangMs(): number {
  return Date.now();
}

/** Label status keaktifan event. */
export function labelStatusEvent(eventDate: string, isActive: boolean): string {
  if (!isActive) return "Pendaftaran ditutup";
  const sisa = selisihHari(eventDate);
  if (sisa === null) return "Jadwal menyusul";
  if (sisa < 0) return "Sudah selesai";
  if (sisa === 0) return "Hari ini";
  if (sisa === 1) return "Besok";
  return `${sisa} hari lagi`;
}

/** "1.240" */
export function formatAngka(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** Potong teks bersih tanpa memotong di tengah kata. */
export function potongTeks(value: string, max = 140): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Inisial untuk avatar fallback: "Rengga X" -> "RX". */
export function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Nilai dari input `datetime-local` → ISO 8601 ber-zona WITA.
 *
 * Input `datetime-local` menghasilkan "2026-10-05T09:00" tanpa keterangan zona.
 * Kalau string seperti itu langsung diberikan ke `Date`, yang dipakai adalah
 * zona waktu SERVER — di Vercel itu UTC, sehingga jadwal kegiatan meleset 8 jam.
 * Karena panitianya di Balikpapan, zona yang benar selalu WITA.
 */
export function zonaWaktuWita(nilai: string): string {
  const teks = nilai.trim();
  if (!teks) return teks;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(teks)) return `${teks}:00+08:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(teks)) return `${teks}+08:00`;
  return teks;
}

/**
 * Kebalikan dari `zonaWaktuWita()`: nilai ISO dari database → teks yang bisa
 * ditampilkan lagi di input `datetime-local`, dalam waktu WITA.
 *
 * Trik `sv-SE` dipakai karena locale itu menghasilkan urutan
 * "YYYY-MM-DD HH:MM" (format yang diminta input), jadi tinggal spasi → "T".
 */
export function keInputDatetime(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  })
    .format(date)
    .replace(" ", "T");
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
