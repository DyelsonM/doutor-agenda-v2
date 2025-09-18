"use client";

import jsPDF from "jspdf";
import { Download, Eye, FileText } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { getReportByIdAction } from "@/actions/financial";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrencyInCents, formatDate } from "@/helpers/financial";

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

interface RevenueByType {
  type: string;
  total: number;
  count: number;
}

interface ExpensesByCategory {
  category: string;
  total: number;
  count: number;
}

interface ReportData {
  reportData?: {
    summary?: Record<string, unknown>;
    appointments?: Record<string, unknown>;
    revenueByType?: RevenueByType[];
    revenueByPaymentMethod?: unknown[];
    expensesByCategory?: ExpensesByCategory[];
  };
}

interface ReportViewerProps {
  reportId: string;
  reportTitle: string;
}

export function ReportViewer({ reportId, reportTitle }: ReportViewerProps) {
  const [open, setOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const { execute: getReport, isExecuting } = useAction(getReportByIdAction, {
    onSuccess: ({ data }) => {
      setReportData(data);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao carregar relatório");
    },
  });

  const handleViewReport = () => {
    if (!reportData) {
      getReport({ id: reportId });
    }
    setOpen(true);
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    try {
      // Verificar se os dados estão disponíveis
      const summary = reportData.reportData?.summary || {};
      // const appointments = reportData.reportData?.appointments || {}; // Usado em futuras implementações
      const revenueByType = reportData.reportData?.revenueByType || [];
      // const revenueByPaymentMethod = reportData.reportData?.revenueByPaymentMethod || []; // Usado em futuras implementações
      const expensesByCategory =
        reportData.reportData?.expensesByCategory || [];

      // Criar novo documento PDF
      const doc = new jsPDF();

      // Configurações
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Função para adicionar texto
      const addText = (
        text: string,
        x: number,
        y: number,
        options: {
          fontSize?: number;
          color?: number;
          lineHeight?: number;
        } = {},
      ) => {
        doc.setFontSize(options.fontSize || 12);
        doc.setTextColor(options.color || 0);
        doc.text(text, x, y);
        return y + (options.lineHeight || 7);
      };

      // Função para adicionar linha
      const addLine = (y: number) => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        return y + 5;
      };

      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 200);
      doc.text("RELATÓRIO FINANCEIRO", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(reportTitle, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Verificar se os dados do relatório existem
      const report = reportData?.report || {};
      const periodStart = report.periodStart || new Date();
      const periodEnd = report.periodEnd || new Date();
      const createdAt = report.createdAt || new Date();

      yPosition = addText(
        `Período: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
        margin,
        yPosition,
      );
      yPosition = addText(
        `Gerado em: ${formatDate(new Date(createdAt))}`,
        margin,
        yPosition,
      );
      yPosition += 10;

      // Resumo Executivo
      yPosition = addText("RESUMO EXECUTIVO", margin, yPosition, {
        fontSize: 14,
        color: [0, 100, 200],
      });
      yPosition = addLine(yPosition);

      yPosition = addText(
        `💰 Total de Receitas: ${formatCurrencyInCents(summary.totalRevenue || 0)} (${summary.revenueTransactionCount || 0} transações)`,
        margin,
        yPosition,
        { color: [34, 139, 34] },
      );
      yPosition = addText(
        `💸 Total de Despesas: ${formatCurrencyInCents(summary.totalExpenses || 0)} (${summary.expenseTransactionCount || 0} transações)`,
        margin,
        yPosition,
        { color: [220, 20, 60] },
      );
      yPosition = addLine(yPosition - 2);

      const netProfit = summary.netProfit || 0;
      yPosition = addText(
        `📊 LUCRO LÍQUIDO (DIFERENÇA): ${formatCurrencyInCents(netProfit)}`,
        margin,
        yPosition,
        {
          fontSize: 13,
          color: netProfit >= 0 ? [0, 100, 0] : [200, 0, 0],
        },
      );
      yPosition = addText(
        `   ${netProfit >= 0 ? "✅ Resultado POSITIVO" : "❌ Resultado NEGATIVO"}`,
        margin,
        yPosition,
        {
          fontSize: 10,
          color: netProfit >= 0 ? [0, 100, 0] : [200, 0, 0],
        },
      );
      yPosition += 15;

      // Receita por Tipo de Transação
      if (revenueByType.length > 0) {
        yPosition = addText(
          "RECEITA POR TIPO DE TRANSAÇÃO",
          margin,
          yPosition,
          { fontSize: 14, color: [0, 100, 200] },
        );
        yPosition = addLine(yPosition);

        // Cabeçalho da tabela
        yPosition = addText("Tipo", margin, yPosition, {
          fontSize: 10,
          color: [100, 100, 100],
        });
        doc.text("Total", pageWidth - 100, yPosition - 7);
        doc.text("Qtd", pageWidth - 50, yPosition - 7);
        yPosition = addLine(yPosition);

        // Dados da tabela
        revenueByType.forEach((item: RevenueByType) => {
          yPosition = addText(item.type, margin, yPosition, { fontSize: 10 });
          doc.text(
            formatCurrencyInCents(item.total),
            pageWidth - 100,
            yPosition - 7,
          );
          doc.text(item.count.toString(), pageWidth - 50, yPosition - 7);
        });
        yPosition += 10;
      }

      // Despesas por Categoria
      if (expensesByCategory.length > 0) {
        yPosition = addText("DESPESAS POR CATEGORIA", margin, yPosition, {
          fontSize: 14,
          color: [0, 100, 200],
        });
        yPosition = addLine(yPosition);

        // Cabeçalho da tabela
        yPosition = addText("Categoria", margin, yPosition, {
          fontSize: 10,
          color: [100, 100, 100],
        });
        doc.text("Total", pageWidth - 100, yPosition - 7);
        doc.text("Qtd", pageWidth - 50, yPosition - 7);
        yPosition = addLine(yPosition);

        // Dados da tabela
        expensesByCategory.forEach((item: ExpensesByCategory) => {
          yPosition = addText(item.category || "Outro", margin, yPosition, {
            fontSize: 10,
          });
          doc.text(
            formatCurrencyInCents(item.total),
            pageWidth - 100,
            yPosition - 7,
          );
          doc.text(item.count.toString(), pageWidth - 50, yPosition - 7);
        });
      }

      yPosition += 15;

      // Salvar o PDF
      const fileName = `relatorio-financeiro-${reportTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleViewReport}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[80vh] max-w-4xl overflow-y-auto"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {reportTitle}
          </DialogTitle>
          <div id="dialog-description" className="sr-only">
            Visualização detalhada do relatório financeiro gerado
          </div>
        </DialogHeader>

        {isExecuting ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p>Carregando relatório...</p>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Cabeçalho do Relatório */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Resumo Executivo
              </h3>

              {/* Resumo Financeiro Principal */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">
                    💰 Total de Receitas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrencyInCents(
                      reportData.reportData?.summary?.totalRevenue || 0,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    {reportData.reportData?.summary?.revenueTransactionCount ||
                      0}{" "}
                    transações
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    💸 Total de Despesas
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrencyInCents(
                      reportData.reportData?.summary?.totalExpenses || 0,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    {reportData.reportData?.summary?.expenseTransactionCount ||
                      0}{" "}
                    transações
                  </p>
                </div>

                <div
                  className={`rounded-lg border p-4 ${
                    (reportData.reportData?.summary?.netProfit || 0) >= 0
                      ? "border-blue-200 bg-blue-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      (reportData.reportData?.summary?.netProfit || 0) >= 0
                        ? "text-blue-700"
                        : "text-orange-700"
                    }`}
                  >
                    📊 Lucro Líquido (Diferença)
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      (reportData.reportData?.summary?.netProfit || 0) >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {formatCurrencyInCents(
                      reportData.reportData?.summary?.netProfit || 0,
                    )}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      (reportData.reportData?.summary?.netProfit || 0) >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {(reportData.reportData?.summary?.netProfit || 0) >= 0
                      ? "Resultado positivo"
                      : "Resultado negativo"}
                  </p>
                </div>
              </div>
            </div>

            {/* Receita por Tipo */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Receita por Tipo de Transação
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Tipo
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Total
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Quantidade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.reportData?.revenueByType || []).map(
                      (item: RevenueByType, index: number) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {item.type}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                            {formatCurrencyInCents(item.total)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {item.count}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Despesas por Categoria */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Despesas por Categoria
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Categoria
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Total
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Quantidade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.reportData?.expensesByCategory || []).map(
                      (item: ExpensesByCategory, index: number) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {expenseCategoryLabels[
                              item.category as keyof typeof expenseCategoryLabels
                            ] ||
                              item.category ||
                              "Outro"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                            {formatCurrencyInCents(item.total)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {item.count}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botão de Exportar */}
            <div className="flex justify-end border-t pt-4">
              <Button
                onClick={handleExportPDF}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
