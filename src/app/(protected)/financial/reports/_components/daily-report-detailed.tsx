"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import jsPDF from "jspdf";
import { Download, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrencyInCents } from "@/helpers/financial";

import {
  transactionsSummaryColumns,
  TransactionSummary,
} from "./transactions-summary-columns";

interface DailyReportDetailedProps {
  reportData: {
    periodStart: Date;
    periodEnd: Date;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    appointmentCount: number;
    averageAppointmentValue: number;
  };
  transactions: TransactionSummary[];
  reportTitle: string;
}

export function DailyReportDetailed({
  reportData,
  transactions,
  reportTitle,
}: DailyReportDetailedProps) {
  // Usar todas as transações fornecidas
  const filteredTransactions = transactions;

  // Calcular totais
  const revenues = filteredTransactions.filter(
    (t) => t.type !== "expense" && t.status === "completed",
  );
  const expenses = filteredTransactions.filter(
    (t) => t.type === "expense" && t.status === "completed",
  );

  const totalRevenue = revenues.reduce((sum, t) => sum + t.amountInCents, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amountInCents, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Agrupar receitas por tipo
  const revenueByType = revenues.reduce(
    (acc, transaction) => {
      const type = transaction.type;
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0 };
      }
      acc[type].count++;
      acc[type].total += transaction.amountInCents;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>,
  );

  // Agrupar despesas por categoria
  const expensesByCategory = expenses.reduce(
    (acc, transaction) => {
      const category = transaction.expenseCategory || "other";
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count++;
      acc[category].total += transaction.amountInCents;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>,
  );

  const handleExportPDF = () => {
    try {
      // Verificar se há dados para exportar
      if (!filteredTransactions || filteredTransactions.length === 0) {
        toast.error("Não há transações para exportar");
        return;
      }

      console.log("Iniciando exportação PDF do relatório diário...");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 200);
      doc.text(
        "RELATÓRIO FINANCEIRO DIÁRIO DETALHADO",
        pageWidth / 2,
        yPosition,
        {
          align: "center",
        },
      );
      yPosition += 15;

      // Data do relatório
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(reportTitle, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 20;

      // Resumo Executivo
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 200);
      doc.text("RESUMO EXECUTIVO", margin, yPosition);
      yPosition += 10;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
      doc.text(
        `Total de Receitas: ${formatCurrencyInCents(reportData.totalRevenue)} (${revenues.length} transações)`,
        margin,
        yPosition,
      );
      yPosition += 7;

      doc.setTextColor(220, 20, 60);
      doc.text(
        `Total de Despesas: ${formatCurrencyInCents(reportData.totalExpenses)} (${expenses.length} transações)`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setTextColor(
        reportData.netProfit >= 0 ? 0 : 200,
        reportData.netProfit >= 0 ? 100 : 0,
        reportData.netProfit >= 0 ? 0 : 0,
      );
      doc.text(
        `LUCRO LÍQUIDO: ${formatCurrencyInCents(reportData.netProfit)}`,
        margin,
        yPosition,
      );
      yPosition += 5;
      doc.text(
        `Status: ${reportData.netProfit >= 0 ? "RESULTADO POSITIVO" : "RESULTADO NEGATIVO"}`,
        margin,
        yPosition,
      );
      yPosition += 15;

      yPosition += 5;

      // Transações Detalhadas
      if (filteredTransactions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 200);
        doc.text("TRANSAÇÕES DO DIA", margin, yPosition);
        yPosition += 10;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(0);

        // Cabeçalho da tabela
        doc.text("Hora", margin, yPosition);
        doc.text("Descrição", margin + 25, yPosition);
        doc.text("Tipo", margin + 90, yPosition);
        doc.text("Valor", margin + 130, yPosition);
        yPosition += 5;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Mostrar todas as transações do dia
        filteredTransactions.forEach((transaction) => {
          // Verificar se precisa de nova página
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }

          const isExpense = transaction.type === "expense";
          const sign = isExpense ? "-" : "+";
          const typeLabel = isExpense ? "Despesa" : "Receita";

          doc.setTextColor(0);
          doc.text(
            format(new Date(transaction.createdAt), "HH:mm"),
            margin,
            yPosition,
          );

          // Limitar descrição
          const description =
            transaction.description.length > 25
              ? transaction.description.substring(0, 25) + "..."
              : transaction.description;
          doc.text(description, margin + 25, yPosition);

          doc.text(typeLabel, margin + 90, yPosition);

          // Cor baseada no tipo
          doc.setTextColor(
            isExpense ? 220 : 34,
            isExpense ? 20 : 139,
            isExpense ? 60 : 34,
          );
          doc.text(
            `${sign}${formatCurrencyInCents(transaction.amountInCents)}`,
            margin + 130,
            yPosition,
          );

          yPosition += 5;
        });
      }

      // Salvar arquivo
      const fileName = `relatorio-diario-${format(reportData.periodStart, "dd-MM-yyyy")}.pdf`;
      console.log("Salvando arquivo:", fileName);

      doc.save(fileName);
      toast.success("Relatório diário exportado com sucesso!");
    } catch (error) {
      console.error("Erro detalhado ao exportar PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao exportar PDF: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Diário Detalhado
            </div>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="font-medium">
                {format(reportData.periodStart, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transações</p>
              <p className="font-medium text-blue-600">
                {filteredTransactions.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Totais */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyInCents(reportData.totalRevenue)}
            </div>
            <p className="text-muted-foreground text-xs">
              {revenues.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrencyInCents(reportData.totalExpenses)}
            </div>
            <p className="text-muted-foreground text-xs">
              {expenses.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${reportData.netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}
            >
              {formatCurrencyInCents(reportData.netProfit)}
            </div>
            <p className="text-muted-foreground text-xs">
              {reportData.netProfit >= 0
                ? "Resultado positivo"
                : "Resultado negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={transactionsSummaryColumns}
            data={filteredTransactions}
            searchPlaceholder="Pesquisar por descrição..."
            searchColumn="description"
          />
        </CardContent>
      </Card>

      {/* Resumo por Categorias */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Receitas por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Receitas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(revenueByType).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {type === "appointment_payment" ? "Consultas" : type}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {data.count} transações
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrencyInCents(data.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, data]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-muted-foreground text-sm">
                      {data.count} transações
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrencyInCents(data.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
