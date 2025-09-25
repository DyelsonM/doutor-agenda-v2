"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const deleteGoldClientSchema = z.object({
  id: z.string().uuid(),
});

export const deleteGoldClient = actionClient
  .schema(deleteGoldClientSchema)
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

    const { id } = parsedInput;

    // Verificar se o cliente ouro pertence à clínica do usuário
    const goldClient = await db
      .select()
      .from(goldClientsTable)
      .where(
        and(
          eq(goldClientsTable.id, id),
          eq(goldClientsTable.clinicId, session.user.clinic.id),
        ),
      )
      .limit(1);

    if (goldClient.length === 0) {
      throw new Error(
        "Cliente ouro não encontrado ou não pertence à sua clínica",
      );
    }

    // Deletar dependentes primeiro (devido à foreign key constraint)
    await db
      .delete(goldClientDependentsTable)
      .where(eq(goldClientDependentsTable.goldClientId, id));

    // Deletar o cliente ouro
    await db.delete(goldClientsTable).where(eq(goldClientsTable.id, id));

    revalidatePath("/gold-clients");
  });
