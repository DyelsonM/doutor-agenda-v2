import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, BarChart3, Calendar, FileText } from "lucide-react";
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
import { dailyCashTable } from "@/db/schema";
import { desc, eq, gte, lte } from "drizzle-orm";
import { formatCurrencyInCents } from "@/helpers/financial";
import { getAuthSession } from "@/lib/auth-utils";

export default async function CashReportsPage() {
  const session = await getAuthSession();

  if (!session.user.clinic) {
    throw new Error("Clínica não encontrada");
  }

  const clinicId = session.user.clinic.id;

  // Buscar caixas dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCash = await db.query.dailyCashTable.findMany({
    where: and(
      eq(dailyCashTable.clinicId, clinicId),
      gte(dailyCashTable.date, thirtyDaysAgo),
    ),
    with: {
      user: true,
    },
    orderBy: [desc(dailyCashTable.date)],
  });

  // Calcular estatísticas
  const totalCash = recentCash.length;
  const openCash = recentCash.filter((cash) => cash.status === "open");
  const closedCash = recentCash.filter((cash) => cash.status === "closed");

  const totalRevenue = closedCash.reduce(
    (sum, cash) => sum + (cash.totalRevenue || 0),
    0,
  );
  const totalExpenses = closedCash.reduce(
    (sum, cash) => sum + (cash.totalExpenses || 0),
    0,
  );
  const netProfit = totalRevenue - totalExpenses;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Relatórios de Caixa</PageTitle>
          </div>
          <PageDescription>
            Análise e relatórios dos caixas diários dos últimos 30 dias
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
          {/* Resumo dos últimos 30 dias */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Caixas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCash}</div>
                <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
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
                  {openCash.length}
                </div>
                <p className="text-muted-foreground text-xs">Em andamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyInCents(totalRevenue)}
                </div>
                <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Lucro Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrencyInCents(netProfit)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Receita - Despesas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de caixas recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Caixas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCash.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Nenhum caixa encontrado
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Não há caixas registrados nos últimos 30 dias.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCash.map((cash) => (
                    <div
                      key={cash.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {cash.date
                              ? format(new Date(cash.date), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "Data não disponível"}
                          </span>
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              cash.status === "open"
                                ? "bg-blue-100 text-blue-800"
                                : cash.status === "closed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {cash.status === "open"
                              ? "Aberto"
                              : cash.status === "closed"
                                ? "Fechado"
                                : "Suspenso"}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          <p>Aberto por: {cash.user.name}</p>
                          <p>
                            Valor inicial:{" "}
                            {formatCurrencyInCents(cash.openingAmount || 0)}
                          </p>
                          {cash.status === "closed" && (
                            <p>
                              Valor final:{" "}
                              {formatCurrencyInCents(cash.closingAmount || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/daily-cash/details/${cash.id}`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="mr-1 h-3 w-3" />
                            Ver Relatório
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
