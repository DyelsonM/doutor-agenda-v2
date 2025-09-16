"use client";

import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/financial";

interface Payable {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidDate?: Date | null;
  supplierName?: string | null;
  supplierDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
}

interface PayablesSectionProps {
  payables: Payable[];
  periodStart: Date;
  periodEnd: Date;
}

const categoryLabels: Record<string, string> = {
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
  maintenance: "Manutenção",
  professional_services: "Serviços Profissionais",
  taxes: "Impostos",
  other: "Outros",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pending: Clock,
  paid: CheckCircle,
  overdue: AlertTriangle,
  cancelled: XCircle,
};

export function PayablesSection({
  payables,
  periodStart,
  periodEnd,
}: PayablesSectionProps) {
  // Calcular estatísticas
  const stats = payables.reduce(
    (acc, payable) => {
      acc.total += payable.amountInCents;
      if (payable.status === "pending") {
        acc.pending += payable.amountInCents;
        acc.pendingCount += 1;
      } else if (payable.status === "paid") {
        acc.paid += payable.amountInCents;
        acc.paidCount += 1;
      } else if (payable.status === "overdue") {
        acc.overdue += payable.amountInCents;
        acc.overdueCount += 1;
      }
      return acc;
    },
    {
      total: 0,
      pending: 0,
      paid: 0,
      overdue: 0,
      pendingCount: 0,
      paidCount: 0,
      overdueCount: 0,
    },
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (payables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Contas a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhuma conta a pagar encontrada no período</p>
            <p className="text-sm">
              {formatDate(periodStart)} a {formatDate(periodEnd)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Contas a Pagar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-600">Total</p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrencyInCents(stats.total)}
            </p>
            <p className="text-xs text-blue-600">{payables.length} contas</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-600">Pendentes</p>
            <p className="text-xl font-bold text-yellow-900">
              {formatCurrencyInCents(stats.pending)}
            </p>
            <p className="text-xs text-yellow-600">
              {stats.pendingCount} contas
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-600">Pagas</p>
            <p className="text-xl font-bold text-green-900">
              {formatCurrencyInCents(stats.paid)}
            </p>
            <p className="text-xs text-green-600">{stats.paidCount} contas</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">Vencidas</p>
            <p className="text-xl font-bold text-red-900">
              {formatCurrencyInCents(stats.overdue)}
            </p>
            <p className="text-xs text-red-600">{stats.overdueCount} contas</p>
          </div>
        </div>

        {/* Tabela de contas */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Fornecedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.map((payable) => {
                const StatusIcon = statusIcons[payable.status];
                return (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">
                      {payable.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[payable.category] || payable.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrencyInCents(payable.amountInCents)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[payable.status]}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusLabels[payable.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payable.dueDate)}</TableCell>
                    <TableCell>
                      {payable.supplierName && (
                        <div>
                          <div className="font-medium">
                            {payable.supplierName}
                          </div>
                          {payable.supplierDocument && (
                            <div className="text-muted-foreground text-sm">
                              {payable.supplierDocument}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
