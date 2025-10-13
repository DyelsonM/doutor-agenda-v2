import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import ReceivablesPageClient from "./_components/receivables-page-client";

export default async function ReceivablesPage() {
  const session = await getAuthSession();

  // Apenas administradores podem acessar contas a receber
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Buscar lista de médicos da clínica
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  return <ReceivablesPageClient doctors={doctors} />;
}
