import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
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
import { transactionsTable } from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { AddTransactionButton } from "./_components/add-transaction-button";
import { transactionsTableColumns } from "./_components/transactions-table-columns";

// Desabilitar cache para garantir dados sempre atualizados
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TransactionsPage = async () => {
  const session = await getAuthSession();

  let transactionsFilter;

  if (session.user.role === "admin") {
    // Admin vê todas as transações da clínica
    transactionsFilter = eq(transactionsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas suas transações relacionadas às suas consultas
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      throw new Error("Médico não encontrado");
    }

    transactionsFilter = eq(transactionsTable.clinicId, session.user.clinic.id);
    // TODO: Filtrar por consultas do médico específico
  }

  // Buscar todas as transações de uma vez (mais eficiente)
  const allTransactions = await db.query.transactionsTable.findMany({
    where: transactionsFilter,
    with: {
      appointment: {
        with: {
          patient: true,
          doctor: true,
        },
      },
    },
    orderBy: [desc(transactionsTable.createdAt)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Transações</PageTitle>
          </div>
          <PageDescription>
            Gerencie todas as transações financeiras da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Link href="/financial">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <AddTransactionButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={allTransactions}
              columns={transactionsTableColumns}
            />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default TransactionsPage;
