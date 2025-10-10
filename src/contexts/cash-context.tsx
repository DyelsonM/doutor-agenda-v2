"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface CashContextType {
  refreshCashData: () => void;
  isRefreshing: boolean;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

export function CashProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const refreshCashData = useCallback(() => {
    // Evitar múltiplos refreshes em sequência (debounce)
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    setIsRefreshing(true);

    const timeout = setTimeout(() => {
      // Força atualização apenas da página atual
      router.refresh();
      setIsRefreshing(false);
    }, 300); // Debounce de 300ms

    setRefreshTimeout(timeout);
  }, [router, refreshTimeout]);

  return (
    <CashContext.Provider value={{ refreshCashData, isRefreshing }}>
      {children}
    </CashContext.Provider>
  );
}

export function useCashContext() {
  const context = useContext(CashContext);
  if (context === undefined) {
    throw new Error("useCashContext must be used within a CashProvider");
  }
  return context;
}
