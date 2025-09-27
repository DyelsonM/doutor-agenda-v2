"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { formatCurrencyInCents } from "@/helpers/financial";

interface CashReportProps {
  cashData: {
    id: string;
    date: Date | string;
    identifier?: string | null;
    openingTime: Date | string;
    closingTime?: Date | string | null;
    status: string;
    openingAmount: number;
    closingAmount?: number | null;
    expectedAmount?: number | null;
    difference?: number | null;
    totalRevenue: number;
    totalExpenses: number;
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
      createdAt: Date | string;
    }>;
  };
}

export function CashReport({ cashData }: CashReportProps) {
  const handleExportPDF = () => {
    if (!cashData) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 200);
      doc.text("RELATÓRIO DE FECHAMENTO DE CAIXA", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Data do relatório
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(
        `Data: ${cashData.date ? format(new Date(cashData.date), "dd/MM/yyyy", { locale: ptBR }) : "Data não disponível"}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 10;

      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 20;

      // Informações do caixa
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 200);
      doc.text("INFORMAÇÕES DO CAIXA", margin, yPosition);
      yPosition += 10;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setTextColor(0);

      // Status
      const statusText = cashData.status === "closed" ? "FECHADO" : "ABERTO";
      doc.text(`Status: ${statusText}`, margin, yPosition);
      yPosition += 7;

      // Horários
      doc.text(
        `Abertura: ${cashData.openingTime ? format(new Date(cashData.openingTime), "HH:mm", { locale: ptBR }) : "Horário não disponível"}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      if (cashData.closingTime) {
        doc.text(
          `Fechamento: ${cashData.closingTime ? format(new Date(cashData.closingTime), "HH:mm", { locale: ptBR }) : "Horário não disponível"}`,
          margin,
          yPosition,
        );
        yPosition += 7;
      }

      // Responsável
      doc.text(`Responsável: ${cashData.user.name}`, margin, yPosition);
      yPosition += 15;

      // Valores
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 200);
      doc.text("VALORES", margin, yPosition);
      yPosition += 10;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setTextColor(0);

      // Valor inicial
      doc.text(
        `Valor Inicial: ${formatCurrencyInCents(cashData.openingAmount)}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Entradas
      doc.setTextColor(34, 139, 34);
      doc.text(
        `Entradas: +${formatCurrencyInCents(cashData.totalCashIn)}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Saídas
      doc.setTextColor(220, 20, 60);
      doc.text(
        `Saídas: -${formatCurrencyInCents(cashData.totalCashOut)}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Receitas
      doc.setTextColor(34, 139, 34);
      doc.text(
        `Receitas: ${formatCurrencyInCents(cashData.totalRevenue)}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Despesas
      doc.setTextColor(220, 20, 60);
      doc.text(
        `Despesas: ${formatCurrencyInCents(cashData.totalExpenses)}`,
        margin,
        yPosition,
      );
      yPosition += 7;

      // Valor esperado
      if (cashData.expectedAmount) {
        doc.setTextColor(0);
        doc.text(
          `Valor Esperado: ${formatCurrencyInCents(cashData.expectedAmount)}`,
          margin,
          yPosition,
        );
        yPosition += 7;
      }

      // Valor final
      if (cashData.closingAmount) {
        doc.setTextColor(0);
        doc.text(
          `Valor Final: ${formatCurrencyInCents(cashData.closingAmount)}`,
          margin,
          yPosition,
        );
        yPosition += 7;
      }

      // Diferença
      if (cashData.difference !== null && cashData.difference !== undefined) {
        doc.setTextColor(
          cashData.difference >= 0 ? 34 : 220,
          cashData.difference >= 0 ? 139 : 20,
          cashData.difference >= 0 ? 34 : 60,
        );
        doc.text(
          `Diferença: ${cashData.difference >= 0 ? "+" : ""}${formatCurrencyInCents(cashData.difference)}`,
          margin,
          yPosition,
        );
        yPosition += 7;
      }

      yPosition += 10;

      // Operações
      if (cashData.operations && cashData.operations.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 200);
        doc.text("OPERАÇÕES DO DIA", margin, yPosition);
        yPosition += 10;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(0);

        // Cabeçalho da tabela
        doc.text("Hora", margin, yPosition);
        doc.text("Tipo", margin + 30, yPosition);
        doc.text("Descrição", margin + 60, yPosition);
        doc.text("Valor", margin + 140, yPosition);
        yPosition += 5;

        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Mostrar operações
        cashData.operations.forEach((operation: any) => {
          // Verificar se precisa de nova página
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }

          const isCashIn = operation.type === "cash_in";
          const sign = isCashIn ? "+" : "-";
          const typeLabel = isCashIn
            ? "Entrada"
            : operation.type === "cash_out"
              ? "Saída"
              : "Ajuste";

          doc.setTextColor(0);
          doc.text(
            operation.createdAt
              ? format(new Date(operation.createdAt), "HH:mm")
              : "Horário não disponível",
            margin,
            yPosition,
          );

          doc.text(typeLabel, margin + 30, yPosition);

          // Limitar descrição
          const description =
            operation.description.length > 25
              ? operation.description.substring(0, 25) + "..."
              : operation.description;
          doc.text(description, margin + 60, yPosition);

          // Cor baseada no tipo
          doc.setTextColor(
            isCashIn ? 34 : 220,
            isCashIn ? 139 : 20,
            isCashIn ? 34 : 60,
          );
          doc.text(
            `${sign}${formatCurrencyInCents(operation.amountInCents)}`,
            margin + 140,
            yPosition,
          );

          yPosition += 5;
        });
      }

      // Salvar arquivo
      const fileName = `relatorio-caixa-${cashData.date ? format(new Date(cashData.date), "dd-MM-yyyy") : "data-indisponivel"}.pdf`;

      doc.save(fileName);
      toast.success("Relatório de caixa exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  const getStatusInfo = () => {
    switch (cashData.status) {
      case "open":
        return {
          label: "Aberto",
          variant: "default" as const,
          color: "text-green-600",
        };
      case "closed":
        return {
          label: "Fechado",
          variant: "secondary" as const,
          color: "text-blue-600",
        };
      case "suspended":
        return {
          label: "Suspenso",
          variant: "destructive" as const,
          color: "text-orange-600",
        };
      default:
        return {
          label: "Desconhecido",
          variant: "outline" as const,
          color: "text-gray-600",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório de Caixa
            {cashData.identifier && (
              <span className="text-muted-foreground">
                {" "}
                - {cashData.identifier}
              </span>
            )}
            {" - "}
            {cashData.date
              ? format(new Date(cashData.date), "dd/MM/yyyy", { locale: ptBR })
              : "Data não disponível"}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Button onClick={handleExportPDF} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Valor Inicial</p>
              <p className="font-semibold">
                {formatCurrencyInCents(cashData.openingAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Entradas</p>
              <p className="font-semibold text-green-600">
                +{formatCurrencyInCents(cashData.totalCashIn)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Saídas</p>
              <p className="font-semibold text-red-600">
                -{formatCurrencyInCents(cashData.totalCashOut)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {cashData.closingAmount ? "Valor Final" : "Valor Atual"}
              </p>
              <p className="font-semibold text-blue-600">
                {formatCurrencyInCents(
                  cashData.closingAmount ||
                    cashData.openingAmount +
                      cashData.totalCashIn -
                      cashData.totalCashOut,
                )}
              </p>
            </div>
          </div>

          {/* Diferença */}
          {cashData.difference !== null &&
            cashData.difference !== undefined && (
              <div className="rounded-lg border p-4 text-center">
                <p className="text-muted-foreground text-sm">Diferença</p>
                <p
                  className={`text-2xl font-bold ${
                    cashData.difference >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {cashData.difference >= 0 ? "+" : ""}
                  {formatCurrencyInCents(cashData.difference)}
                </p>
              </div>
            )}

          {/* Observações */}
          {(cashData.openingNotes || cashData.closingNotes) && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Observações:</h4>
              {cashData.openingNotes && (
                <div className="text-muted-foreground mb-2 text-sm">
                  <strong>Abertura:</strong> {cashData.openingNotes}
                </div>
              )}
              {cashData.closingNotes && (
                <div className="text-muted-foreground text-sm">
                  <strong>Fechamento:</strong> {cashData.closingNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
