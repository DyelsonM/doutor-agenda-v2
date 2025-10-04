"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { upsertDocumentSchema } from "./schema";

const action = createSafeActionClient();

export const upsertDocumentAction = action
  .schema(upsertDocumentSchema)
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

    const { id, patientId, doctorId, type, title, content, patientEvolution } =
      parsedInput;

    if (id) {
      // Update existing document
      await db
        .update(documentsTable)
        .set({
          patientId,
          doctorId,
          type,
          title,
          content,
          patientEvolution,
          updatedAt: new Date(),
        })
        .where(eq(documentsTable.id, id));

      revalidatePath("/documents");
      return { success: true, message: "Documento atualizado com sucesso!" };
    } else {
      // Create new document
      await db.insert(documentsTable).values({
        clinicId: session.user.clinic.id,
        patientId,
        doctorId,
        type,
        title,
        content,
        patientEvolution,
      });

      revalidatePath("/documents");
      return { success: true, message: "Documento criado com sucesso!" };
    }
  });
