"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPayablesAction } from "@/actions/payables";
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

import { AddPayableDialog } from "./add-payable-dialog";
import { PayablesFilters } from "./payables-filters";
import { payablesTableColumns } from "./payables-table-columns";

interface Payable {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidDate?: Date | null;
  supplierName?: string | null;
  supplierDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function PayablesPageClient() {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [rows, setRows] = useState<Payable[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    status: undefined as
      | "pending"
      | "paid"
      | "overdue"
      | "cancelled"
      | undefined,
    category: undefined as string | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const { execute: getPayables } = useAction(getPayablesAction, {
    onSuccess: ({ data }) => {
      setRows(data.data?.payables || []);
      setPagination(data.data?.pagination || null);
    },
    onError: ({ error }) => {
      console.error("Erro ao carregar:", error);
      toast.error(error.serverError || "Erro ao carregar contas a pagar");
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    getPayables({
      page: 1,
      limit: 20,
      status: filters.status,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }, []);

  const handleRefresh = () => {
    getPayables({
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
    getPayables({
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
              <PageTitle>Contas a Pagar</PageTitle>
              <PageDescription>
                Gerencie suas contas a pagar e controle o fluxo de caixa.
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
        <PayablesFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <DataTable
          columns={payablesTableColumns({ onRefresh: handleRefresh })}
          data={rows || []}
        />
      </PageContent>

      <AddPayableDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleRefresh}
      />
    </PageContainer>
  );
}
