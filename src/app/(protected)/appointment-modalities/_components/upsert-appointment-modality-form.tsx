"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointmentModality } from "@/actions/upsert-appointment-modality";
import { Button } from "@/components/ui/button";
import {
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
import { appointmentModalitiesTable } from "@/db/schema";

const formSchema = z.object({
  code: z.string().trim().min(1, {
    message: "Código é obrigatório.",
  }),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  category: z.string().trim().min(1, {
    message: "Categoria é obrigatória.",
  }),
  description: z.string().optional().or(z.literal("")),
});

interface UpsertAppointmentModalityFormProps {
  isOpen: boolean;
  modality?: typeof appointmentModalitiesTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertAppointmentModalityForm = ({
  modality,
  onSuccess,
  isOpen,
}: UpsertAppointmentModalityFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: modality?.code ?? "",
      name: modality?.name ?? "",
      category: modality?.category ?? "",
      description: modality?.description ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        code: modality?.code ?? "",
        name: modality?.name ?? "",
        category: modality?.category ?? "",
        description: modality?.description ?? "",
      });
    }
  }, [isOpen, form, modality]);

  const upsertAppointmentModalityAction = useAction(upsertAppointmentModality, {
    onSuccess: () => {
      toast.success("Modalidade salva com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar modalidade.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAppointmentModalityAction.execute({
      ...values,
      id: modality?.id,
    });
  };

  const categoryOptions = [
    "Consultas Especializadas",
    "Fisioterapia",
    "Exames Ocupacionais",
    "Estética",
    "Exames Laboratoriais",
    "Odontologia",
    "Exames de Imagem",
    "Exames Especializados",
  ];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {modality ? modality.name : "Adicionar modalidade"}
        </DialogTitle>
        <DialogDescription>
          {modality
            ? "Edite as informações dessa modalidade."
            : "Adicione uma nova modalidade de agendamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: consulta_clinico_geral"
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
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Consulta Clínico Geral"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição da modalidade..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertAppointmentModalityAction.isPending}
              className="w-full"
            >
              {upsertAppointmentModalityAction.isPending
                ? "Salvando..."
                : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentModalityForm;
