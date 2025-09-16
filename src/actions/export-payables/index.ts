"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { payablesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

const exportPayablesSchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
  period: z.enum(["daily", "monthly", "custom"]).default("custom"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
  category: z.string().optional(),
});

const action = createSafeActionClient();

export const exportPayablesAction = action
  .schema(exportPayablesSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Calcular datas baseadas no período
    let startDate: Date;
    let endDate: Date;

    if (parsedInput.period === "daily") {
      // Relatório diário - hoje
      const today = new Date();
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
      );
    } else if (parsedInput.period === "monthly") {
      // Relatório mensal - mês atual
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Período customizado
      startDate = parsedInput.startDate || new Date();
      endDate = parsedInput.endDate || new Date();
    }

    // Construir filtros
    let whereConditions = eq(payablesTable.clinicId, session.user.clinic.id);

    // Sempre aplicar filtro de data baseado no período calculado
    whereConditions = and(
      whereConditions,
      gte(payablesTable.dueDate, startDate),
      lte(payablesTable.dueDate, endDate),
    )!;

    if (parsedInput.status) {
      whereConditions = and(
        whereConditions,
        eq(payablesTable.status, parsedInput.status),
      )!;
    }

    if (parsedInput.category) {
      whereConditions = and(
        whereConditions,
        eq(payablesTable.category, parsedInput.category),
      )!;
    }

    // Buscar contas a pagar
    const payables = await db.query.payablesTable.findMany({
      where: whereConditions,
      orderBy: [payablesTable.dueDate],
    });

    // Preparar dados para exportação
    const exportData = payables.map((payable) => ({
      id: payable.id,
      description: payable.description,
      amount: payable.amountInCents / 100, // Converter de centavos para reais
      category: payable.category,
      status: payable.status,
      dueDate: payable.dueDate,
      paidDate: payable.paidDate,
      supplierName: payable.supplierName,
      supplierDocument: payable.supplierDocument,
      invoiceNumber: payable.invoiceNumber,
      notes: payable.notes,
      createdAt: payable.createdAt,
    }));

    // Calcular estatísticas
    const stats = {
      total: payables.reduce((sum, p) => sum + p.amountInCents, 0) / 100,
      pending:
        payables
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amountInCents, 0) / 100,
      paid:
        payables
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + p.amountInCents, 0) / 100,
      overdue:
        payables
          .filter(
            (p) => p.status === "pending" && new Date(p.dueDate) < new Date(),
          )
          .reduce((sum, p) => sum + p.amountInCents, 0) / 100,
      count: payables.length,
    };

    // Gerar nome do arquivo
    let filename: string;

    if (parsedInput.period === "daily") {
      const today = new Date().toISOString().split("T")[0];
      filename = `contas_a_pagar_diario_${today}.${parsedInput.format}`;
    } else if (parsedInput.period === "monthly") {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      filename = `contas_a_pagar_mensal_${year}-${month}.${parsedInput.format}`;
    } else {
      const dateRange =
        parsedInput.startDate && parsedInput.endDate
          ? `_${parsedInput.startDate.toISOString().split("T")[0]}_${parsedInput.endDate.toISOString().split("T")[0]}`
          : "";
      filename = `contas_a_pagar_custom${dateRange}.${parsedInput.format}`;
    }

    return {
      success: true,
      data: {
        payables: exportData,
        stats,
        period: {
          type: parsedInput.period,
          startDate,
          endDate,
        },
        filters: {
          status: parsedInput.status,
          category: parsedInput.category,
        },
      },
      format: parsedInput.format,
      filename,
    };
  });
