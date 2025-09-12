import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import UpdateClinicForm from "./_components/update-clinic-form";

const ClinicSettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Buscar dados completos da clínica
  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, session.user.clinic.id),
  });

  if (!clinic) {
    redirect("/clinic-form");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Configurações da Clínica</PageTitle>
          <PageDescription>
            Gerencie as informações da sua clínica
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="max-w-4xl">
          <UpdateClinicForm clinic={clinic} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ClinicSettingsPage;
