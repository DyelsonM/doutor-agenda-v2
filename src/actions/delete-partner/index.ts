"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { partnersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deletePartnerSchema = z.object({
  id: z.string().uuid(),
});

export const deletePartner = actionClient
  .schema(deletePartnerSchema)
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

    // Deletar o parceiro
    await db.delete(partnersTable).where(eq(partnersTable.id, parsedInput.id));

    revalidatePath("/partners");
  });
