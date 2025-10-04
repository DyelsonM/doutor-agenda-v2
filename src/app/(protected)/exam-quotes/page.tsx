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

import ExamQuotesClient from "./_components/exam-quotes-client";

const ExamQuotesPage = async () => {
  const session = await getAuthSession();

  // Buscar parceiros com seus exames
  const partners = await db.query.partnersTable.findMany({
    where: eq(partnersTable.clinicId, session.user.clinic?.id ?? ""),
    with: {
      exams: true,
    },
    orderBy: (table, { asc }) => [asc(table.companyName)],
  });

  // Filtrar apenas parceiros que têm exames cadastrados
  const partnersWithExams = partners.filter(
    (partner) => partner.exams.length > 0,
  );

  return (
    <PageContainer>
      <PageHeader className="print:hidden">
        <PageHeaderContent>
          <PageTitle>Orçamento de Exames</PageTitle>
          <PageDescription>
            Selecione os exames necessários e gere um orçamento formatado
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {/* Futuramente pode ter botões de ação aqui */}
        </PageActions>
      </PageHeader>
      <PageContent>
        <ExamQuotesClient partners={partnersWithExams} />
      </PageContent>
    </PageContainer>
  );
};

export default ExamQuotesPage;
