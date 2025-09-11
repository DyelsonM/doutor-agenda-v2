"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { formatCurrencyInCents } from "@/helpers/financial";

import { TransactionActions } from "./transaction-actions";

export type Transaction = {
  id: string;
  type:
    | "appointment_payment"
    | "subscription_payment"
    | "refund"
    | "expense"
    | "other";
  amountInCents: number;
  description: string;
  paymentMethod: "stripe" | "cash" | "pix" | "bank_transfer" | "other";
  status: "pending" | "completed" | "failed" | "cancelled" | "refunded";
  createdAt: Date;
  updatedAt: Date | null;
  appointment: {
    id: string;
    date: Date;
    patient: { id: string; name: string };
    doctor: { id: string; name: string };
  } | null;
};

const transactionTypeLabels: Record<Transaction["type"], string> = {
  appointment_payment: "Pagamento de Consulta",
  subscription_payment: "Pagamento de Assinatura",
  refund: "Reembolso",
  expense: "Despesa",
  other: "Outro",
};

const transactionTypeColors: Record<Transaction["type"], string> = {
  appointment_payment: "bg-green-100 text-green-800",
  subscription_payment: "bg-blue-100 text-blue-800",
  refund: "bg-orange-100 text-orange-800",
  expense: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

const paymentMethodLabels: Record<Transaction["paymentMethod"], string> = {
  stripe: "Cartão",
  cash: "Dinheiro",
  pix: "PIX",
  bank_transfer: "Transferência",
  other: "Outro",
};

const statusLabels: Record<Transaction["status"], string> = {
  pending: "Pendente",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const statusColors: Record<Transaction["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-orange-100 text-orange-800",
};

export const transactionsTableColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm">
          {format(new Date(date), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as Transaction["type"];
      return (
        <Badge className={transactionTypeColors[type]}>
          {transactionTypeLabels[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div className="max-w-[200px] truncate">{description}</div>;
    },
  },
  {
    accessorKey: "amountInCents",
    header: "Valor",
    cell: ({ row }) => {
      const amount = row.getValue("amountInCents") as number;
      return <div className="font-medium">{formatCurrencyInCents(amount)}</div>;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    cell: ({ row }) => {
      const method = row.getValue(
        "paymentMethod",
      ) as Transaction["paymentMethod"];
      return <div className="text-sm">{paymentMethodLabels[method]}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Transaction["status"];
      return (
        <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
      );
    },
  },
  {
    accessorKey: "appointment",
    header: "Consulta",
    cell: ({ row }) => {
      const appointment = row.getValue(
        "appointment",
      ) as Transaction["appointment"];
      return (
        <div className="text-sm">
          {appointment ? (
            <div className="space-y-1">
              <div className="font-medium">{appointment.patient.name}</div>
              <div className="text-muted-foreground text-xs">
                {appointment.doctor.name}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const transaction = row.original;
      return <TransactionActions transaction={transaction} />;
    },
  },
];
