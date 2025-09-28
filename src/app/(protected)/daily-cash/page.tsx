import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { Calendar, DollarSign, History, Plus } from "lucide-react";
import Link from "next/link";

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

import { CashStatusCard } from "./_components/cash-status-card";
import { DailyCashClient } from "./_components/daily-cash-client";
import { RecentCashHistory } from "./_components/recent-cash-history";

const DailyCashPage = async () => {
  const session = await getAuthSession();

  if (!session.user.clinic) {
    throw new Error("Clínica não encontrada");
  }

  const clinicId = session.user.clinic.id;

  // Buscar caixa do dia atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCash = await db.query.dailyCashTable.findFirst({
    where: and(
      eq(dailyCashTable.clinicId, clinicId),
      gte(dailyCashTable.date, today),
      lte(dailyCashTable.date, tomorrow),
    ),
    with: {
      operations: {
        with: {
          user: true,
        },
        orderBy: [desc(cashOperationsTable.createdAt)],
        limit: 5,
      },
      user: true,
    },
    orderBy: [desc(dailyCashTable.createdAt)],
  });

  // Buscar histórico recente (últimos 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentHistory = await db.query.dailyCashTable.findMany({
    where: and(
      eq(dailyCashTable.clinicId, clinicId),
      gte(dailyCashTable.date, sevenDaysAgo),
    ),
    with: {
      user: true,
      operations: {
        with: {
          user: true,
        },
        orderBy: [desc(cashOperationsTable.createdAt)],
      },
    },
    orderBy: [desc(dailyCashTable.date)],
    limit: 7,
  });

  return (
    <DailyCashClient>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <PageTitle>Sistema de Caixa Diário</PageTitle>
            </div>
            <PageDescription>
              Gerencie o caixa diário da sua clínica com controle completo de
              entradas e saídas
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Link href="/daily-cash/history">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Button>
            </Link>
            <Link href="/daily-cash/reports">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
          </PageActions>
        </PageHeader>

        <PageContent>
          <div className="space-y-6">
            {/* Status do caixa atual ou botão para abrir */}
            {todayCash && todayCash.status === "open" ? (
              <CashStatusCard cash={todayCash} />
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    {todayCash && todayCash.status === "closed"
                      ? "Caixa fechado"
                      : "Nenhum caixa aberto"}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    {todayCash && todayCash.status === "closed"
                      ? "O caixa foi fechado. Abra um novo caixa para continuar as operações."
                      : "Não há caixa aberto para hoje. Abra um novo caixa para começar as operações."}
                  </p>
                  <Link href="/daily-cash/open">
                    <Button size="lg">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Abrir Novo Caixa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Ações rápidas - só aparecem quando há caixa aberto */}
            {todayCash && todayCash.status === "open" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Operações de Caixa
                    </CardTitle>
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todayCash?.operations.length || 0}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Operações hoje
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Histórico Recente
                    </CardTitle>
                    <History className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {recentHistory.length}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Últimos 7 dias
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Histórico recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentCashHistory history={recentHistory} />
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </DailyCashClient>
  );
};

export default DailyCashPage;
