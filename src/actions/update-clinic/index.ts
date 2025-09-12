"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import { updateClinicSchema } from "./schema";

const action = createSafeActionClient();

export const updateClinicAction = action
  .schema(updateClinicSchema)
  .action(async ({ parsedInput }) => {
    const session = await getAuthSession();

    const { clinicId, ...otherFields } = parsedInput;

    if (!session.user.clinic || session.user.clinic.id !== clinicId) {
      throw new Error("Acesso negado");
    }

    const updateData = {
      ...otherFields,
      logoUrl: otherFields.logoUrl || null,
      description: otherFields.description || null,
      email: otherFields.email || null,
      phone: otherFields.phone || null,
      website: otherFields.website || null,
      address: otherFields.address || null,
      city: otherFields.city || null,
      state: otherFields.state || null,
      zipCode: otherFields.zipCode || null,
      country: otherFields.country || "Brasil",
      cnpj: otherFields.cnpj || null,
      crmNumber: otherFields.crmNumber || null,
    };

    const [updatedClinic] = await db
      .update(clinicsTable)
      .set(updateData)
      .where(eq(clinicsTable.id, clinicId))
      .returning();

    return {
      success: true,
      clinic: updatedClinic,
    };
  });
