import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { appointmentModalitiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageContainer } from "@/components/ui/page-container";

import AddAppointmentModalityButton from "./_components/add-appointment-modality-button";
import AppointmentModalitiesTableClient from "./_components/appointment-modalities-table-client";

const AppointmentModalitiesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    return <div>Clínica não encontrada.</div>;
  }

  const modalities = await db.query.appointmentModalitiesTable.findMany({
    where: and(
      eq(appointmentModalitiesTable.clinicId, session.user.clinic.id),
      eq(appointmentModalitiesTable.isActive, true),
    ),
    orderBy: (modalities, { asc }) => [
      asc(modalities.category),
      asc(modalities.name),
    ],
  });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modalidades de Agendamento</h1>
          <p className="text-muted-foreground">
            Gerencie as modalidades de agendamento da sua clínica.
          </p>
        </div>
        <AddAppointmentModalityButton />
      </div>

      <div className="mt-6">
        <AppointmentModalitiesTableClient modalities={modalities} />
      </div>
    </PageContainer>
  );
};

export default AppointmentModalitiesPage;
