"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertGoldClient } from "@/actions/upsert-gold-client";
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
import { Separator } from "@/components/ui/separator";
import { goldClientsTable, goldClientDependentsTable } from "@/db/schema";

const dependentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  birthDate: z.date().optional(),
});

const formSchema = z.object({
  holderName: z.string().trim().optional().or(z.literal("")),
  holderCpf: z.string().trim().optional().or(z.literal("")),
  holderPhone: z.string().trim().optional().or(z.literal("")),
  holderBirthDate: z.date().optional(),
  holderAddress: z.string().trim().optional().or(z.literal("")),
  holderZipCode: z.string().trim().optional().or(z.literal("")),
  dependents: z.array(dependentSchema).max(10, {
    message: "Máximo de 10 dependentes permitidos.",
  }),
});

type GoldClientWithDependents = typeof goldClientsTable.$inferSelect & {
  dependents: (typeof goldClientDependentsTable.$inferSelect)[];
};

interface UpsertGoldClientFormProps {
  isOpen: boolean;
  goldClient?: GoldClientWithDependents;
  onSuccess?: () => void;
}

const UpsertGoldClientForm = ({
  goldClient,
  onSuccess,
  isOpen,
}: UpsertGoldClientFormProps) => {
  const [dependentsCount, setDependentsCount] = useState(
    goldClient?.dependents?.length || 0,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      holderName: goldClient?.holderName ?? "",
      holderCpf: goldClient?.holderCpf ?? "",
      holderPhone: goldClient?.holderPhone ?? "",
      holderBirthDate: goldClient?.holderBirthDate ?? undefined,
      holderAddress: goldClient?.holderAddress ?? "",
      holderZipCode: goldClient?.holderZipCode ?? "",
      dependents:
        goldClient?.dependents?.map((dep) => ({
          id: dep.id,
          name: dep.name,
          phone: dep.phone,
          birthDate: dep.birthDate,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dependents",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        holderName: goldClient?.holderName ?? "",
        holderCpf: goldClient?.holderCpf ?? "",
        holderPhone: goldClient?.holderPhone ?? "",
        holderBirthDate: goldClient?.holderBirthDate ?? undefined,
        holderAddress: goldClient?.holderAddress ?? "",
        holderZipCode: goldClient?.holderZipCode ?? "",
        dependents:
          goldClient?.dependents?.map((dep) => ({
            id: dep.id,
            name: dep.name,
            phone: dep.phone,
            birthDate: dep.birthDate,
          })) ?? [],
      });
      setDependentsCount(goldClient?.dependents?.length || 0);
    }
  }, [isOpen, form, goldClient]);

  const upsertGoldClientAction = useAction(upsertGoldClient, {
    onSuccess: () => {
      toast.success("Cliente Ouro salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar Cliente Ouro.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertGoldClientAction.execute({
      ...values,
      id: goldClient?.id,
    });
  };

  const addDependent = () => {
    if (dependentsCount < 10) {
      append({
        name: "",
        phone: "",
        birthDate: new Date(),
      });
      setDependentsCount(dependentsCount + 1);
    }
  };

  const removeDependent = (index: number) => {
    remove(index);
    setDependentsCount(dependentsCount - 1);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {goldClient ? "Editar Cliente Ouro" : "Adicionar Cliente Ouro"}
        </DialogTitle>
        <DialogDescription>
          {goldClient
            ? "Edite as informações do cliente ouro e seus dependentes."
            : "Adicione um novo cliente ouro com seus dependentes."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados do Titular */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados do Titular</h3>

            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome completo do titular"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="holderCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF (opcional)</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="###.###.###-##"
                        mask="_"
                        placeholder="000.000.000-00"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value.value);
                        }}
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holderPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        placeholder="(11) 99999-9999"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value.value);
                        }}
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="holderBirthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holderAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o endereço completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holderZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP (opcional)</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="#####-###"
                      mask="_"
                      placeholder="00000-000"
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value.value);
                      }}
                      customInput={Input}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Dependentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dependentes</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addDependent}
                disabled={dependentsCount >= 10}
              >
                Adicionar Dependente ({dependentsCount}/10)
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Dependente {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDependent(index)}
                  >
                    Remover
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`dependents.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dependents.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="(##) #####-####"
                            mask="_"
                            placeholder="(11) 99999-9999"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value.value);
                            }}
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`dependents.${index}.birthDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value)
                                : undefined,
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={upsertGoldClientAction.isPending}
            className="w-full"
          >
            {upsertGoldClientAction.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UpsertGoldClientForm;
