import { OmbakAtas, OmbakBawah, Wadah } from "@/components/sections/decor";
import { STATISTIK, TENTANG } from "@/lib/site-content";

/**
 * Section "Tentang Kami" — panel oranye dengan tepi bergelombang.
 *
 * Prop `jumlahAnggota` dan `jumlahKegiatan` datang dari database (dihitung di
 * `page.tsx`). Kalau database kosong atau belum tersambung, dipakai angka
 * cadangan dari `site-content.ts` supaya tidak muncul "0+ anggota".
 */
export function Tentang({
  jumlahAnggota,
  jumlahKegiatan,
}: {
  jumlahAnggota: number;
  jumlahKegiatan: number;
}) {
  const anggota = jumlahAnggota > 0 ? jumlahAnggota : STATISTIK.anggotaCadangan;
  const kegiatan = jumlahKegiatan > 0 ? jumlahKegiatan : STATISTIK.kegiatanCadangan;

  const statistik = [
    { angka: `${anggota}+`, label: "Anggota aktif" },
    { angka: `${STATISTIK.tahunBerkarya}+`, label: "Tahun berkarya" },
    { angka: `${kegiatan}+`, label: "Kegiatan per tahun" },
    { angka: `${STATISTIK.prestasi}+`, label: "Prestasi" },
  ];

  return (
    <>
      <section id="tentang-kami" className="dsc-anchor bg-accent">
        <OmbakAtas />

        <Wadah className="py-10 sm:py-14 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/70">
                {TENTANG.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
                {TENTANG.judul}
              </h2>
            </div>

            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-ink/85 sm:text-base">
                {TENTANG.paragraf}
              </p>
            </div>
          </div>

          {/* Statistik: satu baris penuh di bawah garis pemisah, seperti desain. */}
          <dl className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-ink/15 pt-8 sm:gap-x-8 lg:grid-cols-4">
            {statistik.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
                  {item.angka}
                </dt>
                <dd className="mt-2 text-[11px] font-bold uppercase tracking-wider text-ink/70 sm:text-xs">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </Wadah>
      </section>

      {/* Tepi bawah panel: gelombang oranye yang melebur ke latar putih. */}
      <OmbakBawah />
    </>
  );
}
