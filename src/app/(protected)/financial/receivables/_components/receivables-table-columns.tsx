"use client";

import { formatCurrency } from "@/helpers/currency";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteReceivableAction,
  markReceivableAsReceivedAction,
} from "@/actions/receivables";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "next-safe-action/hooks";

dayjs.locale("pt-br");

interface Receivable {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  status: "pending" | "received";
  dueDate: Date;
  receivedDate?: Date | null;
  doctorId?: string | null;
  patientName?: string | null;
  patientDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor?: {
    id: string;
    name: string;
  } | null;
}

const categoryLabels = {
  consultation: "Consulta",
  procedure: "Procedimento",
  examination: "Exame",
  treatment: "Tratamento",
  medication: "Medicação",
  equipment_rental: "Aluguel de Equipamento",
  professional_service: "Serviço Profissional",
  insurance_reimbursement: "Reembolso de Seguro",
  other: "Outros",
};

const statusLabels = {
  pending: "Pendente",
  received: "Recebido",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  received: "bg-green-100 text-green-800 border-green-200",
};

export function receivablesTableColumns({
  onRefresh,
  onView,
  onEdit,
}: {
  onRefresh: () => void;
  onView: (receivable: Receivable) => void;
  onEdit: (receivable: Receivable) => void;
}): ColumnDef<Receivable>[] {
  return [
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => {
        const receivable = row.original;
        return (
          <div className="max-w-[200px]">
            <div className="truncate font-medium">{receivable.description}</div>
            {receivable.patientName && (
              <div className="text-muted-foreground truncate text-sm">
                Cliente: {receivable.patientName}
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
        const amount = row.getValue("amountInCents") as number;
        return (
          <div className="font-medium">{formatCurrency(amount / 100)}</div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge variant="outline">
            {categoryLabels[category as keyof typeof categoryLabels] ||
              category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "doctorId",
      header: "Profissional",
      cell: ({ row }) => {
        const receivable = row.original;
        return <div className="text-sm">{receivable.doctor?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusLabels;
        return (
          <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Vencimento",
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as Date;
        const isOverdue =
          dayjs(dueDate).isBefore(dayjs()) && row.original.status === "pending";
        return (
          <div className={isOverdue ? "font-medium text-red-600" : ""}>
            {dayjs(dueDate).format("DD/MM/YYYY")}
          </div>
        );
      },
    },
    {
      accessorKey: "receivedDate",
      header: "Recebido em",
      cell: ({ row }) => {
        const receivedDate = row.getValue("receivedDate") as Date | null;
        if (!receivedDate) return "-";
        return dayjs(receivedDate).format("DD/MM/YYYY");
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const receivable = row.original;

        return (
          <ReceivableActions
            receivable={receivable}
            onRefresh={onRefresh}
            onView={onView}
            onEdit={onEdit}
          />
        );
      },
    },
  ];
}

function ReceivableActions({
  receivable,
  onRefresh,
  onView,
  onEdit,
}: {
  receivable: Receivable;
  onRefresh: () => void;
  onView: (receivable: Receivable) => void;
  onEdit: (receivable: Receivable) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { execute: markAsReceived, isPending: isMarkingAsReceived } = useAction(
    markReceivableAsReceivedAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
        onRefresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao marcar como recebido");
      },
    },
  );

  const { execute: deleteReceivable, isPending: isDeleting } = useAction(
    deleteReceivableAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
        onRefresh();
        setShowDeleteDialog(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao excluir conta a receber");
      },
    },
  );

  const handleMarkAsReceived = () => {
    markAsReceived({ id: receivable.id });
  };

  const handleDelete = () => {
    deleteReceivable({ id: receivable.id });
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
          <DropdownMenuItem onClick={() => onView(receivable)}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(receivable)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {receivable.status === "pending" && (
            <DropdownMenuItem
              onClick={handleMarkAsReceived}
              disabled={isMarkingAsReceived}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como recebido
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta a Receber</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta &quot;
              {receivable.description}
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
