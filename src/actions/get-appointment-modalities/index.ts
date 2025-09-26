"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { appointmentModalitiesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getAppointmentModalities = async () => {
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

  return modalities;
};
