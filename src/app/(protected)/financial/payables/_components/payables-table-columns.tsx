"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  deletePayableAction,
  markPayableAsPaidAction,
} from "@/actions/payables";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { payablesTable } from "@/db/schema";
import { formatCurrencyInCents, formatDate } from "@/helpers/financial";

const categoryLabels: Record<string, string> = {
  rent: "Aluguel",
  utilities: "Utilidades",
  equipment: "Equipamentos",
  supplies: "Suprimentos",
  marketing: "Marketing",
  staff: "Funcionários",
  insurance: "Seguros",
  software: "Software",
  laboratory: "Laboratório",
  shipping: "Frete",
  maintenance: "Manutenção",
  professional_services: "Serviços Profissionais",
  taxes: "Impostos",
  other: "Outros",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

type Payable = typeof payablesTable.$inferSelect;

export const payablesTableColumns = ({
  onRefresh,
}: {
  onRefresh: () => void;
}): ColumnDef<Payable>[] => [
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const payable = row.original;
      return (
        <div className="max-w-[200px]">
          <div className="truncate font-medium">{payable.description}</div>
          {payable.supplierName && (
            <div className="text-muted-foreground truncate text-sm">
              {payable.supplierName}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "amountInCents",
    header: "Valor",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {formatCurrencyInCents(row.getValue("amountInCents"))}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="outline">{categoryLabels[category] || category}</Badge>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimento",
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as Date;
      const isOverdue =
        new Date() > dueDate && row.original.status === "pending";

      return (
        <div className={isOverdue ? "font-medium text-red-600" : ""}>
          {formatDate(dueDate)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariants[status] || "default"}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paidDate",
    header: "Data Pagamento",
    cell: ({ row }) => {
      const paidDate = row.getValue("paidDate") as Date | null;
      return paidDate ? formatDate(paidDate) : "-";
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const payable = row.original;

      return <PayableActions payable={payable} onRefresh={onRefresh} />;
    },
  },
];

function PayableActions({
  payable,
  onRefresh,
}: {
  payable: Payable;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { execute: markAsPaid, isPending: isMarkingAsPaid } = useAction(
    markPayableAsPaidAction,
    {
      onSuccess: () => {
        toast.success("Conta marcada como paga!");
        onRefresh(); // Atualizar lista
        // Forçar atualização da página financeira
        router.refresh();
        // Enviar mensagem para outras páginas
        window.postMessage({ type: "FINANCIAL_UPDATE" }, "*");
        // Usar localStorage como backup
        localStorage.setItem("financial-update", Date.now().toString());
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao marcar como paga");
      },
    },
  );

  const { execute: deletePayable, isPending: isDeleting } = useAction(
    deletePayableAction,
    {
      onSuccess: () => {
        toast.success("Conta excluída com sucesso!");
        onRefresh(); // Atualizar lista
        setShowDeleteDialog(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao excluir conta");
      },
    },
  );

  const handleMarkAsPaid = () => {
    markAsPaid({ id: payable.id });
  };

  const handleDelete = () => {
    deletePayable({ id: payable.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {payable.status === "pending" && (
            <DropdownMenuItem
              onClick={handleMarkAsPaid}
              disabled={isMarkingAsPaid}
            >
              <Check className="mr-2 h-4 w-4" />
              Marcar como Pago
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta a Pagar</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta &quot;{payable.description}
              &quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
