import { and, desc, eq, gte, lte } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  appointmentsTable,
  financialReportsTable,
  patientsTable,
  payablesTable,
  transactionsTable,
} from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import { BackButton } from "../_components/back-button";
import { DailyReportDetailed } from "../_components/daily-report-detailed";
import { FinancialSummary } from "../_components/financial-summary";
import { PayablesSection } from "../_components/payables-section";

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ReportDetailPage = async ({ params }: ReportDetailPageProps) => {
  const session = await getAuthSession();
  const { id } = await params;

  // Buscar o relatório
  const [report] = await db
    .select()
    .from(financialReportsTable)
    .where(
      and(
        eq(financialReportsTable.id, id),
        eq(financialReportsTable.clinicId, session.user.clinic.id),
      ),
    )
    .limit(1);

  if (!report) {
    notFound();
  }

  // Buscar transações do período do relatório
  const startOfDay = new Date(report.periodStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(report.periodEnd);
  endOfDay.setHours(23, 59, 59, 999);

  const [transactions, payables] = await Promise.all([
    db
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
      .leftJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .where(
        and(
          eq(transactionsTable.clinicId, session.user.clinic.id),
          gte(transactionsTable.createdAt, startOfDay),
          lte(transactionsTable.createdAt, endOfDay),
        ),
      )
      .orderBy(desc(transactionsTable.createdAt)),

    // Buscar contas a pagar do período
    db
      .select()
      .from(payablesTable)
      .where(
        and(
          eq(payablesTable.clinicId, session.user.clinic.id),
          gte(payablesTable.dueDate, startOfDay),
          lte(payablesTable.dueDate, endOfDay),
        ),
      )
      .orderBy(desc(payablesTable.dueDate)),
  ]);

  // Transformar dados para o formato esperado
  const transformedTransactions = transactions.map((transaction) => ({
    ...transaction,
    appointment: transaction.appointmentId
      ? {
          id: transaction.appointmentId,
          patient: { name: transaction.patientName || "N/A" },
        }
      : null,
  }));

  // Dados do relatório
  const reportData = {
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    totalRevenue: report.totalRevenue,
    totalExpenses: report.totalExpenses,
    netProfit: report.netProfit,
    appointmentCount: report.appointmentCount,
    averageAppointmentValue: report.averageAppointmentValue,
  };

  // Título do relatório
  const reportTypeLabels = {
    daily: "Diário",
    monthly: "Mensal",
    annual: "Anual",
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const reportTitle = `${reportTypeLabels[report.reportType as keyof typeof reportTypeLabels]} - ${formatDate(report.periodStart)} a ${formatDate(report.periodEnd)}`;

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />

      {report.reportType === "daily" ? (
        <DailyReportDetailed
          reportData={reportData}
          transactions={transformedTransactions}
          reportTitle={reportTitle}
        />
      ) : (
        <div className="space-y-6">
          {/* Cabeçalho do Relatório */}
          <div className="rounded-lg bg-blue-50 p-6">
            <h1 className="mb-4 text-2xl font-bold text-blue-900">
              {reportTitle}
            </h1>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-lg font-bold">
                  {
                    reportTypeLabels[
                      report.reportType as keyof typeof reportTypeLabels
                    ]
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receita</p>
                <p className="text-lg font-bold text-purple-600">
                  {report.appointmentCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receitas</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {(report.totalRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-lg font-bold text-red-600">
                  R$ {(report.totalExpenses / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Componente de Resumo Financeiro */}
          <FinancialSummary
            transactions={transformedTransactions}
            periodStart={report.periodStart}
            periodEnd={report.periodEnd}
          />

          {/* Seção de Contas a Pagar */}
          <PayablesSection
            payables={payables}
            periodStart={report.periodStart}
            periodEnd={report.periodEnd}
          />
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
