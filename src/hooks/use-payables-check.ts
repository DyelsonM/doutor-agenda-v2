"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

import { checkPayablesDue } from "@/actions/check-payables-due";

export function usePayablesCheck() {
  const { execute } = useAction(checkPayablesDue);

  // Verificar contas próximas ao vencimento a cada hora
  useEffect(() => {
    const checkPayables = () => {
      execute({});
    };

    // Verificar imediatamente quando o hook é montado
    checkPayables();

    // Configurar verificação a cada hora (3600000 ms)
    const interval = setInterval(checkPayables, 3600000);

    return () => clearInterval(interval);
  }, [execute]);

  return { checkPayablesDue: () => execute({}) };
}
