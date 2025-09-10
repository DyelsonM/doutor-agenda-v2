import { eq } from "drizzle-orm";
import { ArrowLeft, FileText } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AnamnesisTemplate } from "../_components/anamnesis-template";

const TemplatesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-3">
            <Link href="/documents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-semibold">Templates de Anamnese</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Selecione um template de anamnese para começar a criar seu
              documento médico. Os templates incluem campos pré-formatados para
              facilitar o preenchimento.
            </p>
            <AnamnesisTemplate patients={patients} doctors={doctors} />
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default TemplatesPage;
