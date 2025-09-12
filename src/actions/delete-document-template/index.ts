"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const deleteDocumentTemplateSchema = z.object({
  id: z.string().uuid(),
});

export const deleteDocumentTemplateAction = actionClient
  .schema(deleteDocumentTemplateSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    await db
      .delete(documentTemplatesTable)
      .where(eq(documentTemplatesTable.id, id));

    revalidatePath("/documents/templates");

    return {
      message: "Template excluído com sucesso!",
    };
  });
