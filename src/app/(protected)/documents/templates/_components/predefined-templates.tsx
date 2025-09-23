"use client";

import { Eye, FileText, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UpsertDocumentForm } from "../../_components/upsert-document-form";
import { predefinedTemplates } from "./predefined-templates-data";
import { UpsertTemplateForm } from "./upsert-template-form";

interface PredefinedTemplatesProps {
  patients: Array<{ id: string; name: string }>;
  doctors: Array<{ id: string; name: string }>;
}

export function PredefinedTemplates({
  patients,
  doctors,
}: PredefinedTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof predefinedTemplates)[0] | null
  >(null);

  const handleTemplateSelect = (template: (typeof predefinedTemplates)[0]) => {
    setSelectedTemplate(template);
    setOpen(true);
  };

  const handleViewTemplate = (template: (typeof predefinedTemplates)[0]) => {
    setSelectedTemplate(template);
    setViewOpen(true);
  };

  const handleCreateDocument = (template: (typeof predefinedTemplates)[0]) => {
    setSelectedTemplate(template);
    setDocumentOpen(true);
  };

  // Agrupar templates por tipo
  const templatesByType = predefinedTemplates.reduce(
    (acc, template) => {
      if (!acc[template.type]) {
        acc[template.type] = [];
      }
      acc[template.type].push(template);
      return acc;
    },
    {} as Record<string, typeof predefinedTemplates>,
  );

  const typeLabels = {
    anamnesis: "Anamnese",
    prescription: "Receita",
    medical_certificate: "Atestado",
    exam_request: "Solicitação de Exame",
    referral_form: "Encaminhamento",
    other: "Outros",
  };

  return (
    <>
      <div className="space-y-8">
        {Object.entries(templatesByType).map(([type, templates]) => (
          <div key={type} className="space-y-4">
            {/* Cabeçalho da seção */}
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {typeLabels[type as keyof typeof typeLabels]}
              </h3>
              <p className="text-muted-foreground text-sm">
                {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
                disponível{templates.length !== 1 ? "eis" : ""}
              </p>
            </div>

            {/* Grid de templates */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer border transition-all duration-200 hover:shadow-md"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateDocument(template)}
                        className="flex-1"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Usar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                        className="flex-1"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog para criar documento */}
      <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Criar Documento - {selectedTemplate?.title}
            </DialogTitle>
            <DialogDescription>
              Use este template para criar um novo documento médico.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <UpsertDocumentForm
              patients={patients}
              doctors={doctors}
              defaultValues={{
                type: selectedTemplate.type,
                title: selectedTemplate.title,
                content: selectedTemplate.content,
              }}
              onSuccess={() => setDocumentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para criar template */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Criar Template - {selectedTemplate?.title}
            </DialogTitle>
            <DialogDescription>
              Crie um novo template personalizado para documentos médicos.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <UpsertTemplateForm
              template={{
                id: "",
                name: selectedTemplate.title,
                type: selectedTemplate.type,
                content: selectedTemplate.content,
                isActive: true,
              }}
              onSuccess={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar conteúdo */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Conteúdo do Template - {selectedTemplate?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Descrição
                </h3>
                <p className="text-sm">{selectedTemplate.description}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Conteúdo Pré-definido
                </h3>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setViewOpen(false);
                    setDocumentOpen(true);
                  }}
                >
                  Usar Template para Criar Documento
                </Button>
                <Button
                  onClick={() => {
                    setViewOpen(false);
                    setOpen(true);
                  }}
                >
                  Salvar como Template Personalizado
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
