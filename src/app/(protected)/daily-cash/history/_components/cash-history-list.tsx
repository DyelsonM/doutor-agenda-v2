"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Clock, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrencyInCents } from "@/helpers/financial";
import { deleteCashAction } from "@/actions/daily-cash";
import { useCashContext } from "@/contexts/cash-context";

interface CashHistoryListProps {
  history: Array<{
    id: string;
    date: Date;
    status: "open" | "closed" | "suspended";
    openingAmount: number;
    closingAmount?: number | null;
    totalCashIn: number;
    totalCashOut: number;
    user: {
      name: string;
    };
  }>;
}

export function CashHistoryList({ history }: CashHistoryListProps) {
  const { refreshCashData } = useCashContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { execute: executeDeleteCash } = useAction(deleteCashAction, {
    onSuccess: ({ data }) => {
      console.log("Cash deleted successfully:", data);
      toast.success("Caixa excluído com sucesso!");
      refreshCashData();
      setDeletingId(null);
    },
    onError: ({ error }) => {
      console.error("Error deleting cash:", error);

      const errorMessage =
        error?.serverError ||
        error?.validationErrors ||
        "Erro ao excluir caixa";

      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erro de validação. Verifique os dados.",
      );
      setDeletingId(null);
    },
  });

  const handleDeleteCash = (cashId: string) => {
    setDeletingId(cashId);
    executeDeleteCash({ cashId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "closed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "suspended":
        return <Lock className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default" as const;
      case "closed":
        return "secondary" as const;
      case "suspended":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "closed":
        return "Fechado";
      case "suspended":
        return "Suspenso";
      default:
        return "Desconhecido";
    }
  };

  if (history.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Nenhum histórico de caixa encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((cash) => (
        <div
          key={cash.id}
          className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(cash.status)}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {cash.date
                    ? format(new Date(cash.date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "Data não disponível"}
                </span>
                <Badge variant={getStatusVariant(cash.status)}>
                  {getStatusLabel(cash.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Aberto por: {cash.user.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {formatCurrencyInCents(cash.openingAmount)}
            </div>
            {cash.closingAmount && (
              <div className="text-muted-foreground text-sm">
                Final: {formatCurrencyInCents(cash.closingAmount)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/daily-cash/details/${cash.id}`}>
              <Button variant="ghost" size="sm">
                Ver
              </Button>
            </Link>

            {/* Botão de exclusão - só para caixas fechados */}
            {cash.status === "closed" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingId === cash.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Caixa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este caixa? Esta ação não
                      pode ser desfeita.
                      <br />
                      <br />
                      <strong>Data:</strong>{" "}
                      {cash.date
                        ? format(new Date(cash.date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "Data não disponível"}
                      <br />
                      <strong>Aberto por:</strong> {cash.user.name}
                      <br />
                      <strong>Valor inicial:</strong>{" "}
                      {formatCurrencyInCents(cash.openingAmount)}
                      {cash.closingAmount && (
                        <>
                          <br />
                          <strong>Valor final:</strong>{" "}
                          {formatCurrencyInCents(cash.closingAmount)}
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCash(cash.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletingId === cash.id ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
