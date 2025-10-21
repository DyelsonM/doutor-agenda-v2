"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { openCashAction } from "@/actions/daily-cash";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const openCashSchema = z.object({
  openingAmount: z
    .number()
    .min(0, "Valor inicial deve ser maior ou igual a zero"),
  openingNotes: z.string().optional(),
  identifier: z.string().optional(),
  date: z.date().optional(),
});

type OpenCashForm = z.infer<typeof openCashSchema>;

export default function OpenCashPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpenCashForm>({
    resolver: zodResolver(openCashSchema),
    defaultValues: {
      openingAmount: 0,
      openingNotes: "",
      identifier: "",
      date: new Date(),
    },
  });

  const { execute: executeOpenCash } = useAction(openCashAction, {
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSuccess: ({ data }) => {
      const cashDate = data?.data?.date 
        ? format(new Date(data.data.date), "dd/MM/yyyy", { locale: ptBR })
        : "hoje";
      toast.success(`Caixa aberto com sucesso para ${cashDate}!`);
      router.push("/daily-cash");
    },
    onError: ({ error }) => {
      console.error("Error opening cash:", error);

      const errorMessage =
        error?.serverError ||
        (error?.validationErrors
          ? "Dados inválidos. Verifique os campos."
          : "Erro ao abrir caixa");
      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: OpenCashForm) => {
    const amountInCents = Math.round(data.openingAmount * 100);

    executeOpenCash({
      openingAmount: amountInCents,
      openingNotes: data.openingNotes || undefined,
      identifier: data.identifier || undefined,
      date: data.date ? format(data.date, "yyyy-MM-dd") : undefined,
    });
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <PageTitle>Abrir Caixa</PageTitle>
          </div>
          <PageDescription>
            Abra o caixa diário para começar a registrar operações financeiras
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
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Abertura de Caixa
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
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Caixa</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date(new Date().setDate(new Date().getDate() + 30))
                              }
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Escolha a data para abrir o caixa (padrão: hoje)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Inicial do Caixa</FormLabel>
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identificador do Caixa (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Caixa #123456"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Observações sobre a abertura do caixa..."
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
                          Abrindo...
                        </>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Abrir Caixa
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                • Você pode escolher a data para abrir o caixa (até 30 dias no
                futuro)
              </p>
              <p>
                • O valor inicial será usado como base para calcular o valor
                esperado no fechamento
              </p>
              <p>
                • Todas as operações de entrada e saída serão registradas
                automaticamente
              </p>
              <p>
                • Você poderá adicionar observações sobre a abertura do caixa
              </p>
              <p>• O caixa ficará aberto até que seja fechado manualmente</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
