"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { generateFinancialReportAction } from "@/actions/financial";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const generateReportSchema = z
  .object({
    reportType: z.enum(["daily", "monthly", "yearly"]),
    periodStart: z.date({
      required_error: "Data de início é obrigatória",
      invalid_type_error: "Data de início inválida",
    }),
    periodEnd: z.date({
      required_error: "Data de fim é obrigatória",
      invalid_type_error: "Data de fim inválida",
    }),
  })
  .refine(
    (data) => {
      return data.periodStart <= data.periodEnd;
    },
    {
      message: "Data de início deve ser anterior ou igual à data de fim",
      path: ["periodEnd"],
    },
  );

type GenerateReportFormData = z.infer<typeof generateReportSchema>;

export function GenerateReportButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { execute: generateReport, isExecuting } = useAction(
    generateFinancialReportAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message ?? "Relatório gerado com sucesso!");
        setOpen(false);
        form.reset();
        router.refresh(); // Atualiza a página para mostrar o novo relatório
      },
      onError: ({ error }) => {
        console.error("Erro ao gerar relatório:", error);
        toast.error(
          error.serverError ||
            error.validationErrors?.message ||
            "Erro ao gerar relatório. Verifique os dados e tente novamente.",
        );
      },
    },
  );

  const form = useForm<GenerateReportFormData>({
    resolver: zodResolver(generateReportSchema),
    defaultValues: {
      reportType: "daily",
      periodStart: new Date(),
      periodEnd: new Date(),
    },
  });

  const onSubmit = (data: GenerateReportFormData) => {
    // Garantir que as datas sejam objetos Date válidos
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    generateReport({
      reportType: data.reportType,
      periodStart,
      periodEnd,
    });
  };

  const handleReportTypeChange = (type: string) => {
    const now = new Date();

    switch (type) {
      case "daily":
        form.setValue("periodStart", now);
        form.setValue("periodEnd", now);
        break;
      case "monthly":
        form.setValue(
          "periodStart",
          new Date(now.getFullYear(), now.getMonth(), 1),
        );
        form.setValue("periodEnd", now);
        break;
      case "yearly":
        form.setValue("periodStart", new Date(now.getFullYear(), 0, 1));
        form.setValue("periodEnd", now);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Relatório Financeiro</DialogTitle>
          <DialogDescription>
            Configure os parâmetros para gerar um relatório financeiro
            personalizado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Relatório</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleReportTypeChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Fim</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isExecuting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isExecuting}>
                {isExecuting ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
