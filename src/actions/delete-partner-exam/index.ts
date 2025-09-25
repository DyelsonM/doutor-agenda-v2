"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { partnerExamsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deletePartnerExamSchema = z.object({
  id: z.string().uuid(),
});

export const deletePartnerExam = actionClient
  .schema(deletePartnerExamSchema)
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

    // Deletar o exame
    await db
      .delete(partnerExamsTable)
      .where(eq(partnerExamsTable.id, parsedInput.id));

    revalidatePath("/partners");
  });
