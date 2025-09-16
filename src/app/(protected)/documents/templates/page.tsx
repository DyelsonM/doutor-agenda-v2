import { and, eq } from "drizzle-orm";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import {
  doctorsTable,
  documentTemplatesTable,
  patientsTable,
} from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { AddTemplateButton } from "./_components/add-template-button";
import { PredefinedTemplates } from "./_components/predefined-templates";
import { TemplatesTable } from "./_components/templates-table";

export default async function DocumentTemplatesPage() {
  const session = await getAuthSession();

  let doctorsFilter;
  let patientsFilter;

  if (session.user.role === "admin") {
    // Admin vê todos os dados da clínica
    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = eq(doctorsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas seus dados
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      return null;
    }

    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = and(
      eq(doctorsTable.clinicId, session.user.clinic.id),
      eq(doctorsTable.id, doctorId),
    );
  }

  const [templates, patients, doctors] = await Promise.all([
    db.query.documentTemplatesTable.findMany({
      where: eq(documentTemplatesTable.clinicId, session.user.clinic.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
    db.query.patientsTable.findMany({
      where: patientsFilter,
    }),
    db.query.doctorsTable.findMany({
      where: doctorsFilter,
    }),
  ]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="outline" size="sm">
              ← Voltar para Documentos
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Templates de Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie os templates de documentos da sua clínica
            </p>
          </div>
        </div>
        <AddTemplateButton />
      </div>

      <div className="space-y-8">
        {/* Templates pré-definidos */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Pré-definidos</CardTitle>
            <p className="text-muted-foreground text-sm">
              Use templates estruturados como base para criar seus próprios
              templates personalizados
            </p>
          </CardHeader>
          <CardContent>
            <PredefinedTemplates patients={patients} doctors={doctors} />
          </CardContent>
        </Card>

        {/* Templates personalizados da clínica */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Personalizados</CardTitle>
            <p className="text-muted-foreground text-sm">
              Templates criados especificamente para sua clínica
            </p>
          </CardHeader>
          <CardContent>
            <TemplatesTable templates={templates} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
