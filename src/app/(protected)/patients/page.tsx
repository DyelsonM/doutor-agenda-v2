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
import { patientsTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import AddPatientButton from "./_components/add-patient-button";
import { PatientsTableClient } from "./_components/patients-table-client";

const PatientsPage = async () => {
  const session = await getAuthSession();

  // Tanto admin quanto médico veem todos os pacientes da clínica
  // Médicos podem atender qualquer paciente da clínica
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic?.id ?? ""),
    orderBy: (patients, { asc }) => [asc(patients.name)],
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            {session.user.role === "admin"
              ? "Gerencie os pacientes da sua clínica"
              : "Visualize e gerencie todos os pacientes da clínica"}
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PatientsTableClient patients={patients} userRole={session.user.role} />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;
