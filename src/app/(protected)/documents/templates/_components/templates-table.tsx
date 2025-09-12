"use client";

import { Download, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDocumentTemplateAction } from "@/actions/delete-document-template";
import { exportTemplateAction } from "@/actions/export-template";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportTemplateToPDF } from "@/helpers/export-document";

import { UpsertTemplateForm } from "./upsert-template-form";

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
  createdAt: Date;
  updatedAt: Date | null;
}

interface TemplatesTableProps {
  templates: DocumentTemplate[];
}

const documentTypeLabels: Record<DocumentTemplate["type"], string> = {
  anamnesis: "Anamnese",
  prescription: "Receita",
  medical_certificate: "Atestado",
  exam_request: "Solicitação de Exame",
  medical_report: "Relatório Médico",
  referral_form: "Encaminhamento",
  other: "Outro",
};

const documentTypeColors: Record<DocumentTemplate["type"], string> = {
  anamnesis: "bg-blue-100 text-blue-800",
  prescription: "bg-green-100 text-green-800",
  medical_certificate: "bg-yellow-100 text-yellow-800",
  exam_request: "bg-purple-100 text-purple-800",
  medical_report: "bg-red-100 text-red-800",
  referral_form: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export function TemplatesTable({ templates }: TemplatesTableProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute: deleteTemplate, isExecuting: isDeletingTemplate } =
    useAction(deleteDocumentTemplateAction, {
      onSuccess: () => {
        toast.success("Template excluído com sucesso!");
        setIsDeleteDialogOpen(false);
        setSelectedTemplate(null);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao excluir template");
      },
    });

  const { execute: exportTemplate, isExecuting: isExportingTemplate } =
    useAction(exportTemplateAction, {
      onSuccess: async ({ data }) => {
        if (data) {
          try {
            await exportTemplateToPDF(data);
            toast.success("Template exportado com sucesso!");
          } catch (error) {
            toast.error("Erro ao exportar template");
            console.error("Erro na exportação:", error);
          }
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao exportar template");
      },
    });

  const handleEdit = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleView = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = (template: DocumentTemplate) => {
    exportTemplate({ id: template.id });
  };

  const confirmDelete = () => {
    if (selectedTemplate) {
      deleteTemplate({ id: selectedTemplate.id });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="text-muted-foreground h-8 w-8" />
                    <p className="text-muted-foreground">
                      Nenhum template encontrado
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Crie seu primeiro template de documento
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge className={documentTypeColors[template.type]}>
                      {documentTypeLabels[template.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                    >
                      {template.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR").format(
                      template.createdAt,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(template)}
                        disabled={isExportingTemplate}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <UpsertTemplateForm
              template={selectedTemplate}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Visualizar Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Nome
                </h3>
                <p>{selectedTemplate.name}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Tipo
                </h3>
                <Badge className={documentTypeColors[selectedTemplate.type]}>
                  {documentTypeLabels[selectedTemplate.type]}
                </Badge>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Conteúdo
                </h3>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template &quot;
              {selectedTemplate?.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeletingTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingTemplate ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
