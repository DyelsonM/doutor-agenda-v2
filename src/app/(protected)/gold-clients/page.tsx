import { asc, eq } from "drizzle-orm";

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
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import AddGoldClientButton from "./_components/add-gold-client-button";
import GoldClientsTableClient from "./_components/gold-clients-table-client";

const GoldClientsPage = async () => {
  const session = await getAuthSession();

  // Buscar clientes ouro com seus dependentes, ordenados alfabeticamente
  const goldClients = await db.query.goldClientsTable.findMany({
    where: eq(goldClientsTable.clinicId, session.user.clinic?.id ?? ""),
    with: {
      dependents: true,
    },
    orderBy: [asc(goldClientsTable.holderName)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes Ouro</PageTitle>
          <PageDescription>
            Gerencie os clientes ouro da sua clínica e seus dependentes
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddGoldClientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <GoldClientsTableClient goldClients={goldClients} />
      </PageContent>
    </PageContainer>
  );
};

export default GoldClientsPage;
