"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";
import { actionClient } from "@/lib/next-safe-action";

const exportTemplateSchema = z.object({
  id: z.string().uuid(),
});

export const exportTemplateAction = actionClient
  .schema(exportTemplateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();
    const { id } = parsedInput;

    // Buscar o template
    const template = await db.query.documentTemplatesTable.findFirst({
      where: eq(documentTemplatesTable.id, id),
      with: {
        clinic: true,
      },
    });

    if (!template) {
      throw new Error("Template não encontrado");
    }

    // Verificar se o template pertence à clínica do usuário
    if (template.clinicId !== session.user.clinic.id) {
      throw new Error("Acesso negado");
    }

    return {
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
        content: template.content,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
      clinic: {
        name: template.clinic.name,
        logoUrl: template.clinic.logoUrl,
      },
    };
  });
