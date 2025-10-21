"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { closeCashAction } from "@/actions/daily-cash";
import { NumericFormat } from "react-number-format";
import { formatCurrencyInCents } from "@/helpers/financial";

const formSchema = z.object({
  closingAmount: z
    .number({
      required_error: "Digite o valor final",
      invalid_type_error: "Digite um valor válido",
    }),
  closingNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CloseCashDialogProps {
  cashData: {
    id: string;
    openingAmount: number;
    totalCashIn: number;
    totalCashOut: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CloseCashDialog({
  cashData,
  open,
  onOpenChange,
  onSuccess,
}: CloseCashDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expectedAmount =
    cashData.openingAmount + cashData.totalCashIn - cashData.totalCashOut;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closingAmount: expectedAmount / 100,
      closingNotes: "",
    },
  });

  // Atualizar valor esperado quando o diálogo abrir
  useEffect(() => {
    if (open) {
      form.setValue("closingAmount", expectedAmount / 100);
    }
  }, [open, expectedAmount, form]);

  const { execute } = useAction(closeCashAction, {
    onSuccess: ({ data }) => {
      console.log("Cash closed successfully:", data);
      toast.success("Caixa fechado com sucesso!");
      form.reset();
      onOpenChange(false);
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: ({ error }) => {
      console.error("Error closing cash:", error);
      const errorMessage =
        error?.serverError ||
        error?.validationErrors ||
        "Erro ao fechar caixa";

      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erro de validação. Verifique os dados.",
      );
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    execute({
      dailyCashId: cashData.id,
      closingAmount: Math.round(data.closingAmount * 100),
      closingNotes: data.closingNotes,
    });
  };

  const closingAmount = form.watch("closingAmount") || 0;
  const difference = Math.round(closingAmount * 100) - expectedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Fechar Caixa
          </DialogTitle>
          <DialogDescription>
            Informe o valor final contado no caixa para realizar o fechamento.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-3 font-medium">Resumo do Caixa</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Inicial:</span>
              <span className="font-medium">
                {formatCurrencyInCents(cashData.openingAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entradas:</span>
              <span className="font-medium text-green-600">
                +{formatCurrencyInCents(cashData.totalCashIn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saídas:</span>
              <span className="font-medium text-red-600">
                -{formatCurrencyInCents(cashData.totalCashOut)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Valor Esperado:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrencyInCents(expectedAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="closingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Final do Caixa</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={true}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue || 0);
                      }}
                      placeholder="R$ 0,00"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  {difference !== 0 && (
                    <p
                      className={`text-sm font-medium ${
                        difference >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Diferença: {difference >= 0 ? "+" : ""}
                      {formatCurrencyInCents(difference)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o fechamento do caixa..."
                      className="resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Fechar Caixa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

