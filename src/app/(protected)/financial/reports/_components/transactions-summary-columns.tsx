"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrencyInCents } from "@/helpers/financial";

export type TransactionSummary = {
  id: string;
  type: "appointment_payment" | "refund" | "expense" | "other";
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
    | "other";
  createdAt: Date;
  appointment?: { id: string; patient: { name: string } } | null;
};

const typeLabels = {
  appointment_payment: "Receita",
  expense: "Despesa",
};

const typeColors = {
  appointment_payment: "bg-green-100 text-green-800",
  expense: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pendente",
  completed: "Concluído",
  failed: "Falhou",
  refunded: "Estornado",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

const paymentMethodLabels = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
  cash: "Dinheiro",
  bank_transfer: "Transferência",
};

const expenseCategoryLabels = {
  rent: "Aluguel",
  utilities: "Utilidades",
  equipment: "Equipamentos",
  supplies: "Suprimentos",
  marketing: "Marketing",
  staff: "Pessoal",
  insurance: "Seguros",
  software: "Software",
  laboratory: "Laboratório",
  shipping: "Frete",
  other: "Outros",
};

export const transactionsSummaryColumns: ColumnDef<TransactionSummary>[] = [
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as TransactionSummary["type"];
      const isExpense = type === "expense";

      return (
        <div className="flex items-center gap-2">
          {isExpense ? (
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          )}
          <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      const appointment = row.original.appointment;

      return (
        <div className="space-y-1">
          <p className="font-medium">{description}</p>
          {appointment && (
            <p className="text-muted-foreground text-sm">
              Paciente: {appointment.patient.name}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "amountInCents",
    header: "Valor",
    cell: ({ row }) => {
      const amount = row.getValue("amountInCents") as number;
      const type = row.original.type;
      const isExpense = type === "expense";

      return (
        <div
          className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}
        >
          {isExpense ? "-" : "+"} {formatCurrencyInCents(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    cell: ({ row }) => {
      const method = row.getValue(
        "paymentMethod",
      ) as TransactionSummary["paymentMethod"];
      return <Badge variant="outline">{paymentMethodLabels[method]}</Badge>;
    },
  },
  {
    accessorKey: "expenseCategory",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.original.expenseCategory;
      const type = row.original.type;

      if (type === "expense" && category) {
        return (
          <Badge className="bg-purple-100 text-purple-800">
            {expenseCategoryLabels[category]}
          </Badge>
        );
      }

      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TransactionSummary["status"];
      return (
        <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm">
          <div>{format(date, "dd/MM/yyyy", { locale: ptBR })}</div>
          <div className="text-muted-foreground">
            {format(date, "HH:mm", { locale: ptBR })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row: _row }) => {
      // Prefixo _ indica parâmetro intencionalmente não usado
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Ver Detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
