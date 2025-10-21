"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Loader2, Plus, Minus, DollarSign } from "lucide-react";
import { NumericFormat, PatternFormat } from "react-number-format";

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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { addOperationToClosedCashAction } from "@/actions/daily-cash";

const formSchema = z.object({
  type: z.enum(["cash_in", "cash_out", "adjustment"], {
    required_error: "Selecione o tipo de operação",
  }),
  amount: z
    .number({
      required_error: "Digite o valor",
      invalid_type_error: "Digite um valor válido",
    })
    .positive("O valor deve ser maior que zero"),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres"),
  paymentMethods: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma forma de pagamento"),
  customerName: z.string().optional(),
  customerCpf: z.string().optional(),
  receiptNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddOperationToClosedCashFormProps {
  dailyCashId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "cash_in" | "cash_out";
  onSuccess?: () => void;
}

const paymentMethodOptions = [
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão(crédito)" },
  { value: "debit_card", label: "Cartão(débito)" },
  { value: "bank_transfer", label: "Transferência" },
  { value: "other", label: "Outro" },
];

export function AddOperationToClosedCashForm({
  dailyCashId,
  open,
  onOpenChange,
  defaultType = "cash_in",
  onSuccess,
}: AddOperationToClosedCashFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      amount: 0,
      description: "",
      paymentMethods: ["cash"],
      customerName: "",
      customerCpf: "",
      receiptNumber: "",
    },
  });

  // Atualizar o tipo quando o modal abrir ou defaultType mudar
  useEffect(() => {
    if (open) {
      form.setValue("type", defaultType);
    }
  }, [open, defaultType, form]);

  const { execute } = useAction(addOperationToClosedCashAction, {
    onSuccess: ({ data }) => {
      console.log("Operation added successfully:", data);
      toast.success("Operação adicionada com sucesso! Os totais foram recalculados.");
      form.reset({
        type: defaultType,
        amount: 0,
        description: "",
        paymentMethods: ["cash"],
        customerName: "",
        customerCpf: "",
        receiptNumber: "",
      });
      onOpenChange(false);
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: ({ error }) => {
      console.error("Error adding operation:", error);
      const errorMessage =
        error?.serverError ||
        error?.validationErrors ||
        "Erro ao adicionar operação";

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
    
    // Preparar metadata com informações do cliente
    const metadata = {
      customerName: data.customerName || null,
      customerCpf: data.customerCpf || null,
      receiptNumber: data.receiptNumber || null,
    };

    execute({
      dailyCashId,
      type: data.type,
      amountInCents: Math.round(data.amount * 100),
      description: data.description,
      paymentMethods: data.paymentMethods as any[],
      metadata: JSON.stringify(metadata),
    });
  };

  const operationType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Nova Operação
          </DialogTitle>
          <DialogDescription>
            Registre entradas e saídas de dinheiro no caixa diário
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo e Valor */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Operação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
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
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue || 0);
                        }}
                        placeholder="R$ 0,00"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Formas de Pagamento */}
            <FormField
              control={form.control}
              name="paymentMethods"
              render={() => (
                <FormItem>
                  <FormLabel>Formas de Pagamento</FormLabel>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {paymentMethodOptions.map((method) => (
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
                                checked={field.value?.includes(method.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        method.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== method.value,
                                        ),
                                      );
                                }}
                                disabled={isSubmitting}
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

            {/* Informações do Cliente */}
            <div className="space-y-3">
              <h3 className="font-medium">Informações do Cliente</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          disabled={isSubmitting}
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
                        <PatternFormat
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value.value);
                          }}
                          format="###.###.###-##"
                          mask="_"
                          customInput={Input}
                          placeholder="000.000.000-00"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
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
                      disabled={isSubmitting}
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Seja específico sobre o motivo da operação para facilitar o
                    controle
                  </FormDescription>
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
                <Plus className="mr-2 h-4 w-4" />
                Registrar Operação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
