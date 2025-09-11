"use client";

import { useDayChange } from "@/hooks/use-day-change";

interface FinancialPageClientProps {
  children: React.ReactNode;
}

/**
 * Componente cliente que gerencia atualizações automáticas da página financeira
 */
export function FinancialPageClient({ children }: FinancialPageClientProps) {
  // Detecta mudança de dia e revalida automaticamente
  useDayChange();

  return <>{children}</>;
}
