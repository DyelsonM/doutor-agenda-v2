"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPartnerExam } from "@/actions/upsert-partner-exam";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
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
import { partnerExamsTable } from "@/db/schema";

const formSchema = z.object({
  code: z.string().trim().min(1, {
    message: "Código/Sigla é obrigatório.",
  }),
  name: z.string().trim().min(1, {
    message: "Nome do exame é obrigatório.",
  }),
  description: z.string().trim().optional(),
  popularPriceInCents: z
    .number()
    .min(0, {
      message: "Valor CL Popular deve ser maior ou igual a 0.",
    })
    .optional(),
  particularPriceInCents: z
    .number()
    .min(0, {
      message: "Valor Particular deve ser maior ou igual a 0.",
    })
    .optional(),
});

type PartnerExam = typeof partnerExamsTable.$inferSelect;

interface UpsertPartnerExamFormProps {
  isOpen: boolean;
  partnerId: string;
  exam?: PartnerExam;
  onSuccess?: () => void;
}

const UpsertPartnerExamForm = ({
  partnerId,
  exam,
  onSuccess,
  isOpen,
}: UpsertPartnerExamFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: exam?.code ?? "",
      name: exam?.name ?? "",
      description: exam?.description ?? "",
      popularPriceInCents: exam?.popularPriceInCents
        ? exam.popularPriceInCents / 100
        : 0,
      particularPriceInCents: exam?.particularPriceInCents
        ? exam.particularPriceInCents / 100
        : 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        code: exam?.code ?? "",
        name: exam?.name ?? "",
        description: exam?.description ?? "",
        popularPriceInCents: exam?.popularPriceInCents
          ? exam.popularPriceInCents / 100
          : 0,
        particularPriceInCents: exam?.particularPriceInCents
          ? exam.particularPriceInCents / 100
          : 0,
      });
    }
  }, [isOpen, form, exam]);

  const upsertPartnerExamAction = useAction(upsertPartnerExam, {
    onSuccess: () => {
      toast.success("Exame salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar exame.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertPartnerExamAction.execute({
      ...values,
      id: exam?.id,
      partnerId,
      popularPriceInCents:
        values.popularPriceInCents && values.popularPriceInCents > 0
          ? Math.round(values.popularPriceInCents * 100)
          : undefined,
      particularPriceInCents:
        values.particularPriceInCents && values.particularPriceInCents > 0
          ? Math.round(values.particularPriceInCents * 100)
          : undefined,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{exam ? "Editar Exame" : "Adicionar Exame"}</DialogTitle>
        <DialogDescription>
          {exam
            ? "Edite as informações do exame."
            : "Adicione um novo exame para este parceiro."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código/Sigla</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Ex: LAB001, HEMO, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Exame</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Ex: Hemograma completo, Glicose, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full"
                    placeholder="Descreva o exame, instruções especiais, preparo necessário, etc."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="popularPriceInCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor CL Popular (R$)</FormLabel>
                  <FormControl>
                    <NumericFormat
                      value={field.value || 0}
                      onValueChange={(value) => {
                        field.onChange(value.floatValue || 0);
                      }}
                      decimalScale={2}
                      fixedDecimalScale
                      decimalSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      thousandSeparator="."
                      customInput={Input}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="particularPriceInCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Particular (R$)</FormLabel>
                  <FormControl>
                    <NumericFormat
                      value={field.value || 0}
                      onValueChange={(value) => {
                        field.onChange(value.floatValue || 0);
                      }}
                      decimalScale={2}
                      fixedDecimalScale
                      decimalSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      thousandSeparator="."
                      customInput={Input}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={upsertPartnerExamAction.isPending}
            className="w-full"
          >
            {upsertPartnerExamAction.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UpsertPartnerExamForm;
