"use client";

import { useEffect, useState } from "react";
import { CashStatusCard } from "./cash-status-card";

interface CashStatusCardWrapperProps {
  cash: {
    id: string;
    date: Date;
    status: "open" | "closed" | "suspended";
    identifier?: string | null;
    openingTime: Date;
    closingTime?: Date | null;
    openingAmount: number;
    closingAmount?: number | null;
    expectedAmount?: number | null;
    difference?: number | null;
    totalCashIn: number;
    totalCashOut: number;
    openingNotes?: string | null;
    closingNotes?: string | null;
    user: {
      name: string;
    };
    operations: Array<{
      id: string;
      type: string;
      amountInCents: number;
      description: string;
      createdAt: Date;
    }>;
  } | null;
}

export function CashStatusCardWrapper({ cash }: CashStatusCardWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Durante a hidratação, renderizar uma versão simplificada
  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-32 rounded-lg bg-gray-200"></div>
      </div>
    );
  }

  return <CashStatusCard cash={cash} />;
}
