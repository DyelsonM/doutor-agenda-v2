"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents, formatDate } from "@/helpers/financial";

import { DetailedReportViewer } from "./detailed-report-viewer";
import { ReportActions } from "./report-actions";

interface FinancialReport {
  id: string;
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  appointmentCount: number;
  averageAppointmentValue: number;
  createdAt: Date;
}

interface ReportsListProps {
  reports: FinancialReport[];
}

const reportTypeLabels: Record<string, string> = {
  daily: "Diário",
  monthly: "Mensal",
  yearly: "Anual",
};

const reportTypeColors: Record<string, string> = {
  daily: "bg-orange-100 text-orange-800",
  monthly: "bg-blue-100 text-blue-800",
  yearly: "bg-green-100 text-green-800",
};

export function ReportsList({ reports }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>Nenhum relatório gerado ainda</p>
        <p className="text-sm">Gere seu primeiro relatório financeiro</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Receita Total</TableHead>
            <TableHead>Lucro Líquido</TableHead>
            <TableHead>Gerado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Badge className={reportTypeColors[report.reportType]}>
                  {reportTypeLabels[report.reportType]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                <div className="space-y-1">
                  <div>{formatDate(report.periodStart)}</div>
                  <div className="text-muted-foreground">até</div>
                  <div>{formatDate(report.periodEnd)}</div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrencyInCents(report.totalRevenue)}
              </TableCell>
              <TableCell className="font-medium">
                <span
                  className={
                    report.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrencyInCents(report.netProfit)}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <DetailedReportViewer
                    report={report}
                    reportTitle={`${reportTypeLabels[report.reportType]} - ${formatDate(report.periodStart)} a ${formatDate(report.periodEnd)}`}
                  />
                  <ReportActions reportId={report.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
