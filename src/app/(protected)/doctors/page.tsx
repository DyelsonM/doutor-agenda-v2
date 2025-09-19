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
import { DoctorsPageClient } from "./_components/doctors-page-client";

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
        <DoctorsPageClient doctors={doctors} />
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
