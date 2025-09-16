"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

import { db } from "@/db";
import { payablesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import {
  createPayableSchema,
  deletePayableSchema,
  getPayablesSchema,
  markPayableAsPaidSchema,
  updatePayableSchema,
} from "./schema";

const action = createSafeActionClient();

export const createPayableAction = action
  .schema(createPayableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Criar data atual no timezone de São Paulo/Brasília
    const localTime = dayjs().tz("America/Sao_Paulo").toDate();

    const payable = await db
      .insert(payablesTable)
      .values({
        clinicId: session.user.clinic.id,
        description: parsedInput.description,
        amountInCents: parsedInput.amountInCents,
        category: parsedInput.category,
        dueDate: parsedInput.dueDate,
        supplierName: parsedInput.supplierName,
        supplierDocument: parsedInput.supplierDocument,
        invoiceNumber: parsedInput.invoiceNumber,
        notes: parsedInput.notes,
        status: "pending",
        createdAt: localTime,
      })
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/payables");

    return {
      success: true,
      data: payable[0],
      message: "Conta a pagar criada com sucesso!",
    };
  });

export const updatePayableAction = action
  .schema(updatePayableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar a conta a pagar
    const existingPayable = await db.query.payablesTable.findFirst({
      where: eq(payablesTable.id, parsedInput.id),
    });

    if (!existingPayable) {
      throw new Error("Conta a pagar não encontrada");
    }

    // Verificar se a conta a pagar pertence à clínica
    if (existingPayable.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    const updatedPayable = await db
      .update(payablesTable)
      .set({
        description: parsedInput.description,
        amountInCents: parsedInput.amountInCents,
        category: parsedInput.category,
        dueDate: parsedInput.dueDate,
        supplierName: parsedInput.supplierName,
        supplierDocument: parsedInput.supplierDocument,
        invoiceNumber: parsedInput.invoiceNumber,
        notes: parsedInput.notes,
        updatedAt: new Date(),
      })
      .where(eq(payablesTable.id, parsedInput.id))
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/payables");

    return {
      success: true,
      data: updatedPayable[0],
      message: "Conta a pagar atualizada com sucesso!",
    };
  });

export const markPayableAsPaidAction = action
  .schema(markPayableAsPaidSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar a conta a pagar
    const existingPayable = await db.query.payablesTable.findFirst({
      where: eq(payablesTable.id, parsedInput.id),
    });

    if (!existingPayable) {
      throw new Error("Conta a pagar não encontrada");
    }

    // Verificar se a conta a pagar pertence à clínica
    if (existingPayable.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    const paidDate = parsedInput.paidDate || new Date();

    const updatedPayable = await db
      .update(payablesTable)
      .set({
        status: "paid",
        paidDate: paidDate,
        updatedAt: new Date(),
      })
      .where(eq(payablesTable.id, parsedInput.id))
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/payables");

    return {
      success: true,
      data: updatedPayable[0],
      message: "Conta a pagar marcada como paga!",
    };
  });

export const deletePayableAction = action
  .schema(deletePayableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar se a conta a pagar pertence à clínica
    const existingPayable = await db
      .select()
      .from(payablesTable)
      .where(
        and(
          eq(payablesTable.id, parsedInput.id),
          eq(payablesTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (existingPayable.length === 0) {
      throw new Error("Conta a pagar não encontrada");
    }

    // Excluir a conta a pagar
    await db.delete(payablesTable).where(eq(payablesTable.id, parsedInput.id));

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/payables");

    return {
      success: true,
      data: { id: parsedInput.id },
      message: "Conta a pagar excluída com sucesso!",
    };
  });

export const getPayablesAction = action
  .schema(getPayablesSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    let whereConditions = eq(payablesTable.clinicId, session.user.clinic.id);

    // Filtros adicionais
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

    if (parsedInput.startDate) {
      whereConditions = and(
        whereConditions,
        gte(payablesTable.dueDate, parsedInput.startDate),
      )!;
    }

    if (parsedInput.endDate) {
      whereConditions = and(
        whereConditions,
        lte(payablesTable.dueDate, parsedInput.endDate),
      )!;
    }

    const payables = await db.query.payablesTable.findMany({
      where: whereConditions,
      orderBy: [desc(payablesTable.dueDate)],
      limit: parsedInput.limit,
      offset: (parsedInput.page - 1) * parsedInput.limit,
    });

    const totalCount = await db
      .select({ count: count() })
      .from(payablesTable)
      .where(whereConditions);

    return {
      success: true,
      data: {
        payables,
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

export const getPayablesSummaryAction = action
  .schema(
    z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Construir filtros
    let whereConditions = eq(payablesTable.clinicId, session.user.clinic.id);

    if (parsedInput.startDate && parsedInput.endDate) {
      const startOfDay = new Date(parsedInput.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedInput.endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereConditions = and(
        whereConditions,
        gte(payablesTable.dueDate, startOfDay),
        lte(payablesTable.dueDate, endOfDay),
      )!;
    }

    // Buscar contas a pagar
    const payables = await db
      .select({
        id: payablesTable.id,
        description: payablesTable.description,
        amountInCents: payablesTable.amountInCents,
        category: payablesTable.category,
        status: payablesTable.status,
        dueDate: payablesTable.dueDate,
        paidDate: payablesTable.paidDate,
        supplierName: payablesTable.supplierName,
      })
      .from(payablesTable)
      .where(whereConditions)
      .orderBy(desc(payablesTable.dueDate));

    return {
      success: true,
      data: payables,
      message: "Contas a pagar encontradas com sucesso!",
    };
  });
