"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { appointmentModalitiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";

const deleteAppointmentModalitySchema = z.object({
  id: z.string().uuid(),
});

export const deleteAppointmentModality = actionClient
  .schema(deleteAppointmentModalitySchema)
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

    await db
      .update(appointmentModalitiesTable)
      .set({ isActive: false })
      .where(
        and(
          eq(appointmentModalitiesTable.id, parsedInput.id),
          eq(appointmentModalitiesTable.clinicId, session.user.clinic.id),
        ),
      );

    revalidatePath("/appointment-modalities");
  });
