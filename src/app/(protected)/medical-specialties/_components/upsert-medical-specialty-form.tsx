"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertMedicalSpecialty } from "@/actions/upsert-medical-specialty";
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
import { medicalSpecialtiesTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nome é obrigatório.",
  }),
  category: z.string().min(1, {
    message: "Categoria é obrigatória.",
  }),
});

const CATEGORIES = [
  { value: "Medicina", label: "Medicina" },
  { value: "Terapeutas", label: "Terapeutas" },
  { value: "Odontologia", label: "Odontologia" },
  { value: "Estética", label: "Estética" },
  { value: "Diagnóstico", label: "Diagnóstico" },
  { value: "Outros", label: "Outros" },
];

type MedicalSpecialty = typeof medicalSpecialtiesTable.$inferSelect;

interface UpsertMedicalSpecialtyFormProps {
  isOpen: boolean;
  specialty?: MedicalSpecialty;
  onSuccess?: () => void;
}

const UpsertMedicalSpecialtyForm = ({
  specialty,
  onSuccess,
  isOpen,
}: UpsertMedicalSpecialtyFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: specialty?.name ?? "",
        category: specialty?.category ?? "",
      });
    }
  }, [isOpen, form, specialty]);

  const upsertMedicalSpecialtyAction = useAction(upsertMedicalSpecialty, {
    onSuccess: () => {
      toast.success(
        specialty
          ? "Especialidade atualizada com sucesso."
          : "Especialidade criada com sucesso.",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.serverError || "Erro ao salvar especialidade.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertMedicalSpecialtyAction.execute({
      id: specialty?.id,
      ...values,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onSuccess?.()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {specialty ? "Editar Especialidade" : "Nova Especialidade"}
          </DialogTitle>
          <DialogDescription>
            {specialty
              ? "Edite as informações da especialidade médica."
              : "Adicione uma nova especialidade médica à sua clínica."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cardiologista" {...field} />
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
                  <FormLabel>Categoria</FormLabel>
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
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={upsertMedicalSpecialtyAction.isPending}
              >
                {upsertMedicalSpecialtyAction.isPending
                  ? "Salvando..."
                  : specialty
                    ? "Atualizar"
                    : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertMedicalSpecialtyForm;
