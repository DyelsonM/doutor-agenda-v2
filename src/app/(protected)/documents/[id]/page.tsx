import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { ArrowLeft, Edit } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { ExportDocumentButton } from "../_components/export-document-button";

const documentTypeLabels = {
  anamnesis: "Anamnese",
  prescription: "Receita",
  medical_certificate: "Atestado",
  exam_request: "Solicitação de Exame",
  medical_report: "Relatório Médico",
  other: "Outro",
};

const documentTypeColors = {
  anamnesis: "bg-blue-100 text-blue-800",
  prescription: "bg-green-100 text-green-800",
  medical_certificate: "bg-yellow-100 text-yellow-800",
  exam_request: "bg-purple-100 text-purple-800",
  medical_report: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DocumentPage = async ({ params }: DocumentPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { id } = await params;
  const document = await db.query.documentsTable.findFirst({
    where: eq(documentsTable.id, id),
    with: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          {/* antes: <div className="flex items-center gap-3"> */}
          <div className="flex flex-col items-start gap-2">
            <Link href="/documents">
              <Button variant="ghost" size="sm" className="px-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <PageTitle>{document.title}</PageTitle>
              </div>
              <PageDescription>
                Visualize os detalhes do documento médico
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>

        <PageActions>
          <ExportDocumentButton
            documentId={document.id}
            documentTitle={document.title}
          />
          <Link href={`/documents/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar Documento
            </Button>
          </Link>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                    {document.content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {document.patientEvolution && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {document.patientEvolution}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Tipo
                  </label>
                  <div className="mt-1">
                    <Badge className={documentTypeColors[document.type]}>
                      {documentTypeLabels[document.type]}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Paciente
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {document.patient.name}
                  </p>
                </div>

                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Médico
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {document.doctor.name}
                  </p>
                </div>

                {document.appointment && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Consulta
                    </label>
                    <p className="mt-1 text-sm font-medium">
                      {format(
                        new Date(document.appointment.date),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Criado em
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {format(
                      new Date(document.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Atualizado em
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    {document.updatedAt
                      ? format(
                          new Date(document.updatedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )
                      : "Nunca"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DocumentPage;
