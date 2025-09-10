import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
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

import { UpsertDocumentForm } from "../../_components/upsert-document-form";

interface EditDocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditDocumentPage = async ({ params }: EditDocumentPageProps) => {
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
  const [document, patients, doctors] = await Promise.all([
    db.query.documentsTable.findFirst({
      where: eq(documentsTable.id, id),
    }),
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
  ]);

  if (!document) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-3">
            <Link href={`/documents/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <PageTitle>Editar Documento</PageTitle>
              </div>
              <PageDescription>
                Edite as informações do documento médico
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="max-w-4xl">
          <UpsertDocumentForm
            patients={patients}
            doctors={doctors}
            document={document}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default EditDocumentPage;
