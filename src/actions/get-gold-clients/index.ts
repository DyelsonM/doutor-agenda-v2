"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

export const getGoldClients = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const goldClients = await db
    .select()
    .from(goldClientsTable)
    .where(eq(goldClientsTable.clinicId, session.user.clinic.id))
    .orderBy(goldClientsTable.createdAt);

  // Buscar dependentes para cada cliente ouro
  const goldClientsWithDependents = await Promise.all(
    goldClients.map(async (client) => {
      const dependents = await db
        .select()
        .from(goldClientDependentsTable)
        .where(eq(goldClientDependentsTable.goldClientId, client.id));

      return {
        ...client,
        dependents,
      };
    }),
  );

  return goldClientsWithDependents;
});
