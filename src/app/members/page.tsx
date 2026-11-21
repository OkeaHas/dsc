import { MembersExplorer } from "@/components/members-explorer";
import { Container, DataNotice, EmptyState, PageHeader } from "@/components/ui";
import { getAllMembers } from "@/server/members";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anggota",
  description: "Daftar anggota Developer Student Club beserta jabatannya.",
};

export default async function MembersPage() {
  const { data, error } = await getAllMembers();
  const members = data ?? [];

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow="Orang-orang di baliknya"
        title="Anggota"
        description="Pengurus dan anggota aktif yang menjalankan program kerja DSC."
      />

      {error ? (
        <div className="mt-6">
          <DataNotice message={error.message} />
        </div>
      ) : members.length > 0 ? (
        <MembersExplorer members={members} />
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Belum ada anggota terdaftar"
            description="Data anggota bisa ditambahkan lewat API POST /api/members dengan Bearer token admin."
          />
        </div>
      )}
    </Container>
  );
}
