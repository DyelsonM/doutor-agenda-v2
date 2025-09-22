"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para forçar atualização de dados financeiros
 * Útil quando ações como marcar conta como paga são executadas
 */
export function useFinancialRefresh() {
  const router = useRouter();

  const refreshFinancialData = useCallback(() => {
    // Força uma atualização completa da página financeira
    router.refresh();
  }, [router]);

  return { refreshFinancialData };
}
