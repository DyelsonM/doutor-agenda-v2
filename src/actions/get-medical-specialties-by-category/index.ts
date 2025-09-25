"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { medicalSpecialtiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getMedicalSpecialtiesByCategory = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const specialties = await db.query.medicalSpecialtiesTable.findMany({
    where: and(
      eq(medicalSpecialtiesTable.clinicId, session.user.clinic.id),
      eq(medicalSpecialtiesTable.isActive, true),
    ),
    orderBy: (specialties, { asc }) => [
      asc(specialties.category),
      asc(specialties.name),
    ],
  });

  // Organizar por categoria
  const specialtiesByCategory = specialties.reduce(
    (acc, specialty) => {
      if (!acc[specialty.category]) {
        acc[specialty.category] = [];
      }
      acc[specialty.category].push({
        code: specialty.code, // Manter código para compatibilidade com o formulário de médicos
        name: specialty.name,
      });
      return acc;
    },
    {} as Record<string, { code: string; name: string }[]>,
  );

  // Converter para formato esperado pelo formulário
  const categories = Object.entries(specialtiesByCategory).map(
    ([categoryName, specialtiesList]) => ({
      categoryKey: categoryName.toLowerCase().replace(/\s+/g, "_"),
      categoryName,
      specialties: specialtiesList,
    }),
  );

  return categories;
});
