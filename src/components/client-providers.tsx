"use client";

import { ReactNode } from "react";
import { CashProvider } from "@/contexts/cash-context";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return <CashProvider>{children}</CashProvider>;
}
