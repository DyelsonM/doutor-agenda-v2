"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { getOpenCashAction } from "@/actions/daily-cash";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyInCents } from "@/helpers/financial";
import { useCashOperation } from "@/hooks/use-cash-operation";

const cashOperationSchema = z.object({
  type: z.enum(["cash_in", "cash_out", "adjustment"]),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethods: z
    .array(z.enum(["credit_card", "debit_card", "cash", "pix", "bank_transfer", "other"]))
    .min(1, "Selecione pelo menos uma forma de pagamento"),
  customerName: z.string().optional(),
  customerCpf: z.string().optional(),
  receiptNumber: z.string().optional(),
});

type CashOperationForm = z.infer<typeof cashOperationSchema>;

// Funções auxiliares para exibição
const getOperationTypeIcon = (type: string) => {
  switch (type) {
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

const getOperationTypeLabel = (type: string) => {
  switch (type) {
    case "cash_in":
      return "Entrada";
    case "cash_out":
      return "Saída";
    case "adjustment":
      return "Ajuste";
    default:
      return "Desconhecido";
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case "cash":
      return "Dinheiro";
    case "pix":
      return "PIX";
    case "credit_card":
      return "Cartão(crédito)";
    case "debit_card":
      return "Cartão(débito)";
    case "stripe":
      return "Cartão";
    case "bank_transfer":
      return "Transferência";
    case "other":
      return "Outro";
    default:
      return "Não informado";
  }
};

const getPaymentMethodsLabels = (methods: string[]) => {
  if (!methods || methods.length === 0) return "Não informado";
  return methods.map(getPaymentMethodLabel).join(", ");
};

export default function CashOperationsPage() {
  const router = useRouter();
  const [cashData, setCashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CashOperationForm>({
    resolver: zodResolver(cashOperationSchema),
    defaultValues: {
      type: "cash_in",
      amount: 0,
      description: "",
      paymentMethods: ["cash"],
      customerName: "",
      customerCpf: "",
      receiptNumber: "",
    },
  });

  const { execute: executeGetCash } = useAction(getOpenCashAction, {
    onSuccess: ({ data }) => {
      // A action retorna {success: true, data: {...}}
      const cashData = data?.data;

      if (cashData && cashData.status === "open") {
        setCashData(cashData);
      } else {
        toast.error("Nenhum caixa aberto encontrado para hoje");
        router.push("/daily-cash");
      }
      setIsLoading(false);
    },
    onError: ({ error }) => {
      console.error("Error loading cash data:", error); // Debug log
      toast.error(error.serverError || "Erro ao carregar dados do caixa");
      setIsLoading(false);
    },
  });

  const { addOperation, deleteOperation, isExecuting, isDeleting } =
    useCashOperation({
      onSuccess: () => {
        // Resetar formulário mantendo o tipo de operação selecionado
        const currentType = form.getValues("type");
        const currentPaymentMethods = form.getValues("paymentMethods");
        form.reset({
          type: currentType, // Manter o tipo atual
          amount: 0,
          description: "",
          paymentMethods:
            currentPaymentMethods.length > 0 ? currentPaymentMethods : ["cash"],
          customerName: "",
          customerCpf: "",
          receiptNumber: "",
        });
        // Recarregar dados do caixa após operação
        executeGetCash({});
      },
    });

  useEffect(() => {
    executeGetCash({});
  }, []);

  const onSubmit = (data: CashOperationForm) => {
    if (!cashData || !cashData.id) {
      toast.error("Dados do caixa não encontrados. Recarregue a página.");
      return;
    }

    // Debug log para verificar o tipo sendo enviado
    console.log("Operação sendo enviada:", {
      type: data.type,
      amount: data.amount,
      description: data.description,
      paymentMethods: data.paymentMethods,
    });

    const amountInCents = Math.round(data.amount * 100);

    // Preparar metadata com informações do cliente
    const metadata = {
      customerName: data.customerName || null,
      customerCpf: data.customerCpf || null,
      receiptNumber: data.receiptNumber || null,
    };

    addOperation({
      dailyCashId: cashData.id,
      type: data.type,
      amountInCents,
      description: data.description,
      paymentMethods: data.paymentMethods,
      metadata: JSON.stringify(metadata),
    });
  };

  const handleDeleteOperation = (operationId: string) => {
    deleteOperation({ operationId });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!cashData) {
    return (
      <PageContainer>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Nenhum caixa aberto encontrado.
          </p>
          <Button onClick={() => router.push("/daily-cash")} className="mt-4">
            Voltar
          </Button>
        </div>
      </PageContainer>
    );
  }

  const getOperationTypeIcon = (type: string) => {
    switch (type) {
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

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case "cash_in":
        return "Entrada";
      case "cash_out":
        return "Saída";
      case "adjustment":
        return "Ajuste";
      default:
        return "Desconhecido";
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Operações de Caixa</PageTitle>
          </div>
          <PageDescription>
            Registre entradas e saídas de dinheiro no caixa diário
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isExecuting}
          >
            Voltar
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Resumo atual do caixa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Atual do Caixa
              </CardTitle>
              <div className="text-muted-foreground text-sm">
                {cashData.date
                  ? format(new Date(cashData.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  : "Data não disponível"}{" "}
                - Aberto por:{" "}
                {cashData.user?.name || "Usuário não identificado"}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Valor Inicial</p>
                  <p className="text-lg font-semibold">
                    {formatCurrencyInCents(cashData.openingAmount || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Entradas</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrencyInCents(cashData.totalCashIn || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Saídas</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatCurrencyInCents(cashData.totalCashOut || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Valor Atual</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {formatCurrencyInCents(
                      (cashData.openingAmount || 0) +
                        (cashData.totalCashIn || 0) -
                        (cashData.totalCashOut || 0),
                    )}
                  </p>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      Horário de abertura:
                    </p>
                    <p className="font-medium">
                      {cashData.openingTime
                        ? format(new Date(cashData.openingTime), "HH:mm", {
                            locale: ptBR,
                          })
                        : "Horário não disponível"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total de operações:</p>
                    <p className="font-medium">
                      {cashData.operations?.length || 0} operações
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de operação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Registrar Nova Operação
              </CardTitle>
              <div className="text-muted-foreground text-sm">
                Registre entradas e saídas de dinheiro no caixa diário
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Operação</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash_in">
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4 text-green-600" />
                                  Entrada de Dinheiro
                                </div>
                              </SelectItem>
                              <SelectItem value="cash_out">
                                <div className="flex items-center gap-2">
                                  <Minus className="h-4 w-4 text-red-600" />
                                  Saída de Dinheiro
                                </div>
                              </SelectItem>
                              <SelectItem value="adjustment">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-blue-600" />
                                  Ajuste
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Operação</FormLabel>
                          <NumericFormat
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value.floatValue);
                            }}
                            decimalScale={2}
                            fixedDecimalScale
                            decimalSeparator=","
                            allowNegative={false}
                            allowLeadingZeros={false}
                            thousandSeparator="."
                            customInput={Input}
                            prefix="R$ "
                            placeholder="0,00"
                            disabled={isExecuting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Formas de Pagamento</FormLabel>
                          <div className="space-y-2">
                            {([
                              { value: "cash", label: "Dinheiro" },
                              { value: "pix", label: "PIX" },
                              { value: "credit_card", label: "Cartão(crédito)" },
                              { value: "debit_card", label: "Cartão(débito)" },
                              {
                                value: "bank_transfer",
                                label: "Transferência",
                              },
                              { value: "other", label: "Outro" },
                            ] as const).map((method) => (
                              <FormField
                                key={method.value}
                                control={form.control}
                                name="paymentMethods"
                                render={({ field }) => (
                                  <FormItem
                                    key={method.value}
                                    className="flex flex-row items-start space-y-0 space-x-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          method.value,
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                method.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== method.value,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {method.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Informações do Cliente */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Informações do Cliente
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Cliente</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nome completo do cliente"
                                disabled={isExecuting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerCpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF do Cliente</FormLabel>
                            <FormControl>
                              <NumericFormat
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value.value);
                                }}
                                format="###.###.###-##"
                                mask="_"
                                customInput={Input}
                                placeholder="000.000.000-00"
                                disabled={isExecuting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="receiptNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Recibo (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="EX: #0001234"
                                disabled={isExecuting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Operação</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descreva a operação (ex: Venda de produto, Troco para cliente, Ajuste de diferença...)"
                            disabled={isExecuting}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-muted-foreground text-sm">
                          Seja específico sobre o motivo da operação para
                          facilitar o controle
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isExecuting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isExecuting}
                      className="flex-1"
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Registrar Operação
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Histórico de operações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Operações do Dia
              </CardTitle>
              <div className="text-muted-foreground text-sm">
                Todas as operações registradas hoje (
                {cashData.operations?.length || 0} operações)
              </div>
            </CardHeader>
            <CardContent>
              {cashData.operations && cashData.operations.length > 0 ? (
                <div className="space-y-3">
                  {cashData.operations.map((operation: any) => (
                    <div
                      key={operation.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                          {getOperationTypeIcon(operation.type)}
                        </div>
                        <div>
                          <p className="font-medium">{operation.description}</p>
                          <p className="text-muted-foreground text-sm">
                            {operation.createdAt
                              ? format(new Date(operation.createdAt), "HH:mm", {
                                  locale: ptBR,
                                })
                              : "Horário não disponível"}{" "}
                            - {getOperationTypeLabel(operation.type)} -{" "}
                            {(() => {
                              try {
                                if (operation.metadata) {
                                  const metadata = JSON.parse(
                                    operation.metadata,
                                  );
                                  if (metadata.paymentMethods) {
                                    return getPaymentMethodsLabels(
                                      metadata.paymentMethods,
                                    );
                                  }
                                }
                              } catch (e) {
                                // Fallback para o campo antigo
                              }
                              return getPaymentMethodLabel(
                                operation.paymentMethod,
                              );
                            })()}
                          </p>
                          {/* Exibição das informações do cliente */}
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
                                        <p className="text-sm font-medium text-blue-600">
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
                            className={`text-lg font-semibold ${
                              operation.type === "cash_in"
                                ? "text-green-600"
                                : operation.type === "cash_out"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {operation.type === "cash_in" ? "+" : "-"}
                            {formatCurrencyInCents(operation.amountInCents)}
                          </p>
                        </div>
                        {/* Botão de exclusão - apenas para operações que podem ser excluídas */}
                        {operation.type !== "opening" &&
                          operation.type !== "closing" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir Operação
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta
                                    operação? Esta ação não pode ser desfeita.
                                    <br />
                                    <br />
                                    <strong>Operação:</strong>{" "}
                                    {operation.description}
                                    <br />
                                    <strong>Valor:</strong>{" "}
                                    {formatCurrencyInCents(
                                      operation.amountInCents,
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteOperation(operation.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Excluindo...
                                      </>
                                    ) : (
                                      "Excluir"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <DollarSign className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-lg">
                    Nenhuma operação registrada ainda
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Registre a primeira operação usando o formulário acima
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
