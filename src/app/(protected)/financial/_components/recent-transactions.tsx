"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/financial";

interface Transaction {
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
  appointment?: {
    id: string;
    date: Date;
    patient: {
      name: string;
    };
    doctor: {
      name: string;
    };
  } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

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

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consulta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm">
                {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <Badge className={transactionTypeColors[transaction.type]}>
                  {transactionTypeLabels[transaction.type]}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {transaction.description}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrencyInCents(transaction.amountInCents)}
              </TableCell>
              <TableCell className="text-sm">
                {paymentMethodLabels[transaction.paymentMethod]}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[transaction.status]}>
                  {statusLabels[transaction.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {transaction.appointment ? (
                  <div className="space-y-1">
                    <div className="font-medium">
                      {transaction.appointment.patient.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {transaction.appointment.doctor.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {format(
                        new Date(transaction.appointment.date),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
