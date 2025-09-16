import { and, count, desc, eq, gte, lte, sql,sum } from "drizzle-orm";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  FileText,
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
import { payablesTable,transactionsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/financial";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { FinancialPageClient } from "./_components/financial-page-client";
import { FinancialSummaryCards } from "./_components/financial-summary-cards";
import { RecentTransactions } from "./_components/recent-transactions";
import { RevenueChart } from "./_components/revenue-chart";

const FinancialPage = async () => {
  const session = await getAuthSession();

  let transactionsFilter;

  if (session.user.role === "admin") {
    // Admin vê todos os dados da clínica
    transactionsFilter = eq(transactionsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas seus dados
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      throw new Error("Médico não encontrado");
    }

    transactionsFilter = and(
      eq(transactionsTable.clinicId, session.user.clinic.id),
      // Filtrar transações relacionadas às consultas do médico
    );
  }

  // Período atual (últimos 30 dias)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Período anterior (30 dias antes do período atual)
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date();
  previousStartDate.setDate(previousStartDate.getDate() - 60);

  const periodFilter = and(
    transactionsFilter,
    gte(transactionsTable.createdAt, startDate),
    lte(transactionsTable.createdAt, endDate),
  );

  const previousPeriodFilter = and(
    transactionsFilter,
    gte(transactionsTable.createdAt, previousStartDate),
    lte(transactionsTable.createdAt, previousEndDate),
  );

  // Resumo financeiro separado por receitas e despesas (período atual e anterior)
  const [
    revenueData,
    expenseData,
    totalTransactions,
    pendingAmount,
    // Dados de contas a pagar
    payablesData,
    // Dados do período anterior para comparação
    previousRevenueData,
    previousExpenseData,
    previousTotalTransactions,
  ] = await Promise.all([
    // Receitas (entradas) - período atual
    db
      .select({ total: sum(transactionsTable.amountInCents) })
      .from(transactionsTable)
      .where(
        and(
          periodFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "appointment_payment"),
        ),
      ),

    // Despesas (saídas) - período atual
    db
      .select({ total: sum(transactionsTable.amountInCents) })
      .from(transactionsTable)
      .where(
        and(
          periodFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "expense"),
        ),
      ),

    // Total de transações - período atual
    db
      .select({ count: count(transactionsTable.id) })
      .from(transactionsTable)
      .where(periodFilter),

    // Valor pendente - período atual
    db
      .select({ total: sum(transactionsTable.amountInCents) })
      .from(transactionsTable)
      .where(and(periodFilter, eq(transactionsTable.status, "pending"))),

    // Dados de contas a pagar
    db
      .select({
        total: sum(payablesTable.amountInCents),
        pending: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        overdue: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' AND ${payablesTable.dueDate} < NOW() THEN ${payablesTable.amountInCents} ELSE 0 END)`,
      })
      .from(payablesTable)
      .where(eq(payablesTable.clinicId, session.user.clinic.id)),

    // Receitas (entradas) - período anterior
    db
      .select({ total: sum(transactionsTable.amountInCents) })
      .from(transactionsTable)
      .where(
        and(
          previousPeriodFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "appointment_payment"),
        ),
      ),

    // Despesas (saídas) - período anterior
    db
      .select({ total: sum(transactionsTable.amountInCents) })
      .from(transactionsTable)
      .where(
        and(
          previousPeriodFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "expense"),
        ),
      ),

    // Total de transações - período anterior
    db
      .select({ count: count(transactionsTable.id) })
      .from(transactionsTable)
      .where(previousPeriodFilter),
  ]);

  // Transações recentes
  const recentTransactions = await db.query.transactionsTable.findMany({
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
    limit: 10,
  });

  // Dados para o gráfico (4 dias passados + hoje + 2 futuros = 7 dias)
  // Usar timezone local para as datas de busca
  const now = new Date();
  const chartStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 4,
    0,
    0,
    0,
    0,
  );
  const chartEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 2,
    23,
    59,
    59,
    999,
  );

  // Debug: Log das datas de busca
  console.log("=== DEBUG BACKEND ===");
  console.log("Chart Start Date:", chartStartDate);
  console.log("Chart End Date:", chartEndDate);

  const [revenueChartData, expenseChartData] = await Promise.all([
    // Receitas por dia (usando timezone local)
    db
      .select({
        date: sql`DATE(${transactionsTable.createdAt})`.as("date"),
        amount: sum(transactionsTable.amountInCents),
      })
      .from(transactionsTable)
      .where(
        and(
          transactionsFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "appointment_payment"),
          gte(transactionsTable.createdAt, chartStartDate),
          lte(transactionsTable.createdAt, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${transactionsTable.createdAt})`)
      .orderBy(sql`DATE(${transactionsTable.createdAt})`),

    // Despesas por dia (usando timezone local)
    db
      .select({
        date: sql`DATE(${transactionsTable.createdAt})`.as("date"),
        amount: sum(transactionsTable.amountInCents),
      })
      .from(transactionsTable)
      .where(
        and(
          transactionsFilter,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "expense"),
          gte(transactionsTable.createdAt, chartStartDate),
          lte(transactionsTable.createdAt, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${transactionsTable.createdAt})`)
      .orderBy(sql`DATE(${transactionsTable.createdAt})`),
  ]);

  // Debug: Log dos dados retornados do banco
  console.log(
    "Dados de receita do banco:",
    revenueChartData.map((item) => ({
      date: item.date,
      dateType: typeof item.date,
      dateString: item.date?.toString(),
      amount: item.amount,
    })),
  );
  console.log(
    "Dados de despesa do banco:",
    expenseChartData.map((item) => ({
      date: item.date,
      dateType: typeof item.date,
      dateString: item.date?.toString(),
      amount: item.amount,
    })),
  );

  // Calcular tendências comparando período atual vs anterior
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueTrend = calculateTrend(
    revenueData[0]?.total || 0,
    previousRevenueData[0]?.total || 0,
  );

  const expenseTrend = calculateTrend(
    expenseData[0]?.total || 0,
    previousExpenseData[0]?.total || 0,
  );

  const currentNetProfit =
    (revenueData[0]?.total || 0) - (expenseData[0]?.total || 0);
  const previousNetProfit =
    (previousRevenueData[0]?.total || 0) - (previousExpenseData[0]?.total || 0);
  const netProfitTrend = calculateTrend(currentNetProfit, previousNetProfit);

  const transactionTrend = calculateTrend(
    totalTransactions[0]?.count || 0,
    previousTotalTransactions[0]?.count || 0,
  );

  const financialStats = {
    totalRevenue: revenueData[0]?.total || 0,
    totalExpenses: expenseData[0]?.total || 0,
    netProfit: currentNetProfit,
    totalTransactions: totalTransactions[0]?.count || 0,
    pendingAmount: pendingAmount[0]?.total || 0,
    // Contas a pagar
    totalPayables: payablesData[0]?.total || 0,
    pendingPayables: payablesData[0]?.pending || 0,
    overduePayables: payablesData[0]?.overdue || 0,
    // Tendências calculadas em tempo real
    revenueTrend,
    expenseTrend,
    netProfitTrend,
    transactionTrend,
  };

  return (
    <FinancialPageClient>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <PageTitle>Financeiro</PageTitle>
            </div>
            <PageDescription>
              Gerencie as finanças da sua clínica e acompanhe o desempenho
              financeiro
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Link href="/financial/transactions">
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Ver Transações
              </Button>
            </Link>
            <Link href="/financial/payables">
              <Button variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Contas a Pagar
              </Button>
            </Link>
            <Link href="/financial/reports">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
          </PageActions>
        </PageHeader>

        <PageContent>
          <div className="space-y-6">
            {/* Cards de resumo */}
            <FinancialSummaryCards stats={financialStats} />

            {/* Navegação rápida */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link href="/financial/transactions">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Transações
                    </CardTitle>
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrencyInCents(financialStats.totalRevenue)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Total de receita
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/financial/payables">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Contas a Pagar
                    </CardTitle>
                    <AlertTriangle className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrencyInCents(financialStats.totalPayables)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {financialStats.pendingPayables} pendentes,{" "}
                      {financialStats.overduePayables} vencidas
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Gráfico de receitas e despesas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Receitas vs Despesas (7 Dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart
                  revenueData={revenueChartData}
                  expenseData={expenseChartData}
                />
              </CardContent>
            </Card>

            {/* Transações recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Transações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={recentTransactions} />
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </FinancialPageClient>
  );
};

export default FinancialPage;
