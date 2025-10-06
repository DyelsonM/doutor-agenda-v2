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
import { receivablesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import {
  createReceivableSchema,
  deleteReceivableSchema,
  getReceivablesSchema,
  markReceivableAsReceivedSchema,
  updateReceivableSchema,
} from "./schema";

const action = createSafeActionClient();

export const createReceivableAction = action
  .schema(createReceivableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Criar data atual no timezone de São Paulo/Brasília
    const localTime = dayjs().tz("America/Sao_Paulo").toDate();

    const receivable = await db
      .insert(receivablesTable)
      .values({
        clinicId: session.user.clinic.id,
        description: parsedInput.description,
        amountInCents: parsedInput.amountInCents,
        category: parsedInput.category,
        dueDate: parsedInput.dueDate,
        patientName: parsedInput.patientName,
        patientDocument: parsedInput.patientDocument,
        invoiceNumber: parsedInput.invoiceNumber,
        notes: parsedInput.notes,
        status: "pending",
        createdAt: localTime,
      })
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/receivables");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: receivable[0],
      message: "Conta a receber criada com sucesso!",
    };
  });

export const updateReceivableAction = action
  .schema(updateReceivableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar a conta a receber
    const existingReceivable = await db.query.receivablesTable.findFirst({
      where: eq(receivablesTable.id, parsedInput.id),
    });

    if (!existingReceivable) {
      throw new Error("Conta a receber não encontrada");
    }

    // Verificar se a conta a receber pertence à clínica
    if (existingReceivable.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    const updatedReceivable = await db
      .update(receivablesTable)
      .set({
        description: parsedInput.description,
        amountInCents: parsedInput.amountInCents,
        category: parsedInput.category,
        dueDate: parsedInput.dueDate,
        patientName: parsedInput.patientName,
        patientDocument: parsedInput.patientDocument,
        invoiceNumber: parsedInput.invoiceNumber,
        notes: parsedInput.notes,
        updatedAt: new Date(),
      })
      .where(eq(receivablesTable.id, parsedInput.id))
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/receivables");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedReceivable[0],
      message: "Conta a receber atualizada com sucesso!",
    };
  });

export const markReceivableAsReceivedAction = action
  .schema(markReceivableAsReceivedSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar a conta a receber
    const existingReceivable = await db.query.receivablesTable.findFirst({
      where: eq(receivablesTable.id, parsedInput.id),
    });

    if (!existingReceivable) {
      throw new Error("Conta a receber não encontrada");
    }

    // Verificar se a conta a receber pertence à clínica
    if (existingReceivable.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    const receivedDate = parsedInput.receivedDate || new Date();

    const updatedReceivable = await db
      .update(receivablesTable)
      .set({
        status: "received",
        receivedDate: receivedDate,
        updatedAt: new Date(),
      })
      .where(eq(receivablesTable.id, parsedInput.id))
      .returning();

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/receivables");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedReceivable[0],
      message: "Conta a receber marcada como recebida!",
    };
  });

export const deleteReceivableAction = action
  .schema(deleteReceivableSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Verificar se a conta a receber pertence à clínica
    const existingReceivable = await db
      .select()
      .from(receivablesTable)
      .where(
        and(
          eq(receivablesTable.id, parsedInput.id),
          eq(receivablesTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (existingReceivable.length === 0) {
      throw new Error("Conta a receber não encontrada");
    }

    // Excluir a conta a receber
    await db
      .delete(receivablesTable)
      .where(eq(receivablesTable.id, parsedInput.id));

    // Revalidar páginas que mostram dados financeiros
    revalidatePath("/financial");
    revalidatePath("/financial/receivables");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { id: parsedInput.id },
      message: "Conta a receber excluída com sucesso!",
    };
  });

export const getReceivablesAction = action
  .schema(getReceivablesSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    let whereConditions = eq(receivablesTable.clinicId, session.user.clinic.id);

    // Filtros adicionais
    if (parsedInput.status) {
      whereConditions = and(
        whereConditions,
        eq(receivablesTable.status, parsedInput.status),
      )!;
    }

    if (parsedInput.category) {
      whereConditions = and(
        whereConditions,
        eq(receivablesTable.category, parsedInput.category),
      )!;
    }

    if (parsedInput.startDate) {
      whereConditions = and(
        whereConditions,
        gte(receivablesTable.dueDate, parsedInput.startDate),
      )!;
    }

    if (parsedInput.endDate) {
      whereConditions = and(
        whereConditions,
        lte(receivablesTable.dueDate, parsedInput.endDate),
      )!;
    }

    const receivables = await db.query.receivablesTable.findMany({
      where: whereConditions,
      orderBy: [desc(receivablesTable.dueDate)],
      limit: parsedInput.limit,
      offset: (parsedInput.page - 1) * parsedInput.limit,
    });

    const totalCount = await db
      .select({ count: count() })
      .from(receivablesTable)
      .where(whereConditions);

    return {
      success: true,
      data: {
        receivables,
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

export const getReceivablesSummaryAction = action
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
    let whereConditions = eq(receivablesTable.clinicId, session.user.clinic.id);

    if (parsedInput.startDate && parsedInput.endDate) {
      const startOfDay = new Date(parsedInput.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedInput.endDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereConditions = and(
        whereConditions,
        gte(receivablesTable.dueDate, startOfDay),
        lte(receivablesTable.dueDate, endOfDay),
      )!;
    }

    // Buscar contas a receber
    const receivables = await db
      .select({
        id: receivablesTable.id,
        description: receivablesTable.description,
        amountInCents: receivablesTable.amountInCents,
        category: receivablesTable.category,
        status: receivablesTable.status,
        dueDate: receivablesTable.dueDate,
        receivedDate: receivablesTable.receivedDate,
        patientName: receivablesTable.patientName,
      })
      .from(receivablesTable)
      .where(whereConditions)
      .orderBy(desc(receivablesTable.dueDate));

    return {
      success: true,
      data: receivables,
      message: "Contas a receber encontradas com sucesso!",
    };
  });
