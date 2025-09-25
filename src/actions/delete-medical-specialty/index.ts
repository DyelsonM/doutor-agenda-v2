"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { medicalSpecialtiesTable, doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteMedicalSpecialtySchema = z.object({
  id: z.string().uuid({
    message: "ID da especialidade é obrigatório.",
  }),
});

export const deleteMedicalSpecialty = actionClient
  .schema(deleteMedicalSpecialtySchema)
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

    // Verificar se a especialidade pertence à clínica
    const specialty = await db.query.medicalSpecialtiesTable.findFirst({
      where: and(
        eq(medicalSpecialtiesTable.id, parsedInput.id),
        eq(medicalSpecialtiesTable.clinicId, session.user.clinic.id),
      ),
    });

    if (!specialty) {
      throw new Error(
        "Especialidade não encontrada ou não pertence à sua clínica.",
      );
    }

    // Verificar se há médicos usando esta especialidade
    const doctorsUsingSpecialty = await db.query.doctorsTable.findMany({
      where: and(
        eq(doctorsTable.clinicId, session.user.clinic.id),
        eq(doctorsTable.specialty, specialty.code), // O código ainda é usado para referência dos médicos
      ),
    });

    if (doctorsUsingSpecialty.length > 0) {
      throw new Error(
        `Não é possível deletar esta especialidade pois ${doctorsUsingSpecialty.length} médico(s) ainda a utilizam.`,
      );
    }

    // Deletar a especialidade
    await db
      .delete(medicalSpecialtiesTable)
      .where(eq(medicalSpecialtiesTable.id, parsedInput.id));

    revalidatePath("/medical-specialties");
  });
