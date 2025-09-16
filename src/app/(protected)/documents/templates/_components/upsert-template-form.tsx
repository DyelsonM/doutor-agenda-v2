"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDocumentTemplateAction } from "@/actions/upsert-document-template";
import { upsertDocumentTemplateSchema } from "@/actions/upsert-document-template/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface DocumentTemplate {
  id: string;
  name: string;
  type:
    | "anamnesis"
    | "prescription"
    | "medical_certificate"
    | "exam_request"
    | "medical_report"
    | "referral_form"
    | "other";
  content: string;
  isActive: boolean;
}

interface UpsertTemplateFormProps {
  template?: DocumentTemplate;
  onSuccess?: () => void;
}

const documentTypeOptions = [
  { value: "anamnesis", label: "Anamnese" },
  { value: "prescription", label: "Receita" },
  { value: "medical_certificate", label: "Atestado" },
  { value: "exam_request", label: "Solicitação de Exame" },
  { value: "medical_report", label: "Relatório Médico" },
  { value: "referral_form", label: "Encaminhamento" },
  { value: "other", label: "Outro" },
];

export function UpsertTemplateForm({
  template,
  onSuccess,
}: UpsertTemplateFormProps) {
  const form = useForm<z.infer<typeof upsertDocumentTemplateSchema>>({
    resolver: zodResolver(upsertDocumentTemplateSchema),
    defaultValues: {
      id: template?.id,
      name: template?.name || "",
      type: template?.type || "anamnesis",
      content: template?.content || "",
      isActive: template?.isActive ?? true,
    },
  });

  const { execute, isExecuting } = useAction(upsertDocumentTemplateAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Template salvo com sucesso!");
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar template");
    },
  });

  const onSubmit = (values: z.infer<typeof upsertDocumentTemplateSchema>) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Template *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Receita Padrão, Atestado Médico..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento *</FormLabel>
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
                    {documentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Template ativo</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Templates inativos não aparecerão na lista de seleção
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo do Template</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o conteúdo do template (opcional)..."
                  className="min-h-[400px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Salvando..." : template ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
