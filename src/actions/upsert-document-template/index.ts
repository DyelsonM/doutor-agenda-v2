"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import { upsertDocumentTemplateSchema } from "./schema";

export const upsertDocumentTemplateAction = actionClient
  .schema(upsertDocumentTemplateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    if (!session?.user?.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    const { id, name, type, content, isActive } = parsedInput;

    if (id) {
      // Atualizar template existente
      await db
        .update(documentTemplatesTable)
        .set({
          name,
          type,
          content,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(documentTemplatesTable.id, id));
    } else {
      // Criar novo template
      await db.insert(documentTemplatesTable).values({
        clinicId: session.user.clinic.id,
        name,
        type,
        content,
        isActive,
      });
    }

    revalidatePath("/documents/templates");

    return {
      message: id
        ? "Template atualizado com sucesso!"
        : "Template criado com sucesso!",
    };
  });
