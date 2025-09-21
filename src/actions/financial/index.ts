"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

import { db } from "@/db";
import {
  appointmentsTable,
  financialReportsTable,
  patientsTable,
  payablesTable,
  transactionsTable,
} from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import {
  createTransactionSchema,
  deleteReportSchema,
  deleteTransactionSchema,
  getFinancialReportSchema,
  getReportByIdSchema,
  updateTransactionSchema,
} from "./schema";

const action = createSafeActionClient();

export const createTransactionAction = action
  .schema(createTransactionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar permissões para médicos
    if (session.user.role === "doctor") {
      const doctorId = await getDoctorIdFromUser(session.user.id);
      if (!doctorId) {
        throw new Error("Médico não encontrado");
      }
    }

    // Criar data atual no timezone de São Paulo/Brasília
    const localTime = dayjs().tz("America/Sao_Paulo").toDate();

    const transaction = await db
      .insert(transactionsTable)
      .values({
        clinicId: session.user.clinic.id,
        appointmentId: parsedInput.appointmentId,
        type: parsedInput.type,
        amountInCents: parsedInput.amountInCents,
        description: parsedInput.description,
        paymentMethod: parsedInput.paymentMethod,
        expenseCategory: parsedInput.expenseCategory,
        stripePaymentIntentId: parsedInput.stripePaymentIntentId,
        stripeChargeId: parsedInput.stripeChargeId,
        metadata: parsedInput.metadata,
        status: "pending",
        createdAt: localTime,
      })
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/transactions");
    revalidatePath("/financial/summary");
    revalidatePath("/financial/reports");

    return {
      success: true,
      data: transaction[0],
      message: "Transação criada com sucesso!",
    };
  });

export const updateTransactionAction = action
  .schema(updateTransactionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar a transação
    const existingTransaction = await db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, parsedInput.id),
    });

    if (!existingTransaction) {
      throw new Error("Transação não encontrada");
    }

    // Verificar se a transação pertence à clínica
    if (existingTransaction.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    const updatedTransaction = await db
      .update(transactionsTable)
      .set({
        status: parsedInput.status,
        description: parsedInput.description,
        metadata: parsedInput.metadata,
        updatedAt: new Date(),
      })
      .where(eq(transactionsTable.id, parsedInput.id))
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/transactions");

    return {
      success: true,
      data: updatedTransaction[0],
      message: "Transação atualizada com sucesso!",
    };
  });

export const deleteTransactionAction = action
  .schema(deleteTransactionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar se a transação pertence à clínica
    const existingTransaction = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, parsedInput.id),
          eq(transactionsTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (existingTransaction.length === 0) {
      throw new Error("Transação não encontrada");
    }

    // Excluir a transação
    await db
      .delete(transactionsTable)
      .where(eq(transactionsTable.id, parsedInput.id));

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/transactions");

    return {
      success: true,
      data: { id: parsedInput.id },
      message: "Transação excluída com sucesso!",
    };
  });

export const getTransactionsAction = action
  .schema(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z
        .enum(["pending", "completed", "failed", "cancelled", "refunded"])
        .optional(),
      type: z.enum(["appointment_payment", "expense"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    let whereConditions: any = eq(
      transactionsTable.clinicId,
      session.user.clinic.id,
    );

    // Filtros adicionais
    if (parsedInput.status) {
      whereConditions = and(
        whereConditions,
        eq(transactionsTable.status, parsedInput.status),
      );
    }

    if (parsedInput.type) {
      whereConditions = and(
        whereConditions,
        eq(transactionsTable.type, parsedInput.type),
      );
    }

    if (parsedInput.startDate) {
      whereConditions = and(
        whereConditions,
        gte(transactionsTable.createdAt, parsedInput.startDate),
      );
    }

    if (parsedInput.endDate) {
      whereConditions = and(
        whereConditions,
        lte(transactionsTable.createdAt, parsedInput.endDate),
      );
    }

    const transactions = await db.query.transactionsTable.findMany({
      where: whereConditions,
      with: {
        appointment: {
          with: {
            patient: true,
            doctor: true,
          },
        },
      },
      orderBy: [desc(transactionsTable.createdAt)],
      limit: parsedInput.limit,
      offset: (parsedInput.page - 1) * parsedInput.limit,
    });

    const totalCount = await db
      .select({ count: count() })
      .from(transactionsTable)
      .where(whereConditions);

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page: parsedInput.page,
          limit: parsedInput.limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil(
            (totalCount[0]?.count || 0) / parsedInput.limit,
          ),
        },
      },
    };
  });

export const getFinancialSummaryAction = action
  .schema(
    z.object({
      periodStart: z.date(),
      periodEnd: z.date(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    const whereConditions = and(
      eq(transactionsTable.clinicId, session.user.clinic.id),
      gte(transactionsTable.createdAt, parsedInput.periodStart),
      lte(transactionsTable.createdAt, parsedInput.periodEnd),
    );

    // Resumo financeiro
    const summary = await db
      .select({
        totalRevenue: sum(transactionsTable.amountInCents),
        transactionCount: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(and(whereConditions, eq(transactionsTable.status, "completed")));

    // Receita por tipo de transação
    const revenueByType = await db
      .select({
        type: transactionsTable.type,
        total: sum(transactionsTable.amountInCents),
        count: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(and(whereConditions, eq(transactionsTable.status, "completed")))
      .groupBy(transactionsTable.type);

    // Receita por método de pagamento
    const revenueByPaymentMethod = await db
      .select({
        paymentMethod: transactionsTable.paymentMethod,
        total: sum(transactionsTable.amountInCents),
        count: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(and(whereConditions, eq(transactionsTable.status, "completed")))
      .groupBy(transactionsTable.paymentMethod);

    // Transações pendentes
    const pendingTransactions = await db
      .select({
        total: sum(transactionsTable.amountInCents),
        count: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(and(whereConditions, eq(transactionsTable.status, "pending")));

    return {
      success: true,
      data: {
        summary: {
          totalRevenue: summary[0]?.totalRevenue || 0,
          transactionCount: summary[0]?.transactionCount || 0,
          pendingAmount: pendingTransactions[0]?.total || 0,
          pendingCount: pendingTransactions[0]?.count || 0,
        },
        revenueByType,
        revenueByPaymentMethod,
      },
    };
  });

export const generateFinancialReportAction = action
  .schema(getFinancialReportSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Gerar relatório financeiro diretamente
    // Para relatórios diários, usar apenas a parte da data sem hora
    const isDaily =
      parsedInput.reportType === "daily" ||
      parsedInput.periodStart.toDateString() ===
        parsedInput.periodEnd.toDateString();

    let whereConditions;
    if (isDaily) {
      // Para relatórios diários, usar range de horas para o dia inteiro
      const startOfDay = new Date(parsedInput.periodStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedInput.periodStart);
      endOfDay.setHours(23, 59, 59, 999);

      whereConditions = and(
        eq(transactionsTable.clinicId, session.user.clinic.id),
        gte(transactionsTable.createdAt, startOfDay),
        lte(transactionsTable.createdAt, endOfDay),
      );
    } else {
      // Para relatórios mensais/anuais, usar range de timestamp
      whereConditions = and(
        eq(transactionsTable.clinicId, session.user.clinic.id),
        gte(transactionsTable.createdAt, parsedInput.periodStart),
        lte(transactionsTable.createdAt, parsedInput.periodEnd),
      );
    }

    // Resumo financeiro separado por categoria
    // RECEITAS (entrada de dinheiro)
    const revenueSummary = await db
      .select({
        totalRevenue: sum(transactionsTable.amountInCents),
        transactionCount: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(
        and(
          whereConditions,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "appointment_payment"),
        ),
      );

    // DESPESAS (saída de dinheiro)
    const expenseSummary = await db
      .select({
        totalExpenses: sum(transactionsTable.amountInCents),
        transactionCount: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(
        and(
          whereConditions,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "expense"),
        ),
      );

    const refundSummary = await db
      .select({
        totalExpenses: sum(transactionsTable.amountInCents),
        transactionCount: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(
        and(
          whereConditions,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "refund"),
        ),
      );

    // OUTROS (neutros)
    const otherSummary = await db
      .select({
        totalOther: sum(transactionsTable.amountInCents),
        transactionCount: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(
        and(
          whereConditions,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "other"),
        ),
      );

    // Receita por tipo de transação (todos os tipos)
    const revenueByType = await db
      .select({
        type: transactionsTable.type,
        total: sum(transactionsTable.amountInCents),
        count: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(and(whereConditions, eq(transactionsTable.status, "completed")))
      .groupBy(transactionsTable.type);

    // Despesas por categoria
    const expensesByCategory = await db
      .select({
        category: transactionsTable.expenseCategory,
        total: sum(transactionsTable.amountInCents),
        count: count(transactionsTable.id),
      })
      .from(transactionsTable)
      .where(
        and(
          whereConditions,
          eq(transactionsTable.status, "completed"),
          eq(transactionsTable.type, "expense"),
        ),
      )
      .groupBy(transactionsTable.expenseCategory);

    // Dados de contas a pagar
    const payablesSummary = await db
      .select({
        total: sum(payablesTable.amountInCents),
        pending: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        paid: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'paid' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        overdue: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' AND ${payablesTable.dueDate} < NOW() THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        count: count(payablesTable.id),
      })
      .from(payablesTable)
      .where(eq(payablesTable.clinicId, session.user.clinic.id));

    // Contas a pagar por categoria
    const payablesByCategory = await db
      .select({
        category: payablesTable.category,
        total: sum(payablesTable.amountInCents),
        pending: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'pending' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        paid: sql<number>`SUM(CASE WHEN ${payablesTable.status} = 'paid' THEN ${payablesTable.amountInCents} ELSE 0 END)`,
        count: count(payablesTable.id),
      })
      .from(payablesTable)
      .where(eq(payablesTable.clinicId, session.user.clinic.id))
      .groupBy(payablesTable.category);

    // Contas a pagar vencidas no período
    const overduePayables = await db
      .select({
        total: sum(payablesTable.amountInCents),
        count: count(payablesTable.id),
      })
      .from(payablesTable)
      .where(
        and(
          eq(payablesTable.clinicId, session.user.clinic.id),
          eq(payablesTable.status, "pending"),
          lte(payablesTable.dueDate, parsedInput.periodEnd),
        ),
      );

    // Calcular métricas adicionais
    let appointmentsInPeriod;
    if (isDaily) {
      // Para relatórios diários, usar o mesmo range de data
      const startOfDay = new Date(parsedInput.periodStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedInput.periodStart);
      endOfDay.setHours(23, 59, 59, 999);

      appointmentsInPeriod = await db
        .select({
          count: count(appointmentsTable.id),
          totalValue: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, startOfDay),
            lte(appointmentsTable.date, endOfDay),
            lte(appointmentsTable.date, new Date()), // Apenas consultas que já aconteceram
          ),
        );
    } else {
      // Para relatórios mensais/anuais, usar range de datas
      appointmentsInPeriod = await db
        .select({
          count: count(appointmentsTable.id),
          totalValue: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, parsedInput.periodStart),
            lte(appointmentsTable.date, parsedInput.periodEnd),
            lte(appointmentsTable.date, new Date()), // Apenas consultas que já aconteceram
          ),
        );
    }

    const averageAppointmentValue = appointmentsInPeriod[0]?.count
      ? Math.round(
          (Number(appointmentsInPeriod[0].totalValue) || 0) /
            appointmentsInPeriod[0].count,
        )
      : 0;

    // Criar relatório
    const reportData = {
      summary: {
        totalRevenue: Number(revenueSummary[0]?.totalRevenue) || 0,
        totalRefunds: Number(refundSummary[0]?.totalExpenses) || 0,
        totalExpenses: Number(expenseSummary[0]?.totalExpenses) || 0,
        totalOther: Number(otherSummary[0]?.totalOther) || 0,
        netProfit:
          (Number(revenueSummary[0]?.totalRevenue) || 0) -
          (Number(refundSummary[0]?.totalExpenses) || 0) -
          (Number(expenseSummary[0]?.totalExpenses) || 0) +
          (Number(otherSummary[0]?.totalOther) || 0),
        revenueTransactionCount:
          Number(revenueSummary[0]?.transactionCount) || 0,
        refundTransactionCount: Number(refundSummary[0]?.transactionCount) || 0,
        expenseTransactionCount:
          Number(expenseSummary[0]?.transactionCount) || 0,
        otherTransactionCount: Number(otherSummary[0]?.transactionCount) || 0,
      },
      revenueByType,
      expensesByCategory,
      appointments: {
        count: Number(appointmentsInPeriod[0]?.count) || 0,
        totalValue: Number(appointmentsInPeriod[0]?.totalValue) || 0,
        averageValue: averageAppointmentValue,
      },
      payables: {
        summary: {
          total: payablesSummary[0]?.total || 0,
          pending: payablesSummary[0]?.pending || 0,
          paid: payablesSummary[0]?.paid || 0,
          overdue: payablesSummary[0]?.overdue || 0,
          count: payablesSummary[0]?.count || 0,
        },
        byCategory: payablesByCategory,
        overdueInPeriod: {
          total: overduePayables[0]?.total || 0,
          count: overduePayables[0]?.count || 0,
        },
      },
    };

    const report = await db
      .insert(financialReportsTable)
      .values({
        clinicId: session.user.clinic.id,
        reportType: parsedInput.reportType,
        periodStart: parsedInput.periodStart,
        periodEnd: parsedInput.periodEnd,
        totalRevenue: Number(revenueSummary[0]?.totalRevenue) || 0,
        totalExpenses:
          (Number(expenseSummary[0]?.totalExpenses) || 0) +
          (Number(refundSummary[0]?.totalExpenses) || 0),
        netProfit:
          (Number(revenueSummary[0]?.totalRevenue) || 0) -
          (Number(refundSummary[0]?.totalExpenses) || 0) -
          (Number(expenseSummary[0]?.totalExpenses) || 0) +
          (Number(otherSummary[0]?.totalOther) || 0),
        appointmentCount: Number(appointmentsInPeriod[0]?.count) || 0,
        averageAppointmentValue,
        reportData: JSON.stringify(reportData),
      })
      .returning();

    return {
      success: true,
      data: {
        report: report[0],
        reportData,
      },
      message: "Relatório financeiro gerado com sucesso!",
    };
  });

export const getReportByIdAction = action
  .schema(getReportByIdSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar o relatório
    const report = await db
      .select()
      .from(financialReportsTable)
      .where(
        and(
          eq(financialReportsTable.id, parsedInput.id),
          eq(financialReportsTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (report.length === 0) {
      throw new Error("Relatório não encontrado");
    }

    // Tentar fazer parse do reportData
    let reportData;
    try {
      reportData = JSON.parse(report[0].reportData || "{}");
    } catch (error) {
      console.error("Erro ao fazer parse do reportData:", error);
      reportData = {};
    }

    return {
      success: true,
      data: {
        report: report[0],
        reportData,
      },
      message: "Relatório encontrado com sucesso!",
    };
  });

export const deleteReportAction = action
  .schema(deleteReportSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar se o relatório existe e pertence à clínica
    const existingReport = await db
      .select()
      .from(financialReportsTable)
      .where(
        and(
          eq(financialReportsTable.id, parsedInput.id),
          eq(financialReportsTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (existingReport.length === 0) {
      throw new Error("Relatório não encontrado");
    }

    // Excluir o relatório
    await db
      .delete(financialReportsTable)
      .where(
        and(
          eq(financialReportsTable.id, parsedInput.id),
          eq(financialReportsTable.clinicId, session.user.clinic.id),
        ),
      );

    return {
      success: true,
      message: "Relatório excluído com sucesso!",
    };
  });

// Schema para buscar resumo de transações
const getTransactionsSummarySchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const getTransactionsSummaryAction = action
  .schema(getTransactionsSummarySchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Construir filtros
    let whereConditions: any = eq(
      transactionsTable.clinicId,
      session.user.clinic.id,
    );

    if (parsedInput.startDate && parsedInput.endDate) {
      const startOfDay = new Date(parsedInput.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedInput.endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereConditions = and(
        whereConditions,
        gte(transactionsTable.createdAt, startOfDay),
        lte(transactionsTable.createdAt, endOfDay),
      );
    }

    // Buscar transações com dados relacionados
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
      .leftJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .where(whereConditions)
      .orderBy(desc(transactionsTable.createdAt));

    return {
      success: true,
      data: transactions,
      message: "Transações encontradas com sucesso!",
    };
  });
