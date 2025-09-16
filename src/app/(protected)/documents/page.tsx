import { and, eq } from "drizzle-orm";
import { FileText, Stethoscope, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  doctorsTable,
  documentsTable,
  documentTemplatesTable,
  patientsTable,
} from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { AddDocumentButton } from "./_components/add-document-button";
import { DocumentsTableClient } from "./_components/documents-table-client";

const DocumentsPage = async () => {
  const session = await getAuthSession();

  let documentsFilter;
  let patientsFilter;
  let doctorsFilter;

  if (session.user.role === "admin") {
    // Admin vê todos os documentos da clínica
    documentsFilter = eq(documentsTable.clinicId, session.user.clinic.id);
    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = eq(doctorsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas seus documentos
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      redirect("/unauthorized");
    }

    documentsFilter = and(
      eq(documentsTable.clinicId, session.user.clinic.id),
      eq(documentsTable.doctorId, doctorId),
    );
    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = and(
      eq(doctorsTable.clinicId, session.user.clinic.id),
      eq(doctorsTable.id, doctorId),
    );
  }

  const [patients, doctors, documents, templates] = await Promise.all([
    db.query.patientsTable.findMany({
      where: patientsFilter,
    }),
    db.query.doctorsTable.findMany({
      where: doctorsFilter,
    }),
    db.query.documentsTable.findMany({
      where: documentsFilter,
      with: {
        patient: true,
        doctor: true,
        appointment: true,
      },
      orderBy: (documents, { desc }) => [desc(documents.createdAt)],
    }),
    db.query.documentTemplatesTable.findMany({
      where: eq(documentTemplatesTable.clinicId, session.user.clinic.id),
      orderBy: (templates, { asc }) => [asc(templates.name)],
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
          <AddDocumentButton
            patients={patients}
            doctors={doctors}
            templates={templates}
          />
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
              <DocumentsTableClient
                documents={documents}
                userRole={session.user.role}
              />
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DocumentsPage;
