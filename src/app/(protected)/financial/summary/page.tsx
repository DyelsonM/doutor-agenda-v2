import { and, desc, eq, gte, lte } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import {
  appointmentsTable,
  patientsTable,
  transactionsTable,
} from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import { FinancialSummaryClient } from "./_components/financial-summary-client";

const FinancialSummaryPage = async () => {
  const session = await getAuthSession();

  // Buscar transações dos últimos 30 dias por padrão usando query direta
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Buscar transações com dados relacionados diretamente
  const transactions = await db
    .select({
      id: transactionsTable.id,
      type: transactionsTable.type,
      description: transactionsTable.description,
      amountInCents: transactionsTable.amountInCents,
      paymentMethod: transactionsTable.paymentMethod,
      status: transactionsTable.status,
      expenseCategory: transactionsTable.expenseCategory,
      createdAt: transactionsTable.createdAt,
      appointmentId: appointmentsTable.id,
      patientName: patientsTable.name,
    })
    .from(transactionsTable)
    .leftJoin(
      appointmentsTable,
      eq(transactionsTable.appointmentId, appointmentsTable.id),
    )
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(
      and(
        eq(transactionsTable.clinicId, session.user.clinic.id),
        gte(transactionsTable.createdAt, startOfDay),
        lte(transactionsTable.createdAt, endOfDay),
      ),
    )
    .orderBy(desc(transactionsTable.createdAt));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Resumo Financeiro Detalhado</PageTitle>
          </div>
          <PageDescription>
            Visualize todas as transações com detalhes completos de receitas,
            despesas e categorias
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Link href="/financial/reports">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Button>
          </Link>
        </PageActions>
      </PageHeader>

      <PageContent>
        <FinancialSummaryClient
          transactions={transactions}
          periodStart={startDate}
          periodEnd={endDate}
        />
      </PageContent>
    </PageContainer>
  );
};

export default FinancialSummaryPage;
