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

    const { dependents, ...goldClientData } = parsedInput;

    // Inserir ou atualizar o cliente ouro
    const [goldClient] = await db
      .insert(goldClientsTable)
      .values({
        ...goldClientData,
        id: goldClientData.id,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [goldClientsTable.id],
        set: {
          ...goldClientData,
        },
      })
      .returning();

    // Se há dependentes, inserir/atualizar eles
    if (dependents && dependents.length > 0) {
      // Primeiro, deletar dependentes existentes se estivermos atualizando
      if (goldClientData.id) {
        await db
          .delete(goldClientDependentsTable)
          .where(eq(goldClientDependentsTable.goldClientId, goldClient.id));
      }

      // Inserir os novos dependentes
      await db.insert(goldClientDependentsTable).values(
        dependents.map((dependent) => ({
          ...dependent,
          goldClientId: goldClient.id,
        })),
      );
    }

    revalidatePath("/gold-clients");
  });
