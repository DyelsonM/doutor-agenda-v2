"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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

  const refreshCashData = () => {
    setIsRefreshing(true);
    // Força atualização de todas as páginas relacionadas ao caixa
    router.refresh();

    // Reset do estado após um pequeno delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
