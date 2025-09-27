"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Minus, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getOpenCashAction } from "@/actions/daily-cash";
import { formatCurrencyInCents } from "@/helpers/financial";
import { useCashOperation } from "@/hooks/use-cash-operation";

const cashOperationSchema = z.object({
  type: z.enum(["cash_in", "cash_out", "adjustment"]),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethod: z.enum(["stripe", "cash", "pix", "bank_transfer", "other"]),
  customerName: z.string().optional(),
  customerCpf: z.string().optional(),
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
      paymentMethod: "cash",
      customerName: "",
      customerCpf: "",
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

  const { addOperation, isExecuting } = useCashOperation({
    onSuccess: () => {
      form.reset();
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

    const amountInCents = Math.round(data.amount * 100);

    // Preparar metadata com informações do cliente
    const metadata = {
      customerName: data.customerName || null,
      customerCpf: data.customerCpf || null,
    };

    addOperation({
      dailyCashId: cashData.id,
      type: data.type,
      amountInCents,
      description: data.description,
      paymentMethod: data.paymentMethod,
      metadata: JSON.stringify(metadata),
    });
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
                            defaultValue={field.value}
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
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forma de Pagamento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a forma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Dinheiro</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="stripe">Cartão</SelectItem>
                              <SelectItem value="bank_transfer">
                                Transferência
                              </SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
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
                            {getPaymentMethodLabel(operation.paymentMethod)}
                          </p>
                          {/* Exibição das informações do cliente */}
                          {operation.metadata &&
                            (() => {
                              try {
                                const metadata = JSON.parse(operation.metadata);
                                if (
                                  metadata.customerName ||
                                  metadata.customerCpf
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
