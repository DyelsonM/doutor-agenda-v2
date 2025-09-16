import { and, count, desc, eq, gte, lte, or, sql,sum } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
import {
  financialReportsTable,
  payablesTable,
  transactionsTable,
} from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/financial";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { GenerateReportButton } from "./_components/generate-report-button";
import { ReportsList } from "./_components/reports-list";

const ReportsPage = async () => {
  const session = await getAuthSession();

  let transactionsFilter;

  if (session.user.role === "admin") {
    transactionsFilter = eq(transactionsTable.clinicId, session.user.clinic.id);
  } else {
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      throw new Error("Médico não encontrado");
    }

    transactionsFilter = eq(transactionsTable.clinicId, session.user.clinic.id);
  }

  // Buscar relatórios existentes
  const existingReports = await db.query.financialReportsTable.findMany({
    where: eq(financialReportsTable.clinicId, session.user.clinic.id),
    orderBy: [desc(financialReportsTable.createdAt)],
    limit: 10,
  });

  // Estatísticas gerais
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const [monthlyRevenue, monthlyExpenses, totalReports, payablesData] =
    await Promise.all([
      db
        .select({ total: sum(transactionsTable.amountInCents) })
        .from(transactionsTable)
        .where(
          and(
            transactionsFilter,
            gte(transactionsTable.createdAt, currentMonth),
            lte(transactionsTable.createdAt, nextMonth),
            eq(transactionsTable.status, "completed"),
            // Receitas são todos os tipos exceto "expense"
            or(
              eq(transactionsTable.type, "appointment_payment"),
              eq(transactionsTable.type, "subscription_payment"),
              eq(transactionsTable.type, "other"),
            ),
          ),
        ),

      db
        .select({ total: sum(transactionsTable.amountInCents) })
        .from(transactionsTable)
        .where(
          and(
            transactionsFilter,
            gte(transactionsTable.createdAt, currentMonth),
            lte(transactionsTable.createdAt, nextMonth),
            eq(transactionsTable.status, "completed"),
            eq(transactionsTable.type, "expense"),
          ),
        ),

      db
        .select({ count: count(financialReportsTable.id) })
        .from(financialReportsTable)
        .where(eq(financialReportsTable.clinicId, session.user.clinic.id)),

      // Dados de contas a pagar
      db
        .select({
          total: sum(payablesTable.amountInCents),
          pending: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
          overdue: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' AND ${payablesTable.dueDate} < NOW() THEN ${payablesTable.amountInCents} ELSE 0 END)`,
          count: count(payablesTable.id),
        })
        .from(payablesTable)
        .where(eq(payablesTable.clinicId, session.user.clinic.id)),
    ]);

  const stats = {
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    monthlyExpenses: monthlyExpenses[0]?.total || 0,
    totalReports: totalReports[0]?.count || 0,
    payables: {
      total: payablesData[0]?.total || 0,
      pending: payablesData[0]?.pending || 0,
      overdue: payablesData[0]?.overdue || 0,
      count: payablesData[0]?.count || 0,
    },
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Relatórios Financeiros</PageTitle>
          </div>
          <PageDescription>
            Gere e visualize relatórios detalhados sobre o desempenho financeiro
            da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Link href="/financial">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href="/financial/summary">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Resumo Detalhado
            </Button>
          </Link>
          <GenerateReportButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita do Mês
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyInCents(stats.monthlyRevenue)}
                </div>
                <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despesas do Mês
                </CardTitle>
                <TrendingDown className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrencyInCents(stats.monthlyExpenses)}
                </div>
                <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contas a Pagar
                </CardTitle>
                <AlertTriangle className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrencyInCents(stats.payables.pending)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {stats.payables.count} contas,{" "}
                  {formatCurrencyInCents(stats.payables.overdue)} vencidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lucro Líquido
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${stats.monthlyRevenue - stats.monthlyExpenses >= 0 ? "text-blue-600" : "text-orange-600"}`}
                >
                  {formatCurrencyInCents(
                    stats.monthlyRevenue - stats.monthlyExpenses,
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Diferença mensal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportsList reports={existingReports} />
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ReportsPage;
