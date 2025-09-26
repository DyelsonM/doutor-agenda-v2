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
      if (!acc[modality.category]) {
        acc[modality.category] = [];
      }
      acc[modality.category].push({
        code: modality.code,
        name: modality.name,
      });
      return acc;
    },
    {} as Record<string, { code: string; name: string }[]>,
  );

  // Converter para o formato esperado pelos componentes
  return Object.entries(modalitiesByCategory).map(
    ([categoryName, modalities]) => ({
      categoryKey: categoryName.toLowerCase().replace(/\s+/g, "_"),
      categoryName,
      modalities,
    }),
  );
};
