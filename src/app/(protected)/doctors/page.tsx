import { eq } from "drizzle-orm";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { getAuthSession, requireAdmin } from "@/lib/auth-utils";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await getAuthSession();

  // Apenas administradores podem gerenciar médicos
  requireAdmin(session);

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>Gerencie os médicos da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        {doctors.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-3">
            <div className="w-full rounded-lg border border-gray-200 bg-white px-6 py-8 text-center">
              <p className="text-black">No results.</p>
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
