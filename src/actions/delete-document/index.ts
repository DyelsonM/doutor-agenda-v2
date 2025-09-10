"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const action = createSafeActionClient();

const deleteDocumentSchema = z.object({
  id: z.string().uuid(),
});

export const deleteDocumentAction = action
  .schema(deleteDocumentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/authentication");
    }

    if (!session.user.clinic) {
      redirect("/clinic-form");
    }

    const { id } = parsedInput;

    await db.delete(documentsTable).where(eq(documentsTable.id, id));

    revalidatePath("/documents");
    return { success: true, message: "Documento excluído com sucesso!" };
  });
