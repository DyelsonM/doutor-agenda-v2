"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPartner } from "@/actions/upsert-partner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { partnersTable } from "@/db/schema";

const formSchema = z.object({
  companyName: z.string().trim().min(1, {
    message: "Razão Social é obrigatória.",
  }),
  tradeName: z.string().trim().optional(),
  cnpj: z.string().trim().min(1, {
    message: "CNPJ é obrigatório.",
  }),
  address: z.string().trim().min(1, {
    message: "Endereço é obrigatório.",
  }),
  responsibleName: z.string().trim().min(1, {
    message: "Nome do responsável é obrigatório.",
  }),
  responsiblePhone: z.string().trim().min(1, {
    message: "Celular do responsável é obrigatório.",
  }),
  receptionPhone1: z.string().trim().optional(),
  receptionPhone2: z.string().trim().optional(),
  receptionPhone3: z.string().trim().optional(),
  paymentFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"], {
    required_error: "Frequência de pagamento é obrigatória.",
  }),
  pixKey: z.string().trim().min(1, {
    message: "Chave PIX é obrigatória.",
  }),
  pixType: z.enum(["cpf", "cnpj", "email", "phone", "random_key"], {
    required_error: "Tipo da chave PIX é obrigatório.",
  }),
});

type Partner = typeof partnersTable.$inferSelect;

interface UpsertPartnerFormProps {
  isOpen: boolean;
  partner?: Partner;
  onSuccess?: () => void;
}

const UpsertPartnerForm = ({
  partner,
  onSuccess,
  isOpen,
}: UpsertPartnerFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: partner?.companyName ?? "",
      tradeName: partner?.tradeName ?? "",
      cnpj: partner?.cnpj ?? "",
      address: partner?.address ?? "",
      responsibleName: partner?.responsibleName ?? "",
      responsiblePhone: partner?.responsiblePhone ?? "",
      receptionPhone1: partner?.receptionPhone1 ?? "",
      receptionPhone2: partner?.receptionPhone2 ?? "",
      receptionPhone3: partner?.receptionPhone3 ?? "",
      paymentFrequency: partner?.paymentFrequency ?? undefined,
      pixKey: partner?.pixKey ?? "",
      pixType: partner?.pixType ?? undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        companyName: partner?.companyName ?? "",
        tradeName: partner?.tradeName ?? "",
        cnpj: partner?.cnpj ?? "",
        address: partner?.address ?? "",
        responsibleName: partner?.responsibleName ?? "",
        responsiblePhone: partner?.responsiblePhone ?? "",
        receptionPhone1: partner?.receptionPhone1 ?? "",
        receptionPhone2: partner?.receptionPhone2 ?? "",
        receptionPhone3: partner?.receptionPhone3 ?? "",
        paymentFrequency: partner?.paymentFrequency ?? undefined,
        pixKey: partner?.pixKey ?? "",
        pixType: partner?.pixType ?? undefined,
      });
    }
  }, [isOpen, form, partner]);

  const upsertPartnerAction = useAction(upsertPartner, {
    onSuccess: () => {
      toast.success("Parceiro salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar parceiro.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertPartnerAction.execute({
      ...values,
      id: partner?.id,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {partner ? "Editar Parceiro" : "Adicionar Parceiro"}
        </DialogTitle>
        <DialogDescription>
          {partner
            ? "Edite as informações do parceiro."
            : "Adicione um novo parceiro."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados da Empresa</h3>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Digite a razão social"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Digite o nome fantasia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="##.###.###/####-##"
                      mask="_"
                      placeholder="00.000.000/0000-00"
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value.value);
                      }}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Digite o endereço completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dados do Responsável */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados do Responsável</h3>

            <FormField
              control={form.control}
              name="responsibleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Digite o nome do responsável"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsiblePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
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
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Telefones de Recepção */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recepção - Agendamento</h3>

            <FormField
              control={form.control}
              name="receptionPhone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone 1</FormLabel>
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
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receptionPhone2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone 2</FormLabel>
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
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receptionPhone3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone 3</FormLabel>
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
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Configurações de Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Pagamento</h3>

            <FormField
              control={form.control}
              name="paymentFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamentos</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">45 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pixType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo da Chave PIX</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="random_key">
                        Chave Aleatória
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pixKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Digite a chave PIX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={upsertPartnerAction.isPending}
            className="w-full"
          >
            {upsertPartnerAction.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UpsertPartnerForm;
