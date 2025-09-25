"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { medicalSpecialtiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertMedicalSpecialtySchema } from "./schema";

export const upsertMedicalSpecialty = actionClient
  .schema(upsertMedicalSpecialtySchema)
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

    const { id, ...specialtyData } = parsedInput;

    if (id) {
      // Atualizar especialidade existente
      await db
        .update(medicalSpecialtiesTable)
        .set({
          ...specialtyData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(medicalSpecialtiesTable.id, id),
            eq(medicalSpecialtiesTable.clinicId, session.user.clinic.id),
          ),
        );
    } else {
      // Verificar se já existe uma especialidade com o mesmo nome na mesma categoria
      const existingSpecialty =
        await db.query.medicalSpecialtiesTable.findFirst({
          where: and(
            eq(medicalSpecialtiesTable.clinicId, session.user.clinic.id),
            eq(medicalSpecialtiesTable.name, specialtyData.name),
            eq(medicalSpecialtiesTable.category, specialtyData.category),
          ),
        });

      if (existingSpecialty) {
        throw new Error(
          "Já existe uma especialidade com este nome nesta categoria.",
        );
      }

      // Criar nova especialidade
      await db.insert(medicalSpecialtiesTable).values({
        ...specialtyData,
        clinicId: session.user.clinic.id,
        code: specialtyData.name.toLowerCase().replace(/\s+/g, "_"), // Gerar código automaticamente
      });
    }

    revalidatePath("/medical-specialties");
  });
