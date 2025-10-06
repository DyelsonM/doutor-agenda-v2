"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { getReceivablesAction } from "@/actions/receivables";
import { Button } from "@/components/ui/button";
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

import { AddReceivableDialog } from "./add-receivable-dialog";
import { ReceivablesFilters } from "./receivables-filters";
import { receivablesTableColumns } from "./receivables-table-columns";

interface Receivable {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  status: "pending" | "received" | "overdue" | "cancelled";
  dueDate: Date;
  receivedDate?: Date | null;
  patientName?: string | null;
  patientDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function ReceivablesPageClient() {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [rows, setRows] = useState<Receivable[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    status: undefined as
      | "pending"
      | "received"
      | "overdue"
      | "cancelled"
      | undefined,
    category: undefined as string | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const { execute: getReceivables } = useAction(getReceivablesAction, {
    onSuccess: ({ data }) => {
      setRows(data.data?.receivables || []);
      setPagination(data.data?.pagination || null);
    },
    onError: ({ error }) => {
      console.error("Erro ao carregar:", error);
      toast.error(error.serverError || "Erro ao carregar contas a receber");
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    getReceivables({
      page: 1,
      limit: 20,
      status: filters.status,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }, []);

  const handleRefresh = () => {
    getReceivables({
      page: 1,
      limit: 20,
      status: filters.status,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    getReceivables({
      page: 1,
      limit: 20,
      status: newFilters.status,
      category: newFilters.category,
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
    });
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/financial")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Financeiro
            </Button>
            <div>
              <PageTitle>Contas a Receber</PageTitle>
              <PageDescription>
                Gerencie suas contas a receber e controle o fluxo de caixa.
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>
        <PageActions>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <ReceivablesFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <DataTable
          columns={receivablesTableColumns({ onRefresh: handleRefresh })}
          data={rows || []}
        />
      </PageContent>

      <AddReceivableDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleRefresh}
      />
    </PageContainer>
  );
}
