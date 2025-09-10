"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDocumentAction } from "@/actions/upsert-document";
import { upsertDocumentSchema } from "@/actions/upsert-document/schema";
import { Button } from "@/components/ui/button";
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

type Patient = { id: string; name: string };
type Doctor = { id: string; name: string };

interface UpsertDocumentFormProps {
  patients: Patient[];
  doctors: Doctor[];
  document?: {
    id: string;
    patientId: string;
    doctorId: string;
    type:
      | "anamnesis"
      | "prescription"
      | "medical_certificate"
      | "exam_request"
      | "medical_report"
      | "other";
    title: string;
    content: string;
  };
  defaultValues?: {
    type?:
      | "anamnesis"
      | "prescription"
      | "medical_certificate"
      | "exam_request"
      | "medical_report"
      | "other";
    title?: string;
    content?: string;
  };
  onSuccess?: () => void;
}

const documentTypeOptions = [
  { value: "anamnesis", label: "Anamnese" },
  { value: "prescription", label: "Receita" },
  { value: "medical_certificate", label: "Atestado" },
  { value: "exam_request", label: "Solicitação de Exame" },
  { value: "medical_report", label: "Relatório Médico" },
  { value: "other", label: "Outro" },
];

export function UpsertDocumentForm({
  patients,
  doctors,
  document,
  defaultValues,
  onSuccess,
}: UpsertDocumentFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof upsertDocumentSchema>>({
    resolver: zodResolver(upsertDocumentSchema),
    defaultValues: {
      id: document?.id,
      patientId: document?.patientId || "",
      doctorId: document?.doctorId || "",
      type: document?.type || defaultValues?.type || "anamnesis",
      title: document?.title || defaultValues?.title || "",
      content: document?.content || defaultValues?.content || "",
    },
  });

  const { execute, isExecuting } = useAction(upsertDocumentAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Documento salvo com sucesso!");
      if (document?.id) {
        router.push(`/documents/${document.id}`);
      } else {
        onSuccess?.();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar documento");
    },
  });

  const onSubmit = (values: z.infer<typeof upsertDocumentSchema>) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/*  Selects empilhados (1 coluna sempre) */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    {/*  largura total */}
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
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
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    {/*  largura total */}
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo de tipo do documento também full e em linha própria */}
        <div className="grid grid-cols-1 gap-4">
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
                    {/*  largura total */}
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

          {/* Título fica abaixo do select de tipo */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o título do documento"
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o conteúdo do documento..."
                  className="min-h-[300px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Salvando..." : document ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
