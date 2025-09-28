import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import { dailyCashTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import { CashReport } from "./_components/cash-report";

interface CashDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function CashDetailsPage({
  params,
}: CashDetailsPageProps) {
  const { id } = await params;

  const cash = await db.query.dailyCashTable.findFirst({
    where: eq(dailyCashTable.id, id),
    with: {
      operations: {
        with: {
          user: true,
        },
        orderBy: [dailyCashTable.createdAt],
      },
      user: true,
    },
  });

  if (!cash) {
    return (
      <PageContainer>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Caixa não encontrado.</p>
          <Link href="/daily-cash">
            <Button className="mt-4">Voltar</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>
              Detalhes do Caixa
              {cash.identifier && (
                <span className="text-muted-foreground">
                  {" "}
                  - {cash.identifier}
                </span>
              )}
              {" - "}
              {cash.date
                ? format(new Date(cash.date), "dd/MM/yyyy", { locale: ptBR })
                : "Data não disponível"}
            </PageTitle>
          </div>
          <PageDescription>
            Visualize todos os detalhes e operações do caixa diário
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Link href="/daily-cash">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          <CashReport cashData={cash} />
        </div>
      </PageContent>
    </PageContainer>
  );
}
