"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { cashOperationsTable, dailyCashTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";
import { actionClient } from "@/lib/next-safe-action";

// Schema para abertura de caixa
const openCashSchema = z.object({
  openingAmount: z
    .number()
    .min(0, "Valor inicial deve ser maior ou igual a zero"),
  openingNotes: z.string().optional(),
  identifier: z.string().optional().nullable(),
});

// Schema para fechamento de caixa
const closeCashSchema = z.object({
  dailyCashId: z.string().min(1, "ID do caixa é obrigatório"),
  closingAmount: z
    .number()
    .min(-999999999, "Valor muito baixo")
    .max(999999999, "Valor muito alto"),
  closingNotes: z.string().optional(),
});

// Schema para operações de caixa (entrada/saída)
const cashOperationSchema = z.object({
  dailyCashId: z.string().min(1, "ID do caixa é obrigatório"),
  type: z.enum(["cash_in", "cash_out", "adjustment"]),
  amountInCents: z
    .number()
    .min(1, "Valor deve ser maior que zero")
    .int("Valor deve ser um número inteiro"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethod: z.enum(["stripe", "cash", "pix", "bank_transfer", "other"]),
  transactionId: z.string().uuid().optional(),
  metadata: z.string().optional(),
});

// Schema para buscar caixa do dia
const getDailyCashSchema = z.object({
  date: z.string().optional(), // Data no formato YYYY-MM-DD
});

// Schema para buscar caixa aberto
const getOpenCashSchema = z.object({
  date: z.string().optional(), // Data no formato YYYY-MM-DD
});

// Action para abrir caixa
export const openCashAction = actionClient
  .schema(openCashSchema)
  .action(async (data) => {
    try {
      const session = await getAuthSession();
      const clinicId = session.user.clinic.id;
      const userId = session.user.id;

      // Verificar se já existe caixa aberto para hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingCash = await db.query.dailyCashTable.findFirst({
        where: and(
          eq(dailyCashTable.clinicId, clinicId),
          eq(dailyCashTable.status, "open"),
          gte(dailyCashTable.date, today),
          lte(dailyCashTable.date, tomorrow),
        ),
      });

      if (existingCash) {
        throw new Error("Já existe um caixa aberto para hoje");
      }

      // Criar novo caixa
      const [newCash] = await db
        .insert(dailyCashTable)
        .values({
          clinicId,
          userId,
          identifier: data.parsedInput.identifier,
          date: today,
          openingTime: new Date(),
          openingAmount: data.parsedInput.openingAmount,
          openingNotes: data.parsedInput.openingNotes,
          status: "open",
        })
        .returning();

      // Criar operação de abertura
      await db.insert(cashOperationsTable).values({
        dailyCashId: newCash.id,
        userId,
        type: "opening",
        amountInCents: data.parsedInput.openingAmount || 0,
        description: `Abertura de caixa - Valor inicial: R$ ${((data.parsedInput.openingAmount || 0) / 100).toFixed(2)}`,
      });

      return {
        success: true,
        data: newCash,
      };
    } catch (error) {
      console.error("Error in openCashAction:", error); // Debug log
      throw error;
    }
  });

// Action para fechar caixa
export const closeCashAction = actionClient
  .schema(closeCashSchema)
  .action(async (data) => {
    try {
      // Extrair dados do parsedInput (next-safe-action estrutura)
      const { dailyCashId, closingAmount, closingNotes } = data.parsedInput;

      const session = await getAuthSession();
      const userId = session.user.id;

      // Validar dados essenciais
      if (!dailyCashId) {
        throw new Error("ID do caixa é obrigatório");
      }
      if (typeof closingAmount !== "number") {
        throw new Error("Valor de fechamento deve ser um número");
      }

      // Buscar o caixa
      const cash = await db.query.dailyCashTable.findFirst({
        where: and(
          eq(dailyCashTable.id, dailyCashId),
          eq(dailyCashTable.status, "open"),
        ),
        with: {
          operations: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!cash) {
        throw new Error("Caixa não encontrado ou já fechado");
      }

      // Calcular valores esperados
      const totalCashIn = cash.operations
        .filter((op) => op.type === "cash_in")
        .reduce((sum, op) => sum + op.amountInCents, 0);

      const totalCashOut = cash.operations
        .filter((op) => op.type === "cash_out")
        .reduce((sum, op) => sum + op.amountInCents, 0);

      const expectedAmount = cash.openingAmount + totalCashIn - totalCashOut;
      const difference = closingAmount - expectedAmount;

      // Para o caixa diário independente, receitas e despesas são baseadas apenas nas operações de caixa
      const totalRevenue = totalCashIn; // Receitas = entradas de dinheiro
      const totalExpenses = totalCashOut; // Despesas = saídas de dinheiro

      // Atualizar caixa

      const [updatedCash] = await db
        .update(dailyCashTable)
        .set({
          closingTime: new Date(),
          closingAmount: closingAmount,
          expectedAmount,
          difference,
          totalRevenue,
          totalExpenses,
          totalCashIn,
          totalCashOut,
          closingNotes: closingNotes,
          status: "closed",
        })
        .where(eq(dailyCashTable.id, dailyCashId))
        .returning();

      // Criar operação de fechamento

      await db.insert(cashOperationsTable).values({
        dailyCashId: dailyCashId,
        userId,
        type: "closing",
        amountInCents: closingAmount || 0,
        description: `Fechamento de caixa - Valor final: R$ ${((closingAmount || 0) / 100).toFixed(2)}`,
      });

      return {
        success: true,
        data: updatedCash,
      };
    } catch (error) {
      console.error("Error closing cash:", error);
      throw error;
    }
  });

// Action para adicionar operação de caixa
export const addCashOperationAction = actionClient
  .schema(cashOperationSchema)
  .action(async (data) => {
    try {
      // Extrair dados do parsedInput (next-safe-action estrutura)
      const {
        dailyCashId,
        type,
        amountInCents,
        description,
        paymentMethod,
        transactionId,
        metadata,
      } = data.parsedInput;

      const session = await getAuthSession();
      const userId = session.user.id;

      // Verificar se o caixa existe e está aberto
      const cash = await db.query.dailyCashTable.findFirst({
        where: and(
          eq(dailyCashTable.id, dailyCashId),
          eq(dailyCashTable.status, "open"),
        ),
      });

      if (!cash) {
        throw new Error("Caixa não encontrado ou já fechado");
      }

      // Criar operação
      const [operation] = await db
        .insert(cashOperationsTable)
        .values({
          dailyCashId: dailyCashId,
          userId,
          type: type,
          amountInCents: amountInCents || 0,
          description: description,
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          metadata: metadata,
        })
        .returning();

      // Atualizar totais do caixa
      const operationType = type === "cash_in" ? "totalCashIn" : "totalCashOut";
      await db
        .update(dailyCashTable)
        .set({
          [operationType]: sql`${dailyCashTable[operationType]} + ${amountInCents}`,
        })
        .where(eq(dailyCashTable.id, dailyCashId));

      return {
        success: true,
        data: operation,
      };
    } catch (error) {
      console.error("Error adding operation:", error);
      throw error;
    }
  });

// Action para buscar caixa do dia
export const getDailyCashAction = actionClient
  .schema(getDailyCashSchema)
  .action(async (data) => {
    const session = await getAuthSession();
    const clinicId = session.user.clinic.id;

    let targetDate: Date;
    if (data.date) {
      targetDate = new Date(data.date);
    } else {
      targetDate = new Date();
    }
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const cash = await db.query.dailyCashTable.findFirst({
      where: and(
        eq(dailyCashTable.clinicId, clinicId),
        gte(dailyCashTable.date, targetDate),
        lte(dailyCashTable.date, nextDay),
      ),
      with: {
        operations: {
          with: {
            user: true,
            transaction: true,
          },
          orderBy: [desc(cashOperationsTable.createdAt)],
        },
        user: true,
      },
      orderBy: [desc(dailyCashTable.createdAt)],
    });

    return {
      success: true,
      data: cash,
    };
  });

// Action para buscar caixa aberto do dia
export const getOpenCashAction = actionClient
  .schema(getOpenCashSchema)
  .action(async (data) => {
    const session = await getAuthSession();
    const clinicId = session.user.clinic.id;

    let targetDate: Date;
    if (data.date) {
      targetDate = new Date(data.date);
    } else {
      targetDate = new Date();
    }
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Primeiro, vamos buscar qualquer caixa do dia para debug
    const anyCash = await db.query.dailyCashTable.findFirst({
      where: and(
        eq(dailyCashTable.clinicId, clinicId),
        gte(dailyCashTable.date, targetDate),
        lte(dailyCashTable.date, nextDay),
      ),
      with: {
        user: true,
      },
      orderBy: [desc(dailyCashTable.createdAt)],
    });

    // Agora buscar especificamente caixa aberto
    const cash = await db.query.dailyCashTable.findFirst({
      where: and(
        eq(dailyCashTable.clinicId, clinicId),
        eq(dailyCashTable.status, "open"),
        gte(dailyCashTable.date, targetDate),
        lte(dailyCashTable.date, nextDay),
      ),
      with: {
        operations: {
          with: {
            user: true,
          },
          orderBy: [desc(cashOperationsTable.createdAt)],
        },
        user: true,
      },
      orderBy: [desc(dailyCashTable.createdAt)],
    });

    return {
      success: true,
      data: cash,
    };
  });

// Action para buscar histórico de caixas
export const getCashHistoryAction = actionClient
  .schema(
    z.object({
      limit: z.number().min(1).max(100).default(30),
      offset: z.number().min(0).default(0),
    }),
  )
  .action(async (data) => {
    const session = await getAuthSession();
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
      limit: data.limit,
      offset: data.offset,
    });

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyCashTable)
      .where(eq(dailyCashTable.clinicId, clinicId));

    return {
      success: true,
      data: {
        cashHistory,
        totalCount: totalCount[0]?.count || 0,
      },
    };
  });

// Schema para exclusão de caixa
const deleteCashSchema = z.object({
  cashId: z.string().min(1, "ID do caixa é obrigatório"),
});

// Action para excluir caixa
export const deleteCashAction = actionClient
  .schema(deleteCashSchema)
  .action(async (data) => {
    try {
      // Extrair dados do parsedInput (next-safe-action estrutura)
      const { cashId } = data.parsedInput;

      const session = await getAuthSession();
      const userId = session.user.id;
      const clinicId = session.user.clinic.id;

      // Verificar se o caixa existe e pertence à clínica do usuário
      const cash = await db.query.dailyCashTable.findFirst({
        where: and(
          eq(dailyCashTable.id, cashId),
          eq(dailyCashTable.clinicId, clinicId),
        ),
        with: {
          operations: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!cash) {
        throw new Error(
          "Caixa não encontrado ou você não tem permissão para excluí-lo",
        );
      }

      // Verificar se o caixa está fechado (não permitir exclusão de caixas abertos)
      if (cash.status === "open") {
        throw new Error(
          "Não é possível excluir um caixa aberto. Feche o caixa primeiro.",
        );
      }

      // Excluir operações relacionadas primeiro (devido às foreign keys)
      if (cash.operations.length > 0) {
        await db
          .delete(cashOperationsTable)
          .where(eq(cashOperationsTable.dailyCashId, cashId));
      }

      // Excluir o caixa
      await db.delete(dailyCashTable).where(eq(dailyCashTable.id, cashId));

      return {
        success: true,
        data: { deletedCashId: cashId },
      };
    } catch (error) {
      console.error("Error deleting cash:", error);
      throw error;
    }
  });

// Action temporária para debug de caixa (sem transações financeiras)
export const debugCashAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    const session = await getAuthSession();
    const clinicId = session.user.clinic.id;

    // Buscar caixas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCash = await db.query.dailyCashTable.findMany({
      where: and(
        eq(dailyCashTable.clinicId, clinicId),
        gte(dailyCashTable.date, sevenDaysAgo),
      ),
      with: {
        operations: {
          with: {
            user: true,
          },
          orderBy: [desc(cashOperationsTable.createdAt)],
        },
        user: true,
      },
      orderBy: [desc(dailyCashTable.date)],
      limit: 10,
    });

    return {
      success: true,
      data: {
        recentCash: recentCash,
        recentCashCount: recentCash.length,
      },
    };
  });
