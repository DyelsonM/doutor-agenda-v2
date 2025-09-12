"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { createClinicSchema } from "./schema";

const action = createSafeActionClient();

export const createClinicAction = action
  .schema(createClinicSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const {
      name,
      logoUrl,
      description,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      cnpj,
      crmNumber,
    } = parsedInput;

    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        name,
        logoUrl: logoUrl || null,
        description: description || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || "Brasil",
        cnpj: cnpj || null,
        crmNumber: crmNumber || null,
      })
      .returning();

    await db.insert(usersToClinicsTable).values({
      userId: session.user.id,
      clinicId: clinic.id,
    });
    redirect("/dashboard");
  });

// Manter compatibilidade com a função existente
export const createClinic = async (name: string, logoUrl?: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const [clinic] = await db
    .insert(clinicsTable)
    .values({
      name,
      logoUrl: logoUrl || null,
    })
    .returning();
  await db.insert(usersToClinicsTable).values({
    userId: session.user.id,
    clinicId: clinic.id,
  });
  redirect("/dashboard");
};
