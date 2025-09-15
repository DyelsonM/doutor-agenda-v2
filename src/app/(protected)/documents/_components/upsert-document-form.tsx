"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDocumentAction } from "@/actions/upsert-document";
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

// Importar templates pré-definidos
import { predefinedTemplates } from "../templates/_components/predefined-templates-data";

type Patient = { id: string; name: string };
type Doctor = { id: string; name: string };
type DocumentTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
  isActive: boolean;
};

interface UpsertDocumentFormProps {
  patients: Patient[];
  doctors: Doctor[];
  templates?: DocumentTemplate[];
  document?: {
    id: string;
    patientId: string;
    doctorId: string;
    type:
      | "anamnesis"
      | "prescription"
      | "medical_certificate"
      | "exam_request"
      | "referral_form"
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
      | "referral_form"
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
  { value: "referral_form", label: "Encaminhamento" },
  { value: "other", label: "Outro" },
];

export function UpsertDocumentForm({
  patients,
  doctors,
  templates = [],
  document,
  defaultValues,
  onSuccess,
}: UpsertDocumentFormProps) {
  const router = useRouter();
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [selectedPredefinedTemplate, setSelectedPredefinedTemplate] =
    useState<string>("");

  // Schema dinâmico baseado na seleção do template
  const dynamicSchema = z.object({
    id: z.string().uuid().optional(),
    patientId: z.string().uuid("Selecione um paciente"),
    doctorId: z.string().uuid("Selecione um médico"),
    type: z.enum(
      [
        "anamnesis",
        "prescription",
        "medical_certificate",
        "exam_request",
        "medical_report",
        "referral_form",
        "other",
      ],
      {
        required_error: "Selecione um tipo de documento",
      },
    ),
    title:
      selectedTemplateName || selectedPredefinedTemplate
        ? z.string().optional().or(z.literal(""))
        : z
            .string()
            .min(1, "Título é obrigatório")
            .max(255, "Título deve ter no máximo 255 caracteres"),
    content:
      selectedTemplateName || selectedPredefinedTemplate
        ? z.string().optional().or(z.literal(""))
        : z.string().min(1, "Conteúdo é obrigatório"),
  });

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      id: document?.id,
      patientId: document?.patientId || "",
      doctorId: document?.doctorId || "",
      type: document?.type || defaultValues?.type || "anamnesis",
      title: document?.title || defaultValues?.title || "",
      content: document?.content || defaultValues?.content || "",
    },
  });

  // Atualizar o resolver quando o template muda
  useEffect(() => {
    form.clearErrors();
    // Força a revalidação do formulário
    form.trigger();
  }, [selectedTemplateName, selectedPredefinedTemplate, form]);

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

  const onSubmit = (values: z.infer<typeof dynamicSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Selected template name:", selectedTemplateName);

    // Garantir que title e content sejam strings não vazias
    const submitValues = {
      ...values,
      title: values.title || "",
      content: values.content || "",
    };

    execute(submitValues);
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

          {/* Template selector - apenas para novos documentos */}
          {!document?.id && (
            <div className="space-y-4">
              {/* Templates pré-definidos */}
              <div>
                <label className="text-sm font-medium">
                  Usar Template Pré-definido
                </label>
                <Select
                  onValueChange={(templateId) => {
                    if (templateId === "none") {
                      // Limpar campos se escolher "não usar template"
                      form.setValue("type", "anamnesis");
                      form.setValue("content", "");
                      form.setValue("title", "");
                      setSelectedPredefinedTemplate("");
                      setSelectedTemplateName("");
                      return;
                    }

                    // Encontrar o template pré-definido
                    const template = predefinedTemplates.find(
                      (t) => t.id === templateId,
                    );

                    if (template) {
                      form.setValue(
                        "type",
                        template.type as
                          | "anamnesis"
                          | "prescription"
                          | "medical_certificate"
                          | "exam_request"
                          | "medical_report"
                          | "referral_form"
                          | "other",
                      );
                      form.setValue("content", template.content);
                      form.setValue("title", template.title);
                      setSelectedPredefinedTemplate(template.title);
                      setSelectedTemplateName("");

                      toast.success(
                        `Template "${template.title}" aplicado! (tipo, título e conteúdo)`,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha um template pré-definido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Criar documento em branco
                    </SelectItem>
                    {Object.entries(
                      predefinedTemplates.reduce(
                        (acc, template) => {
                          if (!acc[template.type]) {
                            acc[template.type] = [];
                          }
                          acc[template.type].push(template);
                          return acc;
                        },
                        {} as Record<string, typeof predefinedTemplates>,
                      ),
                    ).map(([type, templates]) => (
                      <div key={type}>
                        <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                          {
                            documentTypeOptions.find(
                              (opt) => opt.value === type,
                            )?.label
                          }
                        </div>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-1 text-xs">
                  Templates pré-definidos com conteúdo estruturado para cada
                  tipo de documento.
                </p>
              </div>

              {/* Templates personalizados da clínica */}
              {templates.length > 0 && (
                <div>
                  <label className="text-sm font-medium">
                    Usar Template Personalizado da Clínica
                  </label>
                  <Select
                    onValueChange={(templateId) => {
                      if (templateId === "none") {
                        // Limpar campos se escolher "não usar template"
                        form.setValue("type", "anamnesis");
                        form.setValue("content", "");
                        form.setValue("title", "");
                        setSelectedTemplateName("");
                        setSelectedPredefinedTemplate("");
                        return;
                      }

                      const selectedTemplate = templates.find(
                        (t) => t.id === templateId,
                      );
                      if (selectedTemplate) {
                        // Preencher automaticamente com dados do template
                        form.setValue(
                          "type",
                          selectedTemplate.type as
                            | "anamnesis"
                            | "prescription"
                            | "medical_certificate"
                            | "exam_request"
                            | "medical_report"
                            | "referral_form"
                            | "other",
                        );

                        // Só sobrescrever o conteúdo se o template tiver conteúdo
                        if (
                          selectedTemplate.content &&
                          selectedTemplate.content.trim()
                        ) {
                          form.setValue("content", selectedTemplate.content);
                        }

                        // Só sobrescrever o título se o template tiver nome
                        if (
                          selectedTemplate.name &&
                          selectedTemplate.name.trim()
                        ) {
                          form.setValue("title", selectedTemplate.name);
                        }

                        setSelectedTemplateName(selectedTemplate.name);
                        setSelectedPredefinedTemplate("");

                        // Mostrar feedback visual baseado no que foi aplicado
                        const appliedFields = [];
                        if (
                          selectedTemplate.content &&
                          selectedTemplate.content.trim()
                        ) {
                          appliedFields.push("conteúdo");
                        }
                        if (
                          selectedTemplate.name &&
                          selectedTemplate.name.trim()
                        ) {
                          appliedFields.push("título");
                        }
                        appliedFields.push("tipo");

                        toast.success(
                          `Template "${selectedTemplate.name}" aplicado! (${appliedFields.join(", ")})`,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um template personalizado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Não usar template personalizado
                      </SelectItem>
                      {templates
                        .filter((template) => template.isActive)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            📄 {template.name} -{" "}
                            {
                              documentTypeOptions.find(
                                (opt) => opt.value === template.type,
                              )?.label
                            }
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Templates personalizados criados pela sua clínica.
                  </p>
                </div>
              )}

              {/* Feedback visual */}
              {(selectedTemplateName || selectedPredefinedTemplate) && (
                <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-2">
                  <p className="text-sm text-green-800">
                    ✅ Template &quot;
                    <strong>
                      {selectedTemplateName || selectedPredefinedTemplate}
                    </strong>
                    &quot; aplicado com sucesso!
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Campos aplicados: tipo de documento, título e conteúdo
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Os campos título e conteúdo foram preenchidos
                    automaticamente. Você pode editar após salvar o documento.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Título fica abaixo do select de tipo - só mostra se não usar template */}
          {!selectedTemplateName && !selectedPredefinedTemplate && (
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
          )}
        </div>

        {/* Conteúdo - só mostra se não usar template */}
        {!selectedTemplateName && !selectedPredefinedTemplate && (
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
        )}

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Salvando..." : document ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
