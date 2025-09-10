import { eq } from "drizzle-orm";
import { FileText, Stethoscope, Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable, documentsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddDocumentButton } from "./_components/add-document-button";
import { documentsTableColumns } from "./_components/table-columns";

const DocumentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const [patients, doctors, documents] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
    db.query.documentsTable.findMany({
      where: eq(documentsTable.clinicId, session.user.clinic.id),
      with: {
        patient: true,
        doctor: true,
        appointment: true,
      },
      orderBy: (documents, { desc }) => [desc(documents.createdAt)],
    }),
  ]);

  // Estatísticas dos documentos
  const documentStats = {
    total: documents.length,
    anamnesis: documents.filter((d) => d.type === "anamnesis").length,
    prescriptions: documents.filter((d) => d.type === "prescription").length,
    certificates: documents.filter((d) => d.type === "medical_certificate")
      .length,
    examRequests: documents.filter((d) => d.type === "exam_request").length,
    reports: documents.filter((d) => d.type === "medical_report").length,
    others: documents.filter((d) => d.type === "other").length,
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Documentos Médicos</PageTitle>
          </div>
          <PageDescription>
            Gerencie todos os documentos médicos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDocumentButton patients={patients} doctors={doctors} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Documentos
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anamneses</CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documentStats.anamnesis}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <Stethoscope className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documentStats.prescriptions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atestados</CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documentStats.certificates}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={documents} columns={documentsTableColumns} />
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DocumentsPage;
