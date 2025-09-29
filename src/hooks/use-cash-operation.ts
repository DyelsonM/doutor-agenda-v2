"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  addCashOperationAction,
  deleteCashOperationAction,
} from "@/actions/daily-cash";
import { useCashContext } from "@/contexts/cash-context";

interface UseCashOperationProps {
  onSuccess?: () => void;
}

export function useCashOperation({ onSuccess }: UseCashOperationProps = {}) {
  const { refreshCashData } = useCashContext();

  const { execute: executeAddOperation, isExecuting } = useAction(
    addCashOperationAction,
    {
      onSuccess: ({ data }) => {
        toast.success("Operação registrada com sucesso!");

        // Forçar atualização de todas as páginas relacionadas ao caixa
        refreshCashData();

        // Callback personalizado
        onSuccess?.();
      },
      onError: ({ error }) => {
        console.error("Error adding operation:", error);

        const errorMessage =
          error?.serverError ||
          error?.validationErrors ||
          "Erro ao registrar operação";

        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : "Erro de validação. Verifique os dados.",
        );
      },
    },
  );

  const { execute: executeDeleteOperation, isExecuting: isDeleting } =
    useAction(deleteCashOperationAction, {
      onSuccess: ({ data }) => {
        toast.success("Operação excluída com sucesso!");

        // Forçar atualização de todas as páginas relacionadas ao caixa
        refreshCashData();

        // Callback personalizado
        onSuccess?.();
      },
      onError: ({ error }) => {
        console.error("Error deleting operation:", error);

        const errorMessage =
          error?.serverError ||
          error?.validationErrors ||
          "Erro ao excluir operação";

        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : "Erro ao excluir operação. Tente novamente.",
        );
      },
    });

  return {
    addOperation: executeAddOperation,
    deleteOperation: executeDeleteOperation,
    isExecuting,
    isDeleting,
  };
}
