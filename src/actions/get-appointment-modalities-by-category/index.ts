"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { appointmentModalitiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getAppointmentModalitiesByCategory = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const modalities = await db.query.appointmentModalitiesTable.findMany({
    where: and(
      eq(appointmentModalitiesTable.clinicId, session.user.clinic.id),
      eq(appointmentModalitiesTable.isActive, true),
    ),
    orderBy: (modalities, { asc }) => [
      asc(modalities.category),
      asc(modalities.name),
    ],
  });

  // Agrupar por categoria
  const modalitiesByCategory = modalities.reduce(
    (acc, modality) => {
      // Verificar se a modalidade tem os campos necessários
      if (!modality.category || !modality.code || !modality.name) {
        console.warn("Modalidade com dados incompletos:", modality);
        return acc;
      }

      if (!acc[modality.category]) {
        acc[modality.category] = [];
      }
      acc[modality.category].push({
        code: modality.code.trim(),
        name: modality.name.trim(),
      });
      return acc;
    },
    {} as Record<string, { code: string; name: string }[]>,
  );

  // Converter para o formato esperado pelos componentes
  return Object.entries(modalitiesByCategory)
    .filter(([categoryName, modalities]) => {
      // Filtrar categorias vazias ou com dados inválidos
      return categoryName && modalities && modalities.length > 0;
    })
    .map(([categoryName, modalities]) => ({
      categoryKey: categoryName.toLowerCase().replace(/\s+/g, "_").trim(),
      categoryName: categoryName.trim(),
      modalities: modalities.filter(
        (modality) =>
          modality.code &&
          modality.name &&
          modality.code.trim() &&
          modality.name.trim(),
      ),
    }))
    .filter((category) => category.modalities.length > 0); // Filtrar categorias sem modalidades válidas
};
