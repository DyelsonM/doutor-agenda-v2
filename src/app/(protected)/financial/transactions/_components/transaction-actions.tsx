"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  updateTransactionAction,
  deleteTransactionAction,
} from "@/actions/financial";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionActionsProps {
  transaction: {
    id: string;
    status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  };
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter();

  const { execute: updateTransaction, isExecuting: isUpdating } = useAction(
    updateTransactionAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message ?? "Transação atualizada com sucesso!");
        router.refresh(); // Atualiza a página para mostrar as mudanças
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao atualizar transação");
      },
    },
  );

  const { execute: deleteTransaction, isExecuting: isDeleting } = useAction(
    deleteTransactionAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message ?? "Transação excluída com sucesso!");
        router.refresh(); // Atualiza a página para mostrar as mudanças
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao excluir transação");
      },
    },
  );

  const handleStatusChange = (
    newStatus: TransactionActionsProps["transaction"]["status"],
  ) => {
    updateTransaction({
      id: transaction.id,
      status: newStatus,
    });
  };

  const handleDelete = () => {
    deleteTransaction({
      id: transaction.id,
    });
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <Pencil className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusChange("completed")}
            disabled={isUpdating || transaction.status === "completed"}
          >
            <Eye className="mr-2 h-4 w-4" />
            Marcar como Concluído
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleStatusChange("cancelled")}
            disabled={isUpdating || transaction.status === "cancelled"}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Cancelar
          </DropdownMenuItem>

          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-red-600 focus:text-red-600"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Transação
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação excluirá permanentemente a transação. Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
