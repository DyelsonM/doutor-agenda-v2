"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lock, Loader2, Calculator } from "lucide-react";
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

import { closeCashAction, getOpenCashAction } from "@/actions/daily-cash";
import { formatCurrencyInCents } from "@/helpers/financial";

const closeCashSchema = z.object({
  closingAmount: z
    .number()
    .min(0, "Valor final deve ser maior ou igual a zero"),
  closingNotes: z.string().optional(),
});

type CloseCashForm = z.infer<typeof closeCashSchema>;

export default function CloseCashPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashData, setCashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CloseCashForm>({
    resolver: zodResolver(closeCashSchema),
    defaultValues: {
      closingAmount: 0,
      closingNotes: "",
    },
  });

  const { execute: executeGetCash } = useAction(getOpenCashAction, {
    onSuccess: ({ data }) => {
      // A action retorna {success: true, data: {...}}
      const cashData = data?.data;

      if (cashData && cashData.status === "open") {
        setCashData(cashData);
        // Pré-preencher com valor esperado
        const expectedAmount =
          cashData.openingAmount + cashData.totalCashIn - cashData.totalCashOut;
        form.setValue("closingAmount", expectedAmount / 100);
      } else {
        toast.error("Nenhum caixa aberto encontrado");
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

  const { execute: executeCloseCash } = useAction(closeCashAction, {
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSuccess: ({ data }) => {
      toast.success("Caixa fechado com sucesso!");
      router.push("/daily-cash");
    },
    onError: ({ error }) => {
      console.error("Error closing cash:", error);

      const errorMessage =
        error?.serverError ||
        (error?.validationErrors
          ? "Dados inválidos. Verifique os campos."
          : "Erro ao fechar caixa");
      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    executeGetCash({});
  }, []);

  const onSubmit = (data: CloseCashForm) => {
    if (!cashData || !cashData.id) {
      toast.error("Dados do caixa não encontrados. Recarregue a página.");
      return;
    }

    const amountInCents = Math.round(data.closingAmount * 100);

    executeCloseCash({
      dailyCashId: cashData.id,
      closingAmount: amountInCents,
      closingNotes: data.closingNotes || undefined,
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

  const expectedAmount =
    cashData.openingAmount + cashData.totalCashIn - cashData.totalCashOut;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Fechar Caixa</PageTitle>
          </div>
          <PageDescription>
            Feche o caixa diário e gere o relatório de fechamento
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Resumo do caixa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumo do Caixa -{" "}
                {cashData.date
                  ? format(new Date(cashData.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  : "Data não disponível"}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    Valor Esperado
                  </p>
                  <p className="font-semibold text-blue-600">
                    {formatCurrencyInCents(expectedAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de fechamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Fechamento de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="closingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Final do Caixa</FormLabel>
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
                          disabled={isSubmitting}
                        />
                        <FormMessage />
                        <p className="text-muted-foreground text-sm">
                          Valor esperado:{" "}
                          {formatCurrencyInCents(expectedAmount)}
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Observações sobre o fechamento do caixa..."
                            disabled={isSubmitting}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fechando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Fechar Caixa
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                • O valor final deve corresponder ao dinheiro físico encontrado
                no caixa
              </p>
              <p>
                • A diferença entre o valor esperado e o real será calculada
                automaticamente
              </p>
              <p>
                • Após o fechamento, será gerado um relatório completo do dia
              </p>
              <p>• O caixa não poderá ser reaberto após o fechamento</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
