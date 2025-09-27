"use client";

import { FinancialSummary } from "../../reports/_components/financial-summary";

interface TransactionData {
  id: string;
  type: "appointment_payment" | "expense";
  description: string;
  amountInCents: number;
  paymentMethod:
    | "credit_card"
    | "debit_card"
    | "pix"
    | "cash"
    | "bank_transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  expenseCategory?:
    | "rent"
    | "utilities"
    | "equipment"
    | "supplies"
    | "marketing"
    | "staff"
    | "insurance"
    | "software"
    | "other"
    | null;
  createdAt: Date;
  appointmentId?: string | null;
  patientName?: string | null;
}

interface FinancialSummaryClientProps {
  transactions: TransactionData[];
  periodStart?: Date;
  periodEnd?: Date;
}

export function FinancialSummaryClient({
  transactions: initialTransactions,
  periodStart,
  periodEnd,
}: FinancialSummaryClientProps) {
  // Transformar dados iniciais para o formato esperado
  const transformedData = initialTransactions.map((transaction) => ({
    ...transaction,
    appointment: transaction.appointmentId
      ? {
          id: transaction.appointmentId,
          patient: { name: transaction.patientName || "N/A" },
        }
      : null,
  }));

  return (
    <FinancialSummary
      transactions={transformedData}
      periodStart={periodStart}
      periodEnd={periodEnd}
    />
  );
}
