"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { Download, DollarSign, FileText, Minus, Plus, PlusCircle, MinusCircle, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { formatCurrencyInCents } from "@/helpers/financial";
import { deleteOperationFromClosedCashAction } from "@/actions/daily-cash";
import { AddOperationToClosedCashForm } from "./add-operation-to-closed-cash-form";
import { CloseCashDialog } from "./close-cash-dialog";

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
  const router = useRouter();
  const [addOperationOpen, setAddOperationOpen] = useState(false);
  const [operationType, setOperationType] = useState<"cash_in" | "cash_out">("cash_in");
  const [deletingOperationId, setDeletingOperationId] = useState<string | null>(null);
  const [closeCashOpen, setCloseCashOpen] = useState(false);

  const { execute: executeDeleteOperation } = useAction(deleteOperationFromClosedCashAction, {
    onSuccess: ({ data }) => {
      console.log("Operation deleted successfully:", data);
      toast.success("Operação excluída com sucesso! Os totais foram recalculados.");
      setDeletingOperationId(null);
      router.refresh();
    },
    onError: ({ error }) => {
      console.error("Error deleting operation:", error);
      const errorMessage =
        error?.serverError ||
        error?.validationErrors ||
        "Erro ao excluir operação";

      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erro de validação. Verifique os dados.",
      );
      setDeletingOperationId(null);
    },
  });

  const handleDeleteOperation = (operationId: string) => {
    setDeletingOperationId(operationId);
    executeDeleteOperation({ operationId });
  };

  const handleAddOperationSuccess = () => {
    router.refresh();
  };

  const handleCloseCashSuccess = () => {
    router.refresh();
  };

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
  const isClosed = cashData.status === "closed";

  return (
    <>
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
              
              {/* Botão de fechar caixa quando estiver aberto */}
              {!isClosed && (
                <Button
                  onClick={() => setCloseCashOpen(true)}
                  size="sm"
                  variant="default"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar Caixa
                </Button>
              )}

              {/* Botões de adicionar operações quando estiver fechado */}
              {isClosed && (
                <>
                  <Button
                    onClick={() => {
                      setOperationType("cash_in");
                      setAddOperationOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Entrada
                  </Button>
                  <Button
                    onClick={() => {
                      setOperationType("cash_out");
                      setAddOperationOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Saída
                  </Button>
                </>
              )}

              <Button onClick={handleExportPDF} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mensagem informativa para caixas abertos */}
          {!isClosed && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800">
                    Caixa Aberto - Esqueceu de Fechar?
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Use o botão <strong>"Fechar Caixa"</strong> no cabeçalho acima para fechar este caixa. Após o fechamento, você poderá adicionar operações esquecidas usando os botões "Entrada" e "Saída".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem informativa para caixas fechados */}
          {isClosed && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800">
                    Adicionar Operações Esquecidas
                  </h4>
                  <p className="mt-1 text-sm text-green-700">
                    Use os botões <strong>"Entrada"</strong> e <strong>"Saída"</strong> no cabeçalho acima para adicionar operações que foram esquecidas. Os totais serão recalculados automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Histórico de Operações */}
          {cashData.operations && cashData.operations.length > 0 && (
            <div>
              <h4 className="mb-4 text-lg font-medium">
                Histórico de Operações
              </h4>
              <div className="space-y-3">
                {cashData.operations.map((operation: any) => {
                  const isCashIn = operation.type === "cash_in";
                  const typeLabel = isCashIn
                    ? "Entrada"
                    : operation.type === "cash_out"
                      ? "Saída"
                      : "Ajuste";

                  const getTypeIcon = () => {
                    switch (operation.type) {
                      case "cash_in":
                        return <Plus className="h-4 w-4 text-green-600" />;
                      case "cash_out":
                        return <Minus className="h-4 w-4 text-red-600" />;
                      case "adjustment":
                        return <DollarSign className="h-4 w-4 text-blue-600" />;
                      default:
                        return <DollarSign className="h-4 w-4 text-gray-600" />;
                    }
                  };

                  const isOpeningOrClosing = operation.type === "opening" || operation.type === "closing";
                  const canDelete = isClosed && !isOpeningOrClosing;

                  // Verificar se a operação foi adicionada após o fechamento
                  let addedToClosedCash = false;
                  try {
                    const metadata = JSON.parse(operation.metadata || "{}");
                    addedToClosedCash = metadata.addedToClosedCash === true;
                  } catch (e) {
                    // Ignorar erro de parsing
                  }

                  return (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getTypeIcon()}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{operation.description}</p>
                            {addedToClosedCash && (
                              <Badge variant="outline" className="text-xs">
                                Adicionado após fechamento
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <span>{typeLabel}</span>
                            <span>
                              {operation.createdAt
                                ? format(
                                    new Date(operation.createdAt),
                                    "HH:mm",
                                    { locale: ptBR },
                                  )
                                : "Horário não disponível"}
                            </span>
                            {operation.user?.name && (
                              <span>• {operation.user.name}</span>
                            )}
                          </div>
                          {/* Exibir informações do cliente se existirem */}
                          {operation.metadata &&
                            (() => {
                              try {
                                const metadata = JSON.parse(operation.metadata);
                                if (
                                  metadata.customerName ||
                                  metadata.customerCpf ||
                                  metadata.receiptNumber
                                ) {
                                  return (
                                    <div className="mt-2 space-y-1">
                                      {metadata.customerName && (
                                        <p className="text-sm text-blue-600">
                                          👤 {metadata.customerName}
                                        </p>
                                      )}
                                      {metadata.customerCpf && (
                                        <p className="text-sm text-blue-600">
                                          📋 CPF: {metadata.customerCpf}
                                        </p>
                                      )}
                                      {metadata.receiptNumber && (
                                        <p className="text-sm text-blue-600">
                                          🧾 Recibo: {metadata.receiptNumber}
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // Ignorar erro de parsing
                              }
                              return null;
                            })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isCashIn ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCashIn ? "+" : "-"}
                            {formatCurrencyInCents(operation.amountInCents)}
                          </p>
                        </div>
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={deletingOperationId === operation.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Operação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta operação? Os totais do caixa serão recalculados automaticamente.
                                  <br />
                                  <br />
                                  <strong>Descrição:</strong> {operation.description}
                                  <br />
                                  <strong>Valor:</strong> {formatCurrencyInCents(operation.amountInCents)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOperation(operation.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingOperationId === operation.id ? "Excluindo..." : "Excluir"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <AddOperationToClosedCashForm
      dailyCashId={cashData.id}
      open={addOperationOpen}
      onOpenChange={setAddOperationOpen}
      defaultType={operationType}
      onSuccess={handleAddOperationSuccess}
    />

    <CloseCashDialog
      cashData={{
        id: cashData.id,
        openingAmount: cashData.openingAmount,
        totalCashIn: cashData.totalCashIn,
        totalCashOut: cashData.totalCashOut,
      }}
      open={closeCashOpen}
      onOpenChange={setCloseCashOpen}
      onSuccess={handleCloseCashSuccess}
    />
    </>
  );
}
