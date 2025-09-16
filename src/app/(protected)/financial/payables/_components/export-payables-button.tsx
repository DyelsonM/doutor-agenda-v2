"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { exportPayablesAction } from "@/actions/export-payables";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportPayablesButtonProps {
  filters?: {
    status?: "pending" | "paid" | "overdue" | "cancelled";
    category?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export function ExportPayablesButton({
  filters = {},
}: ExportPayablesButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const { execute: exportPayables } = useAction(exportPayablesAction, {
    onSuccess: (data: {
      format: string;
      data: {
        payables: Array<{
          id: string;
          description: string;
          amount: number;
          category: string;
          status: string;
          dueDate: Date;
          paidDate?: Date | null;
          supplierName?: string | null;
          supplierDocument?: string | null;
          invoiceNumber?: string | null;
          notes?: string | null;
          createdAt: Date;
        }>;
        stats: {
          total: number;
          pending: number;
          paid: number;
          overdue: number;
          count: number;
        };
        period: {
          type: string;
          startDate: Date;
          endDate: Date;
        };
      };
      filename: string;
    }) => {
      setIsExporting(false);

      if (data.format === "csv") {
        downloadCSV(
          data.data.payables,
          data.data.stats,
          data.filename,
          data.data.period,
        );
      } else if (data.format === "pdf") {
        downloadPDF(
          data.data.payables,
          data.data.stats,
          data.filename,
          data.data.period,
        );
      }

      toast.success("Relatório exportado com sucesso!");
    },
    onError: ({ error }) => {
      setIsExporting(false);
      toast.error(error.serverError || "Erro ao exportar relatório");
    },
    onExecute: () => {
      setIsExporting(true);
    },
  });

  const handleExport = (
    format: "csv" | "pdf",
    period: "daily" | "monthly" | "custom",
  ) => {
    exportPayables({
      format,
      period,
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
      category: filters.category,
    });
  };

  const downloadCSV = (
    payables: Array<{
      id: string;
      description: string;
      amount: number;
      category: string;
      status: string;
      dueDate: Date;
      paidDate?: Date | null;
      supplierName?: string | null;
      supplierDocument?: string | null;
      invoiceNumber?: string | null;
      notes?: string | null;
      createdAt: Date;
    }>,
    stats: {
      total: number;
      pending: number;
      paid: number;
      overdue: number;
      count: number;
    },
    filename: string,
    periodInfo?: {
      type: string;
      startDate: Date;
      endDate: Date;
    },
  ) => {
    // Cabeçalho do CSV com informações do período
    const periodText = periodInfo
      ? `Relatório ${periodInfo.type === "daily" ? "Diário" : periodInfo.type === "monthly" ? "Mensal" : "Personalizado"} - ${new Date(periodInfo.startDate).toLocaleDateString("pt-BR")} a ${new Date(periodInfo.endDate).toLocaleDateString("pt-BR")}`
      : "Relatório de Contas a Pagar";

    const csvContent = [
      periodText,
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      "",
      "ESTATÍSTICAS",
      `Total Geral,R$ ${stats.total.toFixed(2)}`,
      `Pendentes,R$ ${stats.pending.toFixed(2)}`,
      `Pagas,R$ ${stats.paid.toFixed(2)}`,
      `Vencidas,R$ ${stats.overdue.toFixed(2)}`,
      `Quantidade Total,${stats.count}`,
      "",
      "DADOS DAS CONTAS",
      "ID,Descrição,Valor (R$),Categoria,Status,Data Vencimento,Data Pagamento,Fornecedor,Documento Fornecedor,Número Nota,Observações,Data Criação",
      ...payables.map((payable) =>
        [
          payable.id,
          payable.description,
          payable.amount.toFixed(2),
          payable.category,
          payable.status,
          payable.dueDate
            ? new Date(payable.dueDate).toLocaleDateString("pt-BR")
            : "",
          payable.paidDate
            ? new Date(payable.paidDate).toLocaleDateString("pt-BR")
            : "",
          payable.supplierName || "",
          payable.supplierDocument || "",
          payable.invoiceNumber || "",
          payable.notes || "",
          new Date(payable.createdAt).toLocaleDateString("pt-BR"),
        ]
          .map((cell) => `"${cell}"`)
          .join(","),
      ),
    ].join("\n");

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (
    payables: Array<{
      id: string;
      description: string;
      amount: number;
      category: string;
      status: string;
      dueDate: Date;
      paidDate?: Date | null;
      supplierName?: string | null;
      supplierDocument?: string | null;
      invoiceNumber?: string | null;
      notes?: string | null;
      createdAt: Date;
    }>,
    stats: {
      total: number;
      pending: number;
      paid: number;
      overdue: number;
      count: number;
    },
    filename: string,
    periodInfo?: {
      type: string;
      startDate: Date;
      endDate: Date;
    },
  ) => {
    // Para PDF, vamos criar um HTML simples e usar window.print()
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Não foi possível abrir a janela de impressão");
      return;
    }

    const periodText = periodInfo
      ? `Relatório ${periodInfo.type === "daily" ? "Diário" : periodInfo.type === "monthly" ? "Mensal" : "Personalizado"}`
      : "Relatório de Contas a Pagar";

    const periodRange = periodInfo
      ? `${new Date(periodInfo.startDate).toLocaleDateString("pt-BR")} a ${new Date(periodInfo.endDate).toLocaleDateString("pt-BR")}`
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${periodText}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            h2 { color: #666; border-bottom: 1px solid #ccc; }
            .period-info { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .stats { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            .stats h3 { margin-top: 0; }
            .stats div { margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${periodText}</h1>
          ${periodRange ? `<div class="period-info"><strong>Período:</strong> ${periodRange}</div>` : ""}
          <div class="period-info"><strong>Gerado em:</strong> ${new Date().toLocaleString("pt-BR")}</div>
          
          <div class="stats">
            <h3>Resumo</h3>
            <div><strong>Total Geral:</strong> R$ ${stats.total.toFixed(2)}</div>
            <div><strong>Pendentes:</strong> R$ ${stats.pending.toFixed(2)}</div>
            <div><strong>Pagas:</strong> R$ ${stats.paid.toFixed(2)}</div>
            <div><strong>Vencidas:</strong> R$ ${stats.overdue.toFixed(2)}</div>
            <div><strong>Quantidade Total:</strong> ${stats.count}</div>
          </div>

          <h2>Detalhes das Contas</h2>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              ${payables
                .map(
                  (payable) => `
                <tr>
                  <td>${payable.description}</td>
                  <td>R$ ${payable.amount.toFixed(2)}</td>
                  <td>${payable.category}</td>
                  <td>${payable.status}</td>
                  <td>${payable.dueDate ? new Date(payable.dueDate).toLocaleDateString("pt-BR") : ""}</td>
                  <td>${payable.supplierName || ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Relatório Diário</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("csv", "daily")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV Diário
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf", "daily")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Diário
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Relatório Mensal</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("csv", "monthly")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV Mensal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf", "monthly")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Mensal
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Período Personalizado</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("csv", "custom")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV Personalizado
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf", "custom")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Personalizado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
