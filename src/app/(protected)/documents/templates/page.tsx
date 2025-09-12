import { eq } from "drizzle-orm";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { getAuthSession } from "@/lib/auth-utils";

import { AddTemplateButton } from "./_components/add-template-button";
import { TemplatesTable } from "./_components/templates-table";

export default async function DocumentTemplatesPage() {
  const session = await getAuthSession();

  const templates = await db.query.documentTemplatesTable.findMany({
    where: eq(documentTemplatesTable.clinicId, session.user.clinic.id),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

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

      <TemplatesTable templates={templates} />
    </PageContainer>
  );
}
