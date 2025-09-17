"use client";

import { Download, FileText } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { exportDocumentAction } from "@/actions/export-document";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExportDocumentData,
  exportToPDF,
  exportToText,
} from "@/helpers/export-document";

interface ExportDocumentButtonProps {
  documentId: string;
  documentTitle: string;
}

export function ExportDocumentButton({
  documentId,
  documentTitle: _documentTitle, // Prefixo _ indica parâmetro intencionalmente não usado
}: ExportDocumentButtonProps) {
  const { execute: exportDocument, isExecuting } = useAction(
    exportDocumentAction,
    {
      onSuccess: async ({ data }) => {
        if (data?.success && data.data) {
          const exportData = data.data as ExportDocumentData;

          try {
            if (data.format === "pdf") {
              await exportToPDF(exportData);
              toast.success("Documento exportado como PDF com sucesso!");
            } else {
              exportToText(exportData);
              toast.success("Documento exportado como texto com sucesso!");
            }
          } catch (error) {
            console.error("Erro ao exportar documento:", error);
            toast.error("Erro ao exportar documento");
          }
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao exportar documento");
      },
    },
  );

  const handleExport = (format: "pdf" | "docx") => {
    exportDocument({ documentId, format });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isExecuting}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Exportar documento</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExecuting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("docx")}
          disabled={isExecuting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Exportar como Texto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
