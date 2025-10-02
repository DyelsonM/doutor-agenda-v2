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
import { partnersTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import AddPartnerButton from "./_components/add-partner-button";
import PartnersTableClient from "./_components/partners-table-client";

const PartnersPage = async () => {
  const session = await getAuthSession();

  // Buscar parceiros com seus exames
  const partners = await db.query.partnersTable.findMany({
    where: eq(partnersTable.clinicId, session.user.clinic?.id ?? ""),
    with: {
      exams: true,
    },
    orderBy: (table, { asc }) => [asc(table.companyName)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Parceiros</PageTitle>
          <PageDescription>
            Gerencie os parceiros da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPartnerButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PartnersTableClient partners={partners} />
      </PageContent>
    </PageContainer>
  );
};

export default PartnersPage;
