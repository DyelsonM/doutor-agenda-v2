"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { partnerExamsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPartnerExamSchema } from "./schema";

export const upsertPartnerExam = actionClient
  .schema(upsertPartnerExamSchema)
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

    // Inserir ou atualizar o exame
    const [exam] = await db
      .insert(partnerExamsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
      })
      .onConflictDoUpdate({
        target: [partnerExamsTable.id],
        set: {
          ...parsedInput,
        },
      })
      .returning();

    revalidatePath("/partners");
  });
