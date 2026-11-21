import { FeedbackForm } from "@/components/forms/feedback-form";
import { Card, Container, PageHeader } from "@/components/ui";

export const metadata = {
  title: "Kritik & Saran",
  description:
    "Kirim kritik, saran, atau ide kegiatan untuk Developer Student Club. Boleh tanpa nama.",
};

/**
 * Halaman ini tidak menyentuh database saat render (form-nya client component
 * yang mengirim ke POST /api/feedback), jadi tidak perlu `force-dynamic`.
 */
export default function FeedbackPage() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <PageHeader
            eyebrow="Kotak masukan"
            title="Kritik & Saran"
            description="Semua masukan dibaca pengurus. Tidak ada yang terlalu kecil atau terlalu tajam untuk disampaikan."
          />

          <Card className="mt-8 p-5 sm:p-7">
            <FeedbackForm />
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-bold">Yang perlu kamu tahu</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span className="text-brand">•</span>
              <span>
                <strong className="text-foreground">Boleh anonim.</strong> Nama dan
                email opsional — kalau dikosongkan, masukan tersimpan sebagai
                &ldquo;Anonymous&rdquo;.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-brand">•</span>
              <span>
                <strong className="text-foreground">Email hanya untuk membalas.</strong>{" "}
                Kalau kamu ingin dihubungi, isi kolom email.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-brand">•</span>
              <span>
                <strong className="text-foreground">Hanya pengurus yang bisa membaca.</strong>{" "}
                Daftar masukan dilindungi token admin, jadi tidak bisa diakses publik.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
