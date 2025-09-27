"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { addCashOperationAction } from "@/actions/daily-cash";
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

  return {
    addOperation: executeAddOperation,
    isExecuting,
  };
}
