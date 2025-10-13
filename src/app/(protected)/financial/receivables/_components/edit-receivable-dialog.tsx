"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { updateReceivableAction } from "@/actions/receivables";
import { convertToCents } from "@/helpers/financial";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateReceivableSchema } from "@/actions/receivables/schema";

const categoryLabels = {
  consultation: "Consulta",
  procedure: "Procedimento",
  examination: "Exame",
  treatment: "Tratamento",
  medication: "Medicação",
  equipment_rental: "Aluguel de Equipamento",
  professional_service: "Serviço Profissional",
  insurance_reimbursement: "Reembolso de Seguro",
  other: "Outros",
};

interface Doctor {
  id: string;
  name: string;
  specialty?: string | null;
}

interface Receivable {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  dueDate: Date;
  doctorId?: string | null;
  patientName?: string | null;
  patientDocument?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  doctor?: {
    id: string;
    name: string;
  } | null;
}

interface EditReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable | null;
  doctors: Doctor[];
  onSuccess?: () => void;
}

export function EditReceivableDialog({
  open,
  onOpenChange,
  receivable,
  doctors,
  onSuccess,
}: EditReceivableDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateReceivableSchema>>({
    resolver: zodResolver(updateReceivableSchema),
    defaultValues: {
      id: "",
      description: "",
      amountInCents: 0,
      category: "consultation",
      dueDate: new Date(),
      doctorId: "none",
      patientName: "",
      patientDocument: "",
      invoiceNumber: "",
      notes: "",
    },
  });

  // Reset form when receivable changes
  React.useEffect(() => {
    if (receivable) {
      form.reset({
        id: receivable.id,
        description: receivable.description,
        amountInCents: receivable.amountInCents / 100, // Converter de centavos para reais
        category: receivable.category as any,
        dueDate: receivable.dueDate,
        doctorId: receivable.doctorId || "none",
        patientName: receivable.patientName || "",
        patientDocument: receivable.patientDocument || "",
        invoiceNumber: receivable.invoiceNumber || "",
        notes: receivable.notes || "",
      });
    }
  }, [receivable, form]);

  const { execute: updateReceivable } = useAction(updateReceivableAction, {
    onSuccess: ({ data }) => {
      toast.success(data.message);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar conta a receber");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: z.infer<typeof updateReceivableSchema>) => {
    setIsSubmitting(true);
    updateReceivable({
      ...values,
      amountInCents: convertToCents(values.amountInCents),
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  if (!receivable) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Conta a Receber</DialogTitle>
          <DialogDescription>
            Edite as informações da conta a receber
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Consulta médica - Dr. João"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountInCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
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
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">
                            Nenhum profissional
                          </span>
                        </SelectItem>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                            {doctor.specialty && (
                              <span className="text-muted-foreground ml-1">
                                - {doctor.specialty}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ do cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123.456.789-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da nota fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-001/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
