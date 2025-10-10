"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Hook que escuta mensagens de atualização financeira
 * e força a atualização da página quando necessário
 * Otimizado com debounce para evitar múltiplos refreshes
 */
export function useFinancialUpdateListener() {
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const debouncedRefresh = () => {
      // Debounce: Evitar múltiplos refreshes em curto período
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        router.refresh();
      }, 500); // Aguardar 500ms antes de fazer refresh
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FINANCIAL_UPDATE") {
        debouncedRefresh();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "financial-update" && event.newValue) {
        debouncedRefresh();
        // Limpar o localStorage após processar
        localStorage.removeItem("financial-update");
      }
    };

    // Escutar mensagens do window
    window.addEventListener("message", handleMessage);

    // Escutar mudanças no localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorageChange);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [router]);
}
