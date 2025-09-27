import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Calendar, CheckCircle, Clock, Lock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cashOperationsTable, dailyCashTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/financial";
import { getAuthSession } from "@/lib/auth-utils";

import { CashHistoryList } from "./_components/cash-history-list";

export default async function CashHistoryPage() {
  const session = await getAuthSession();

  if (!session.user.clinic) {
    throw new Error("Clínica não encontrada");
  }

  const clinicId = session.user.clinic.id;

  const cashHistory = await db.query.dailyCashTable.findMany({
    where: eq(dailyCashTable.clinicId, clinicId),
    with: {
      user: true,
      operations: {
        orderBy: [desc(cashOperationsTable.createdAt)],
      },
    },
    orderBy: [desc(dailyCashTable.date)],
    limit: 50,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Histórico de Caixas</PageTitle>
          </div>
          <PageDescription>
            Visualize o histórico completo de caixas diários da clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Link href="/daily-cash">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Caixas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cashHistory.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Caixas Abertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {cashHistory.filter((cash) => cash.status === "open").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Caixas Fechados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    cashHistory.filter((cash) => cash.status === "closed")
                      .length
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de caixas */}
          {cashHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">
                  Nenhum caixa encontrado
                </h3>
                <p className="text-muted-foreground text-center">
                  Ainda não há histórico de caixas diários para esta clínica.
                </p>
              </CardContent>
            </Card>
          ) : (
            <CashHistoryList history={cashHistory} />
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}
