"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { upsertGoldClientSchema } from "./schema";

export const upsertGoldClient = actionClient
  .schema(upsertGoldClientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Função para converter string DD/MM/YYYY para Date
    const parseDate = (dateString: string | undefined): Date | null => {
      if (!dateString || dateString.length !== 10) return null;
      
      const [day, month, year] = dateString.split("/");
      if (!day || !month || !year) return null;
      
      // Criar data no formato YYYY-MM-DD para evitar problemas de timezone
      const date = new Date(`${year}-${month}-${day}`);
      
      // Validar se a data é válida
      if (isNaN(date.getTime())) return null;
      
      return date;
    };

    const { dependents, ...goldClientData } = parsedInput;

    // Converter data de nascimento do titular
    const holderBirthDate = parseDate(goldClientData.holderBirthDate);

    // Converter datas de nascimento dos dependentes
    const formattedDependents = dependents?.map((dep) => ({
      ...dep,
      birthDate: parseDate(dep.birthDate),
    }));

    // Inserir ou atualizar o cliente ouro
    const [goldClient] = await db
      .insert(goldClientsTable)
      .values({
        ...goldClientData,
        holderBirthDate,
        id: goldClientData.id,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [goldClientsTable.id],
        set: {
          ...goldClientData,
          holderBirthDate,
        },
      })
      .returning();

    // Se há dependentes, inserir/atualizar eles
    if (formattedDependents && formattedDependents.length > 0) {
      // Primeiro, deletar dependentes existentes se estivermos atualizando
      if (goldClientData.id) {
        await db
          .delete(goldClientDependentsTable)
          .where(eq(goldClientDependentsTable.goldClientId, goldClient.id));
      }

      // Inserir os novos dependentes
      await db.insert(goldClientDependentsTable).values(
        formattedDependents.map((dependent) => ({
          ...dependent,
          goldClientId: goldClient.id,
        })),
      );
    }

    revalidatePath("/gold-clients");
  });
