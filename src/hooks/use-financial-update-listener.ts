"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook que escuta mensagens de atualização financeira
 * e força a atualização da página quando necessário
 */
export function useFinancialUpdateListener() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FINANCIAL_UPDATE") {
        // Forçar atualização da página
        router.refresh();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "financial-update" && event.newValue) {
        // Forçar atualização da página
        router.refresh();
        // Limpar o localStorage
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
    };
  }, [router]);
}
