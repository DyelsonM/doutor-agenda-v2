"use client";

import { usePayablesCheck } from "@/hooks/use-payables-check";

export function PayablesChecker() {
  usePayablesCheck();

  // Este componente não renderiza nada visível
  return null;
}
