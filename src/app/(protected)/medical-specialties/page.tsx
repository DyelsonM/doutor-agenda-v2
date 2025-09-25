import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { medicalSpecialtiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageContainer } from "@/components/ui/page-container";

import AddMedicalSpecialtyButton from "./_components/add-medical-specialty-button";
import MedicalSpecialtiesTableClient from "./_components/medical-specialties-table-client";

const MedicalSpecialtiesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    return <div>Clínica não encontrada.</div>;
  }

  const specialties = await db.query.medicalSpecialtiesTable.findMany({
    where: and(
      eq(medicalSpecialtiesTable.clinicId, session.user.clinic.id),
      eq(medicalSpecialtiesTable.isActive, true),
    ),
    orderBy: (specialties, { asc }) => [
      asc(specialties.category),
      asc(specialties.name),
    ],
  });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Especialidades Médicas</h1>
          <p className="text-muted-foreground">
            Gerencie as especialidades médicas da sua clínica.
          </p>
        </div>
        <AddMedicalSpecialtyButton />
      </div>

      <div className="mt-6">
        <MedicalSpecialtiesTableClient specialties={specialties} />
      </div>
    </PageContainer>
  );
};

export default MedicalSpecialtiesPage;
